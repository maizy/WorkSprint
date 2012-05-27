# _*_ coding: utf-8 _*_

__license__         = "GPL3"
__copyright__       = "Copyright 2012 dev.maizy.ru"
__author__          = "Nikita Kovaliov <nikita@maizy.ru>"

__version__         = "0.1"
__doc__             = ""

def user_details(request):
    """
    @type request: django.http.HttpRequest

    """

    c = {'is_logged_in' : False}

    #@type user: django.contrib.auth.models.User
    user = request.user
    if not user:
        return c

    if user.is_authenticated and user.is_active:
        c['is_logged_in'] = True

        name = user.get_full_name()
        if len(name) == 0:
            name = user.username
        c['user_name'] = name

    return c