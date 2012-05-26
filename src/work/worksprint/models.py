# _*_ coding: utf-8 _*_

__license__         = "GPL3"
__copyright__       = "Copyright 2012 dev.maizy.ru"
__author__          = "Nikita Kovaliov <nikita@maizy.ru>"

__version__         = "0.1"
__doc__             = "Worksprint models"

from django.db.models import Model
from django.db.models import CharField, DateTimeField, IntegerField, TextField, ForeignKey

from django.contrib.auth.models import User

class Round(Model):


    comments = TextField(blank=True)
    
    begin = DateTimeField(blank=True, null=True)
    end = DateTimeField(blank=True, null=True)
    interrupt = IntegerField(default=0)

    user = ForeignKey(User)
