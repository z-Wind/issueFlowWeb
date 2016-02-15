from django import forms

# modules from django
from django.forms.extras.widgets import SelectDateWidget
from .models import *


class ItemForm(forms.ModelForm):
    pre_item = forms.ModelChoiceField(
        queryset=Item.objects.all(),
        label='上一步',
        widget=forms.Select(attrs={'disabled': 'disabled'}))

    class Meta:
        model = Item
        fields = ['pre_item', 'ph', 'relatedTags', 'itemNexts']
