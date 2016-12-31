# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flowItems', '0005_auto_20160224_1633'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='describe',
            field=models.CharField(max_length=50, verbose_name='行為描述'),
        ),
    ]
