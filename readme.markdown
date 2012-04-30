# WorkSprint

Proof of concept. Pre-beta.


# WorkSprint (ru)

Проверка на жизнеспособность идеи. Ещё даже не beta.

----


# Install instructions

Tested on Ubuntu 10.10 Maveric

## Install pre-requirements

    sudo apt-get install python-2.7 python2.7-dev libmysqlclient-dev \
                         python-setuptools build-essential
    sudo easy_install-2.7 -U virtualenv
    sudo easy_install-2.7 -U pip

## Install worksprint

A. choose parent folder (for example at your home dir)

    cd ~/


B. Clone repository

    git clone git://github.com/maizy/WorkSprint.git worksprint


C. Create & activate virtualenv

    virtualenv --distribute --python=/usr/bin/python2.7 worksprint
    cd worksprint
    source bin/activate


D. install requirements

    pip install -r requirements.txt

E. install database

    src/tools/install-mysql.sh


F. run initial migrations

    **TODO**

G. deactivate virtualenv

    deactivate


## Standalone server (easy)
**TODO**

## System configure (advanced, run as service)

A. add init.d script

**TODO** (see src/sys-conf-examples/etc/init.d/worksprint)

B. configure webserver virtual host (ex. nginx)

**TODO** (see src/sys-conf-examples/etc/nginx/sites-available/worksprint)

C. start fastcgi server, restart webserver

    service worksprint start
    servive nginx restart
