# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flowItems', '0002_auto_20160212_2142'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='itemNexts',
            field=models.ManyToManyField(blank=True, to='flowItems.Item', related_name='_item_itemNexts_+'),
        ),
        migrations.AlterField(
            model_name='item',
            name='relatedTags',
            field=models.ManyToManyField(blank=True, to='flowItems.Tag'),
        ),
    ]
