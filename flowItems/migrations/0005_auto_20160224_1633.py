# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flowItems', '0004_auto_20160221_1029'),
    ]

    operations = [
        migrations.CreateModel(
            name='Body',
            fields=[
                ('id', models.AutoField(serialize=False, auto_created=True, verbose_name='ID', primary_key=True)),
                ('code', models.CharField(verbose_name='代碼', max_length=10)),
                ('name', models.CharField(verbose_name='實體', max_length=20)),
            ],
            options={
                'ordering': ['code'],
            },
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(serialize=False, auto_created=True, verbose_name='ID', primary_key=True)),
                ('describe', models.CharField(verbose_name='描述', max_length=50)),
                ('s_count', models.PositiveIntegerField(verbose_name='搜尋次數', default=0)),
                ('body', models.ForeignKey(to='flowItems.Body')),
                ('related', models.ManyToManyField(to='flowItems.Event', related_name='_related_+', verbose_name='相關', blank=True)),
            ],
            options={
                'ordering': ['-s_count'],
            },
        ),
        migrations.RemoveField(
            model_name='item',
            name='itemNexts',
        ),
        migrations.RemoveField(
            model_name='item',
            name='relatedTags',
        ),
        migrations.DeleteModel(
            name='Item',
        ),
        migrations.DeleteModel(
            name='Tag',
        ),
    ]
