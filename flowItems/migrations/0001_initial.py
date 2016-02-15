# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Items',
            fields=[
                ('id', models.AutoField(primary_key=True, verbose_name='ID', auto_created=True, serialize=False)),
                ('ph', models.CharField(verbose_name='現象', max_length=20)),
                ('itemsnext', models.ManyToManyField(to='flowItems.Items', related_name='_items_itemsnext_+')),
            ],
            options={
                'ordering': ['ph'],
            },
        ),
        migrations.CreateModel(
            name='Tags',
            fields=[
                ('id', models.AutoField(primary_key=True, verbose_name='ID', auto_created=True, serialize=False)),
                ('code', models.CharField(verbose_name='代碼', max_length=10)),
                ('name', models.CharField(verbose_name='標籤', max_length=20)),
            ],
            options={
                'ordering': ['code'],
            },
        ),
        migrations.AddField(
            model_name='items',
            name='relatedTags',
            field=models.ManyToManyField(to='flowItems.Tags'),
        ),
    ]
