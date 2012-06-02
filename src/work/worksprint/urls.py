# -*- coding: utf-8 -*-

__license__ = "GPL3"
__copyright__ = "Copyright 2012 dev.maizy.ru"
__author__ = "Nikita Kovaliov <nikita@maizy.ru>"

from django.conf.urls.defaults import patterns, include, url

urlpatterns = patterns('work.worksprint.views.index',
    url(r'^$', 'index', name='index'),
)

urlpatterns += patterns('work.worksprint.views.timer',
    url(r'^timer/$', 'index', name='timer-index'),
)
