from django.db import models


# Create your models here.
class Tag(models.Model):
    code = models.CharField(verbose_name='代碼', max_length=10)
    name = models.CharField(verbose_name='標籤', max_length=20)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['code']


class Item(models.Model):
    ph = models.CharField(verbose_name='現象', max_length=20)
    relatedTags = models.ManyToManyField(Tag, blank=True, verbose_name='標籤')
    itemNexts = models.ManyToManyField('self', blank=True, verbose_name='下一步')

    def __str__(self):
        return self.ph

    class Meta:
        ordering = ['ph']
