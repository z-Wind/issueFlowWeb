from django.contrib import admin

# Register your models here.
from flowItems.models import *


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Tag._meta.fields if f.name != 'id']


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = [f.name for f in Item._meta.fields if f.name != 'id']
    list_display += ['get_tags', 'get_items']
    list_filter = ('relatedTags',)

    def get_tags(self, obj):
        return "\n".join([t.name for t in obj.relatedTags.all()])

    def get_items(self, obj):
        return "\n".join([i.ph for i in obj.itemNexts.all()])
