from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import redirect_to
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import admin


admin.autodiscover()

urlpatterns = patterns('',
    (r'^$', redirect_to, {'url': '/sprint/', 'permanent' : False}),

    #worksprint
    url(r'^sprint/', include('work.worksprint.urls', app_name='worksprint', namespace='ws')),

    #accounts
    url(r'^accounts/', include('work.accounts.urls', app_name='accounts', namespace='ac')),

    #admin
    url(r'^admin/', include(admin.site.urls)),

    #django-jasmine (js tests)
    url(r'^js-tests/', include('django_jasmine.urls')),
)

urlpatterns += staticfiles_urlpatterns()