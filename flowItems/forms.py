from django import forms

# modules from django
from django.forms.extras.widgets import SelectDateWidget
from .models import *


class GoodInquiryForm(forms.Form):
    ph = forms.CharField(required=False,
                         widget=forms.TextInput(attrs={'size': '20'}),
                         label='現象',
                         max_length=30)


class ItemForm(forms.ModelForm):
    pre_item = forms.ModelChoiceField(
            required=False,
            queryset=Item.objects.all(),
            label='上一步',
            widget=forms.Select(attrs={'disabled': 'disabled'}))

    class Meta:
        model = Item
        fields = ['pre_item', 'ph']
