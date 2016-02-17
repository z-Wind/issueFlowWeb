from django.shortcuts import render

from django.http import JsonResponse
from django.core import serializers

from .models import *
from .forms import *
import json


# Create your views here.
def issueFlow(request, first_id):
    f = ItemForm()
    return render(request, 'issueFlow.html', locals())


def getItems(request):
    dic = {"error": "Error Contact"}
    if request.is_ajax():
        try:
            dic = {}
            for id in request.GET.getlist('id[]'):
                item = Item.objects.get(pk=id)
                dic.update({
                    'id': item.id,
                    'ph': item.ph,
                    'relatedTags': [{f.name: getattr(t, f.name)
                                     for f in Tag._meta.fields}
                                    for t in item.relatedTags.all()],
                    'itemNext': [{f.name: getattr(i, f.name)
                                  for f in Item._meta.fields}
                                 for i in item.itemNexts.all()],
                })
        except Item.DoesNotExist:
            dic = {'error': 'Not Found'}
    return JsonResponse(dic)


def createItems(request):
    dic = {"error": "Error Contact"}
    if request.is_ajax():
        f = ItemForm(request.POST)
        if f.is_valid():
            ph = f.cleaned_data['ph']
            relatedTags = f.cleaned_data['relatedTags']
            itemNexts = f.cleaned_data['itemNexts']
            pre_item = f.cleaned_data['pre_item']

            item, created = Item.objects.get_or_create(ph=ph)
            for obj in relatedTags:
                item.relatedTags.add(obj)
            for obj in itemNexts:
                item.itemNexts.add(obj)

            pre_item.itemNexts.add(item)

            dic = {'id': item.id}
        else:
            dic = {'id': 0,
                   'errors': f.errors, }
    return JsonResponse(dic)
