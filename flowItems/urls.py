from django.conf.urls import include, url
from .views import *

urlpatterns = [
    url(r'^issueFlow/(?P<first_id>\d*)$', issueFlow,
        name="flowItemissueFlow"),
    url(r'^search/$', search, name="flowItemsSearch"),
    url(r'^newNode/$', newNode, name="flowItemsNewNode"),
    url(r'^getItems/$', getItems, name="flowItemsGetItems"),
    url(r'^createItems/$', createItems, name="flowItemsCreateItems"),
    url(r'^renameItems/$', renameItems, name="flowItemsRenameItems"),
]
