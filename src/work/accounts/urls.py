# -*- coding: utf-8 -*-

__license__         = "GPL3"
__copyright__       = "Copyright 2012 dev.maizy.ru"
__author__          = "Nikita Kovaliov <nikita@maizy.ru>"

__version__         = "0.1"

from django.conf.urls import patterns, include, url

urlpatterns = patterns('django.contrib.auth.views',
    url(r'^login/$', 'login', name='login'),
    url(r'^logout/$', 'logout_then_login', name='logout'),
)