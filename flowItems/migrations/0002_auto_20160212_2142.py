# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('flowItems', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('ph', models.CharField(verbose_name='現象', max_length=20)),
                ('itemNexts', models.ManyToManyField(related_name='_item_itemNexts_+', to='flowItems.Item')),
            ],
            options={
                'ordering': ['ph'],
            },
        ),
        migrations.RenameModel(
            old_name='Tags',
            new_name='Tag',
        ),
        migrations.RemoveField(
            model_name='items',
            name='itemsnext',
        ),
        migrations.RemoveField(
            model_name='items',
            name='relatedTags',
        ),
        migrations.DeleteModel(
            name='Items',
        ),
        migrations.AddField(
            model_name='item',
            name='relatedTags',
            field=models.ManyToManyField(to='flowItems.Tag'),
        ),
    ]
