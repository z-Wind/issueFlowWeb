from django.conf.urls import include, url
from .views import *

urlpatterns = [
    url(r'^issueFlow/$', issueFlow, name="issueFlow"),
    url(r'^getItems/$', getItems, name="getItems"),
    url(r'^createItems/$', createItems, name="createItems"),
]
