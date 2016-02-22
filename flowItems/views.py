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
        ph = inquiry.cleaned_data['ph'].strip()
        if ph:  # contain str
            queryargs = [functools.reduce(operator.__and__,
                         [Q(ph__icontains=c) for c in p]) for p in ph.split()]
            objs = objs.filter(functools.reduce(operator.__or__, queryargs))

    return objs


# get obj data by table heads
def getRowDatas(obj, tableHeads):
    rowDatas = []
    obj_names = {f.verbose_name: f.name for f in obj._meta.fields}

    for tableHead in tableHeads:
        if tableHead in obj_names:
            rowDatas += [getattr(obj, obj_names[tableHead])]
        else:
            rowDatas += [tableHead]

    return rowDatas


# Create your views here.
def issueFlow(request, first_id):
    title = 'IssueFlow'
    nbar_now = 'flowItemissueFlow'
    f = ItemForm()
    
    if(first_id):
        item = Item.objects.get(pk=first_id)
        if item.s_count < 2147483647:
            item.s_count += 1
            item.save()

    return render(request, 'issueFlow.html', locals())


def search(request):
    global alldatas
    nbar_now = 'flowItemsSearch'
    title = 'Search'

    tableheads = ['ID', '現象']

    if 'ok' in request.GET:
        inquiry = GoodInquiryForm(request.GET)
    else:
        inquiry = GoodInquiryForm()

    if not request.GET.get('page') or alldatas['name'] != title:
        alldatas['name'] = title
        alldatas['data'] = []

        for obj in objsInquiryFilter(Item.objects.all(), inquiry):
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


def newNode(request):
    nbar_now = 'flowItemsNewNode'
    title = 'NewNode'

    items = [item for item in Item.objects.all()]

    if 'ok' in request.POST:
        f = ItemForm(request.POST)

        if f.is_valid():
            ph = f.cleaned_data['ph']

            item, created = Item.objects.get_or_create(ph=ph)

            return redirect(reverse("flowItemissueFlow",
                                    kwargs={'first_id': item.id}))
    elif 'ok' in request.GET:
        f = ItemForm(request.GET)
    else:
        f = ItemForm()

    return render(request, 'newNode.html', locals())


def getItems(request):
    dic = {"error": "Error Contact"}
    if request.is_ajax():
        try:
            dic = {}
            for id in request.GET.getlist('id[]'):
                item = Item.objects.get(pk=id)
                dic.update(
                    {
                        id: {
                            'id': item.id,
                            'ph': item.ph,
                            'itemNext_n': item.itemNexts.all().count(),
                            'relatedTags': [{f.name: getattr(t, f.name)
                                             for f in Tag._meta.fields}
                                            for t in item.relatedTags.all()],
                            'itemNext': [{f.name: getattr(i, f.name)
                                          for f in Item._meta.fields}
                                         for i in item.itemNexts.all()],
                        }
                    })
                for i in dic[id]['itemNext']:
                    i.update(
                        {'itemNext_n': Item.objects
                                           .get(pk=i['id']).itemNexts
                                           .all().count()})
        except Item.DoesNotExist:
            dic = {'error': 'Not Found'}
    return JsonResponse(dic)


def createItems(request):
    dic = {"error": "Error Contact"}
    if request.is_ajax():
        f = ItemForm(request.POST)
        if f.is_valid():
            ph = f.cleaned_data['ph']
            relatedTags = f.cleaned_data.get('relatedTags', [])
            itemNexts = f.cleaned_data.get('itemNexts', [])
            pre_item = f.cleaned_data['pre_item']

            item, created = Item.objects.get_or_create(ph=ph)

            for obj in relatedTags:
                item.relatedTags.add(obj)
            for obj in itemNexts:
                if(obj.id != item.id):
                    item.itemNexts.add(obj)

            if(pre_item.id != item.id):
                pre_item.itemNexts.add(item)

            dic = {'id': item.id, 'ph': item.ph}
        else:
            dic = {'id': 0,
                   'errors': f.errors, }
    return JsonResponse(dic)
