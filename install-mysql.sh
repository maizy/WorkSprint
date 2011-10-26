#!/bin/bash

# TODO: ask for user, pass, db ...
# TODO: auto write django configs
# TODO: install-sqlite.sh


echo '* Add mysql database and user'

INIT_SQL=$( cat <<SQL
CREATE DATABASE \`sprint\` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE USER 'sprint'@'localhost' IDENTIFIED BY 'sprint';
GRANT USAGE ON * . * TO  'sprint'@'localhost'
    IDENTIFIED BY  'sprint'
    WITH MAX_QUERIES_PER_HOUR 0
    MAX_CONNECTIONS_PER_HOUR 0
    MAX_UPDATES_PER_HOUR 0
    MAX_USER_CONNECTIONS 0 ;
GRANT ALL PRIVILEGES ON  \`sprint\` . * TO  'sprint'@'localhost';
SQL
)

echo '> Mysql root password, please:'
echo "${INIT_SQL}"| mysql --user=root --password

if [ $? -eq 0 ];then
    echo '* Db created'
else
    echo "! Something went wrong :( - mysql return code ${?}"
    exit 1
fi

SCRIPT_PATH=$(cd ${0%/*} && echo $PWD/${0##*/})
WEB_ROOT="`dirname "$SCRIPT_PATH"`/work"

echo '* Create databases'

$WEB_ROOT/manage.py syncdb

echo '* Done'