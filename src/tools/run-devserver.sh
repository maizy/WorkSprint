#!/usr/bin/env bash

SCRIPT_PATH=$(cd ${0%/*} && echo $PWD/${0##*/})
PROJECT_ROOT=`dirname "${SCRIPT_PATH}"`
PROJECT_ROOT=`dirname "${PROJECT_ROOT}"`
PROJECT_ROOT=`dirname "${PROJECT_ROOT}"`

WEB_ROOT="${PROJECT_ROOT}/src/work"

#activate virtualenv
source "${PROJECT_ROOT}/bin/activate"


DEV_HOST=$1
if [ -z "${DEV_HOST}" ]; then
    if [ -f "${PROJECT_ROOT}/devserver-default-host" ]; then
        DEV_HOST=`cat "${PROJECT_ROOT}/devserver-default-host"`
    else
        DEV_HOST='localhost:8800'
    fi
fi

echo "Start dev server at ${DEV_HOST}"
$WEB_ROOT/manage.py runserver "${DEV_HOST}"
