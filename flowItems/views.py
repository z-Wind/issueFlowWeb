from django.shortcuts import render
from django.shortcuts import redirect

# modules from django
from django.core.urlresolvers import reverse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.http import JsonResponse
from django.db.models import Q

# Create your views here.
from .models import *
from .forms import *
import json
import functools
import operator

# global variable
alldatas = {'name': None, 'data': []}


# page
def page_setting(objs, pageNum, dataNum=50):
    # Show n contacts per page
    paginator = Paginator(objs, per_page=dataNum)

    try:
        page = paginator.page(pageNum)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        page = paginator.page(1)
    except EmptyPage:
        # If page is out of range (e.g. 9999), deliver last page of results.
        if int(pageNum) > paginator.num_pages:
            page = paginator.page(1)
        else:
            page = paginator.page(paginator.num_pages)

    return page


# inquiry and filter
def objsInquiryFilter(objs, inquiry):
    fnameList = objs.model._meta.get_all_field_names()
    # 尋找分類
    if inquiry.is_valid():
        searchStr = inquiry.cleaned_data['searchStr'].strip()
        if searchStr:  # contain str
            queryargs = [Q(describe__iregex='.*' + '.*'.join(p) + '.*') |
                         Q(body__name__iregex='.*' + '.*'.join(p) + '.*')
                         for p in searchStr.split()]
            objs = objs.filter(functools.reduce(operator.__or__, queryargs))

    return objs


# get obj data by table heads
def getRowDatas(obj, tableHeads):
    rowDatas = []
    obj_names = {f.verbose_name: f.name for f in obj._meta.fields}

    for tableHead in tableHeads:
        if tableHead == '實體':
            if type(obj) is Event:
                rowDatas += [obj.body.name]
            else:
                rowDatas += [getattr(obj, obj_names[tableHead])]
        elif tableHead in obj_names:
            rowDatas += [getattr(obj, obj_names[tableHead])]
        else:
            rowDatas += [tableHead]

    return rowDatas


# event to json
def eventToJson(event):
    dic = {
        'id': event.id,
        'body': {'id': event.body.id, 'name': event.body.name},
        'describe': event.describe,
        'related_n': event.related.all().count(),
        'related': [{
                        'id': e.id,
                        'body': {'id': e.body.id, 'name': e.body.name},
                        'describe': e.describe,
                        'related_n': e.related.all().count(),
                    } for e in event.related.all()],
    }
    return dic


# Create your views here.
def issueFlow(request, first_id):
    title = 'IssueFlow'
    nbar_now = 'flowItemIssueFlow'
    f = EventForm()

    events = [event for event in Event.objects.all()]
    bodys = [body for body in Body.objects.all()]

    if 'ok' in request.GET:
        inquiry = SearchForm(request.GET)
    else:
        inquiry = SearchForm()

    if(first_id):
        event = Event.objects.get(pk=first_id)
        if event.s_count < 2147483647:
            event.s_count += 1
            event.save()

    return render(request, 'issueFlow.html', locals())


def search(request):
    global alldatas
    nbar_now = 'flowItemsSearch'
    title = 'Search'

    tableheads = ['ID', '實體', '行為描述']

    if 'ok' in request.GET:
        inquiry = SearchForm(request.GET)
    else:
        inquiry = SearchForm()

    if not request.GET.get('page') or alldatas['name'] != title:
        alldatas['name'] = title
        alldatas['data'] = []

        for obj in objsInquiryFilter(Event.objects.all(), inquiry):
            alldatas['data'] += [getRowDatas(obj, tableheads[:])]

    page = page_setting(alldatas['data'], request.GET.get('page'))
    tabledatas = page.object_list

    get = request.GET.copy()
    try:
        get.pop('page')
    except KeyError:
        pass
    searchStr = get.urlencode()
    searchStr = '&' + searchStr if searchStr else ''

    return render(request, 'search.html', locals())


def getEventsAjax(request):
    dic = {"error": "Error Contact"}
    if request.is_ajax():
        try:
            dic = {}
            for id in request.GET.getlist('id[]'):
                event = Event.objects.get(pk=id)
                dic[id] = eventToJson(event)
        except Event.DoesNotExist:
            dic = {'error': 'Not Found'}
    return JsonResponse(dic)


def createEvent(f):
    bodyName = f.cleaned_data.get('bodyName')
    try:
        body = Body.objects.get(name=bodyName)
    except Body.DoesNotExist:
        body = Body.objects.create(
                            name=bodyName,
                            code='{:04d}'.format(Body.objects.count()+1))
    except Body.MultipleObjectsReturned:
        raise Body.MultipleObjectsReturned

    describe = f.cleaned_data['describe']
    related = f.cleaned_data.get('related', [])
    now_event = f.cleaned_data['now_event']

    if now_event:
        if now_event.describe == describe and now_event.body == body:
            raise NameError('same object')

    try:
        newEvent = Event.objects.get(body=body, describe=describe)
    except Event.DoesNotExist:
        newEvent = Event.objects.create(body=body, describe=describe)
    except Event.MultipleObjectsReturned:
        raise Event.MultipleObjectsReturned

    if now_event:
        now_event.related.add(newEvent)
    return newEvent


def newEventWeb(request):
    nbar_now = 'flowItemsNewNode'
    title = 'NewEvent'
    errors = []

    events = [event for event in Event.objects.all()]
    bodys = [body for body in Body.objects.all()]

    if 'ok' in request.GET:
        inquiry = SearchForm(request.GET)
    else:
        inquiry = SearchForm()

    if 'ok' in request.POST:
        f = EventForm(request.POST)
        if f.is_valid():
            try:
                event = createEvent(f)
                return redirect(reverse("flowItemIssueFlow",
                                        kwargs={'first_id': event.id}))
            except Body.MultipleObjectsReturned:
                errors += ['Body.MultipleObjectsReturned']
            except Event.MultipleObjectsReturned:
                errors += ['Event.MultipleObjectsReturned']

    elif 'ok' in request.GET:
        f = EventForm({'describe': request.GET['searchStr'],
                       'bodyName': request.GET['searchStr']})
    else:
        f = EventForm()

    return render(request, 'newNode.html', locals())


def insertEventAjax(request):
    dic = {"error": "Error Contact"}
    if request.is_ajax():
        f = EventForm(request.POST)
        if f.is_valid():
            try:
                insertEvent = createEvent(f)
                dic = eventToJson(insertEvent)
            except Body.MultipleObjectsReturned:
                dic = {'id': 0, 'errors': {'now_event_body': ['same name']}}
            except Event.MultipleObjectsReturned:
                dic = {'id': 0, 'errors': {'now_event': ['same name']}}
            except NameError:
                dic = {'id': 0, 'errors': {'now_event': ['same node']}}
        else:
            f = EventForm(request.POST)
            dic = {'id': 0, 'errors': f.errors, }

    return JsonResponse(dic)


def modifyEvent(f):
    now_event = f.cleaned_data['now_event']
    body = None
    describe = f.cleaned_data['describe']

    bodyName = f.cleaned_data.get('bodyName')

    try:
        body = Body.objects.get(name=bodyName)
    except Body.DoesNotExist:
        body = Body.objects.create(
                            name=bodyName,
                            code='{:04d}'.format(Body.objects.count()))
    except Body.MultipleObjectsReturned:
        raise Body.MultipleObjectsReturned

    try:
        Event.objects.get(body=body, describe=describe)
        raise NameError('Exist')
    except Event.DoesNotExist:
        now_event.body = body
        now_event.describe = describe
        now_event.save()
    except Event.MultipleObjectsReturned:
        raise Event.MultipleObjectsReturned

    return now_event


def renameEventAjax(request):
    dic = {"error": "Error Contact"}
    if request.is_ajax():
        f = EventForm(request.POST)
        if f.is_valid():
            try:
                now_event = modifyEvent(f)
                dic = eventToJson(now_event)
            except NameError:
                dic = {'id': 0, 'errors': {'now_event': ['Exist']}}
            except Event.MultipleObjectsReturned:
                dic = {'id': 0, 'errors': {'now_event': ['Duplicated']}}
        else:
            dic = {'id': 0,
                   'errors': f.errors}
    return JsonResponse(dic)
