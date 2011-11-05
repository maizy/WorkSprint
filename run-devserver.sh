#/bin/bash

SCRIPT_PATH=$(cd ${0%/*} && echo $PWD/${0##*/})
PROJECT_ROOT=`dirname "$SCRIPT_PATH"`
WEB_ROOT="${PROJECT_ROOT}/work"

DEV_HOST=$1
if [ -z "${DEV_HOST}" ]; then
    if [ -f "${PROJECT_ROOT}/devserver-default-host" ]; then
        DEV_HOST=`cat "${PROJECT_ROOT}/devserver-default-host"`
    else
        DEV_HOST='localhost:8800'
    fi
fi

SCRIPT_PATH=$(cd ${0%/*} && echo $PWD/${0##*/})
WEB_ROOT="`dirname "$SCRIPT_PATH"`/work"

$WEB_ROOT/manage.py runserver "${DEV_HOST}"