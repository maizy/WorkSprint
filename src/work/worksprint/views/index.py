# _*_ coding: utf-8 _*_

from django.http import HttpResponse, HttpResponseNotFound, HttpResponseServerError
from django.shortcuts import render_to_response, redirect
from django.template import RequestContext

import work.worksprint.models as models

def index(request):

    c = {
        'page': {
            'metatitle': 'WorkSprint',
            'title': 'WorkSprint',
        },
    }
    
    return render_to_response('index/index.html', c, context_instance=RequestContext(request))

def times(request):

    c = {
        'page': {
            'metatitle': 'Timer - WorkSprint',
            'title': 'Work Timer',
        },
    }

    return render_to_response('timer/index.html', c, context_instance=RequestContext(request))