from django.contrib import admin

# Register your models here.
from flowItems.models import *


@admin.register(Body)
class BodyAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Body._meta.fields if f.name != 'id']


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Event._meta.fields if f.name != 'id']
    list_display += ['get_related']
    list_filter = ('body',)

    def get_related(self, obj):
        return "\n".join([e.describe for e in obj.related.all()])
