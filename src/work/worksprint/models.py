# _*_ coding: utf-8 _*_

from django.db.models import Model
from django.db.models import CharField, DateField, DateTimeField, IntegerField, TextField

#class Task(models.Model):
#
#
#    name = CharField(max_length=255)





class Round(Model):



    comments = TextField(blank=True)
    
    begin = DateTimeField(blank=True, null=True)
    end = DateTimeField(blank=True, null=True)
