from django import forms

# modules from django
from django.forms.extras.widgets import SelectDateWidget
from .models import *


class SearchForm(forms.Form):
    searchStr = forms.CharField(required=False,
                                widget=forms.TextInput(
                                    # 'autofocus': 'autofocus'
                                    attrs={'class': 'form-control',
                                           'name': 'searchStr',
                                           'placeholder': 'Search Node (space = or, empty = all)',
                                           'autocomplete': 'off'}),
                                label='搜尋')


class EventForm(forms.ModelForm):
    now_event = forms.ModelChoiceField(
            required=False,
            queryset=Event.objects.all(),
            label='目前節點',
            widget=forms.Select(attrs={'disabled': 'disabled'}))

    now_event_body = forms.ModelChoiceField(
            required=False,
            queryset=Body.objects.all(),
            label='目前實體',
            widget=forms.Select(attrs={'disabled': 'disabled'}))

    bodyName = forms.CharField(
            label='實體',
            widget=forms.TextInput(),
            max_length=15)

    class Meta:
        model = Event
        fields = ['now_event_body', 'now_event', 'bodyName', 'describe']
