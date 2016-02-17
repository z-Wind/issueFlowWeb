from django.conf.urls import include, url
from .views import *

urlpatterns = [
    url(r'^issueFlow/(?P<first_id>\d*)/$', issueFlow, name="issueFlow"),
    url(r'^getItems/$', getItems, name="getItems"),
    url(r'^createItems/$', createItems, name="createItems"),
]
