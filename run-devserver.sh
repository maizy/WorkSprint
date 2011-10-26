#/bin/bash

DEV_HOST=$1
if [ -z "${DEV_HOST}" ]; then
    DEV_HOST='localhost:8100'
fi

SCRIPT_PATH=$(cd ${0%/*} && echo $PWD/${0##*/})
WEB_ROOT="`dirname "$SCRIPT_PATH"`/work"

$WEB_ROOT/manage.py runserver "${DEV_HOST}"