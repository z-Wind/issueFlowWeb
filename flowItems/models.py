from django.db import models


# Create your models here.
class Body(models.Model):
    code = models.CharField(verbose_name='代碼', max_length=10)
    name = models.CharField(verbose_name='實體', max_length=20)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['code']


class Event(models.Model):
    body = models.ForeignKey(Body)
    describe = models.CharField(verbose_name='行為描述', max_length=50)
    related = models.ManyToManyField('self', blank=True, verbose_name='相關')
    s_count = models.PositiveIntegerField(verbose_name='搜尋次數', default=0)

    def __str__(self):
        return self.body.name + " : " + self.describe

    class Meta:
        ordering = ['-s_count']
