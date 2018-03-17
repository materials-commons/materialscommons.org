import getpass
import json
import os
from collections import OrderedDict
from os.path import join

import requests

class ApiConnection:
    def __init__(self):
        self.mcorg = Remote()
        self.current_remote = None
        self.disable_warnings()

    def set_remote(self, remote):
        self.current_remote = remote

    def unset_remote(self):
        self.current_remote = None

    def default_remote_for_mcorg(self):
        return self.mcorg

    def use_remote(self):
        if self.current_remote:
            return self.current_remote
        return self.default_remote_for_mcorg()

    def set_remote_config_url(self, url):
        self.set_remote(Remote(config=Config(override_config={'mcurl': url})))

    def get_remote_config_url(self):
        return self.use_remote().config.mcurl

    def get(self, restpath, remote=None):
        if not remote:
            remote = self.use_remote()
        r = requests.get(restpath, params=remote.config.params, verify=False)
        if r.status_code == requests.codes.ok:
            return r.json()
        r.raise_for_status()

    def post(self, restpath, data, remote=None):
        if not remote:
            remote = self.use_remote()
        data = OrderedDict(data)
        r = requests.post(
            restpath, params=remote.config.params, verify=False, json=data
        )
        if r.status_code == requests.codes.ok:
            return r.json()
        r.raise_for_status()

    def put(self, restpath, data, remote=None):
        if not remote:
            remote = self.use_remote()
        r = requests.put(
            restpath, params=remote.config.params, verify=False, json=data
        )
        if r.status_code == requests.codes.ok:
            return r.json()
        r.raise_for_status()

    def delete(self, restpath, remote=None):
        if not remote:
            remote = self.use_remote()
        r = requests.delete(restpath, params=remote.config.params, verify=False)
        if r.status_code == requests.codes.ok:
            return r.json()
        r.raise_for_status()

    def delete_expect_empty(self, restpath, remote=None):
        if not remote:
            remote = self.use_remote()
        r = requests.delete(restpath, params=remote.config.params, verify=False)
        if not r.status_code == requests.codes.ok:
            r.raise_for_status()

    @staticmethod
    def disable_warnings():
        """Temporary fix to disable requests' InsecureRequestWarning"""
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class Config:
    def __init__(self, config_file_path=None, config_file_name="config.json", override_config=None):
        if not override_config:
            override_config = {}
        if not config_file_path:
            user = getpass.getuser()
            config_file_path = join(os.path.expanduser('~' + user), '.materialscommons')
        config_file = join(config_file_path, config_file_name)

        if os.path.exists(config_file):
            with open(config_file, 'r') as f:
                config = json.load(f)
        else:
            raise Exception("No config file found, " + config_file + ": Run \'mc setup c\'")

        self.config = config
        for key in config:
            self.config[key] = os.getenv(key, config[key])

        for key in override_config:
            self.config[key] = override_config[key]

        self.mcapikey = config['apikey']
        self.mcurl = config['mcurl']
        self.params = {'apikey': self.mcapikey}


class Remote:
    def __init__(self, config=Config()):
        if (not config.mcurl) or (not config.mcapikey):
            raise Exception("Remote not properly configured: mcapikey and mcurl are required")

        self.config = config
        # self.mcurl = config.mcurl
        # self.params = config.params

    def make_url_v2(self, restpath):
        p = self.config.mcurl + '/v2/' + restpath
        return p

    def make_url(self, restpath):
        p = self.config.mcurl + "/" + restpath
        return p
