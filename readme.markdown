# WorkSprint

Proof of concept. Pre-beta.



# Install instructions (OS X, MacPorts)

*Tested on OS X 10.7.2 - 10.7.4*

## Install pre-requirements

    sudo port install python-27 py27-virtualenv
    sudo easy_install-2.7 -U virtualenv

## Install worksprint

### A. choose parent folder (for example at your home dir)

    cd ~/


### B. Clone repository

    git clone git://github.com/maizy/WorkSprint.git worksprint


### C. Create & activate virtualenv

    virtualenv-2.7 --distribute --python=/opt/local/bin/python2.7 worksprint
    cd worksprint
    source bin/activate


### D. Install requirements

    pip install -r requirements.txt

### E. Install database
#### sqlLite

    **TODO**

#### mysql (advanced)

Install requiments and driver:

    # 1. Install mysql client if you don't have one
    #sudo port install mysql5

    # 2. and mysql-server if your database will run localy
    #sudo port install mysql5-server

    # 3. add symlink to mysql_config
    ln -s /opt/local/bin/mysql_config5 bin/mysql_config

    # 4. check that mysql_config in your PATH
    which mysql_config

    # 5. install additional requiments
    pip install -r requirements_mysql.txt

    # 6. you should see message "Successfully installed MySQL-python".
    # If you don't write me issue with build logs.


Create mysql database (use utf8_general_ci collation).

Create mysql user for new database.

Create file src/work/settings_db.py

    # _*_ coding: utf-8 _*_
    def get(settings):
        return {
            'default': {
                'ENGINE': 'django.db.backends.mysql',
                'NAME': 'ws', # database name
                'USER': 'ws_user', # username
                'PASSWORD': 'o_0', # password
                'HOST': '', # mysql hostname (set to empty string for localhost)
                'PORT': '', # Set to empty string for default
                'OPTIONS' : {
                    'init_command': 'SET storage_engine=INNODB, SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED'
                }
            }
        }

### F. Run initial migrations

    python src/work/manage.py syncdb
    python src/work/manage.py migrate

### G. Deactivate virtualenv

    deactivate


## Standalone server
**TODO**

----


# Install instructions (Linux, Ubuntu, deb-based)

*Tested on Ubuntu 10.10 Maveric*

## Install pre-requirements

    sudo apt-get install python2.7 python2.7-dev libmysqlclient-dev \
                         python-setuptools build-essential
    sudo easy_install-2.7 -U virtualenv

## Install worksprint

### A. choose parent folder (for example `~/apps`)

    mkdir -p ~/apps
    cd ~/apps


### B. Clone repository

    git clone git://github.com/maizy/WorkSprint.git worksprint


### C. Create & activate virtualenv

    virtualenv --distribute --python=/usr/bin/python2.7 worksprint
    cd worksprint
    source bin/activate


### D. Install requirements

    pip install -r requirements.txt

### E. Install database

**TODO** (see OSX instractions)


### F. Run initial migrations

**TODO**

### G. deactivate virtualenv

    deactivate


## Standalone server (easy)
**TODO**

## Run as service (advanced)

### A. Add init.d script

**TODO**  (see `src/sys-conf-examples/etc/init.d/worksprint`)

### B. configure webserver virtual host (ex. nginx)

**TODO** (see `src/sys-conf-examples/etc/nginx/sites-available/worksprint`)

### C. start fastcgi server, restart webserver

    service worksprint start
    servive nginx restart
