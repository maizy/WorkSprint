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

1. choose parent folder (for example at your home dir)

    cd ~/


2. Clone repository

    git clone git://github.com/maizy/WorkSprint.git worksprint


3. Create & activate virtualenv

    virtualenv --distribute --python=/usr/bin/python2.7 worksprint
    cd worksprint
    source bin/activate


4. install requirements

    pip install -r requirements.txt

5. install database

    src/tools/install-mysql.sh


6. run initial migrations

    **TODO**

7. deactivate virtualenv

    deactivate


## Standalone server (easy)
**TODO**

## System configure (advanced, run as service)

1. add init.d script

**TODO** (see src/sys-conf-examples/etc/init.d/worksprint)

2. configure webserver virtual host (ex. nginx)

**TODO** (see src/sys-conf-examples/etc/nginx/sites-available/worksprint)

3. start fastcgi server, restart webserver

    service worksprint start
    servive nginx restart
