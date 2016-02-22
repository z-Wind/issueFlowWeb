# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flowItems', '0003_auto_20160212_2145'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='item',
            options={'ordering': ['s_count']},
        ),
        migrations.AddField(
            model_name='item',
            name='s_count',
            field=models.PositiveIntegerField(default=0, verbose_name='搜尋次數'),
        ),
        migrations.AlterField(
            model_name='item',
            name='itemNexts',
            field=models.ManyToManyField(blank=True, to='flowItems.Item', verbose_name='下一步', related_name='_item_itemNexts_+'),
        ),
        migrations.AlterField(
            model_name='item',
            name='relatedTags',
            field=models.ManyToManyField(blank=True, to='flowItems.Tag', verbose_name='標籤'),
        ),
    ]
