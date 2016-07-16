from django.conf.urls import include, url
from django.contrib.auth.views import login  # 利用內建的view funciton
from .views import *

urlpatterns = [
    url(r'^issueFlow/(?P<first_id>(?:\d*|total))$', issueFlow,
        name="flowItemIssueFlow"),
    url(r'^search/$', search, name="flowItemsSearch"),
    url(r'^newEventWeb/$', newEventWeb, name="flowItemsNewEventWeb"),
    url(r'^getEventsAjax/$', getEventsAjax, name="flowItemsGetEventsAjax"),
    url(r'^insertEventAjax/$', insertEventAjax,
        name="flowItemsInsertEventAjax"),
    url(r'^renameEventAjax/$', renameEventAjax,
        name="flowItemsRenameEventAjax"),
    url(r'^deleteEventAjax/$', deleteEventAjax,
        name="flowItemsDeleteEventAjax"),
    url(r'^accounts/login/$', login, name="login"),
]
