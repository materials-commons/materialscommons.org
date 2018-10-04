#!/usr/bin/env python

import rethinkdb as rdb
import requests
from os import environ
from os import path as os_path
from collections import OrderedDict
from random import randint

PORT = 30815
USER_ID = 'test@test.mc'
APIKEY = 'totally-bogus'

# noinspection SpellCheckingInspection
STOP_LIST = ['account_requests', 'background_process', 'deletedprocesses', 'globus_auth_info',
             'globus_uploads', 'machines', 'templates', 'ui', 'uploads', 'user2share',
             'usergroups', 'userprofiles', 'users',
             # new items added from analysis
             'elements', 'comments','machines', 'note2item', 'runs'
             ]

GLENNS_LIST = ['userprofiles', 'usergroups', 'tags', 'tag2item', 'runs', 'reviews', 'review2item',
               'machines', 'ui', 'elements', 'sample2sample', 'shares', 'user2share', 'experimenttasks',
               'experiment2experimenttask', 'experimeenttask2process', 'experimentnotes',
               'comments', 'comment2item'
               ]


class StubApiInterface:
    def __init__(self, apikey):
        self.disable_warnings()
        self.apikey_params = {'apikey': apikey}
        self.mcurl = "http://mcdev.localhost/api"

    def get(self, restpath):
        r = requests.get(restpath, params=self.apikey_params, verify=False)
        if r.status_code == requests.codes.ok:
            return r.json()
        r.raise_for_status()

    def post(self, restpath, data):
        data = OrderedDict(data)
        r = requests.post(
            restpath, params=self.apikey_params, verify=False, json=data
        )
        if r.status_code == requests.codes.ok:
            return r.json()
        r.raise_for_status()

    def put(self, restpath, data):
        r = requests.put(
            restpath, params=self.apikey_params, verify=False, json=data
        )
        if r.status_code == requests.codes.ok:
            return r.json()
        r.raise_for_status()

    def delete(self, restpath):
        r = requests.delete(restpath, params=self.apikey_params, verify=False)
        if r.status_code == requests.codes.ok:
            return r.json()
        r.raise_for_status()

    def delete_expect_empty(self, restpath):
        r = requests.delete(restpath, params=self.apikey_params, verify=False)
        if not r.status_code == requests.codes.ok:
            r.raise_for_status()

    def url(self, restpath):
        return self.mcurl + '/v2/' + restpath

    @staticmethod
    def disable_warnings():
        """Temporary fix to disable requests' InsecureRequestWarning"""
        import urllib3
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


class DeleteProjectHelper:
    def __init__(self, apikey, user_id):
        self.conn = rdb.connect('localhost', PORT, db='materialscommons')
        self.user_id = user_id
        self.api = StubApiInterface(apikey)

    def build_project(self):
        project_name = self._fake_name("ProjectForDeleteProbe-")
        project = self._build_sample_project()
        project = self._augment_project(project)
        project = self._rename_project(project, project_name)
        return project

    def delete_project(self, project_id):
        url = self.api.url("projects/{}/fully".format(project_id))
        self.api.delete(url)
        pass

    def _build_sample_project(self):
        url = self.api.url("users/{}/create_demo_project".format(self.user_id))
        data = {}
        ret = self.api.put(url, data)
        return ret

    def _augment_project(self, project):
        # events
        data = {
            "project_id": project['id'],
            "item_type": 'project',
            "item_id": project['id'],
            "item_name": '',
            "event_type": 'test',
            "user": {"id": project['owner']}
        }
        rdb.table('events').insert(data).run(self.conn)

        # measurement2datafile
        # process2setupfile
        # project2dataset
        # sample2datafile

        # create unpulbished dataset and
        #     add to both and experiment and a project
        #     should cover...
        # dataset2datafile
        # dataset2process
        # dataset2sample
        # datasets
        # experiment2dataset
        # project2dataset

        # addition "fake" data
        # experiment_etl_metadata
        # notes

        return project

    def _rename_project(self, project, project_name):
        old_name = project['name']
        print("Renaming project {} --> {}".format(old_name, project_name))
        url = self.api.url("projects/{}".format(project['id']))
        data = {"name": project_name}
        ret = self.api.put(url, data)
        project_id = ret['id']
        ret = self._get_project_by_id(project_id)
        return ret

    def _get_project_by_id(self, project_id):
        url = self.api.url("projects/{}".format(project_id))
        return self.api.get(url)

    @staticmethod
    def _make_test_dir_path():
        test_path = os_path.abspath(environ['TEST_DATA_DIR'])
        test_path = os_path.join(test_path, 'demo_project_data')
        return test_path

    @staticmethod
    def _fake_name(prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number


class DeleteProjectProbe:
    def __init__(self):
        self.conn = rdb.connect('localhost', PORT, db='materialscommons')
        self.helper = DeleteProjectHelper(APIKEY, USER_ID)
        self.pre_condition = {}
        self.post_condition = {}
        self.after_create = {}

    def all_tables(self):
        return rdb.table_list().run(self.conn)

    def candidate_tables(self):
        tables = self.all_tables()
        candidates = []
        for table in tables:
            if not (table in STOP_LIST or table in GLENNS_LIST):
                candidates.append(table)
        return candidates

    def doit(self):
        tables = self.candidate_tables()
        for table in tables:
            results = rdb.table(table).count().run(self.conn)
            self.pre_condition[table] = results
        project = self.helper.build_project()
        print(project)
        print("project id = {}".format(project['id']))
        print("project name = {}".format(project['name']))
        for table in tables:
            results = rdb.table(table).count().run(self.conn)
            self.after_create[table] = results
        print()
        experiments = project['experiments']
        for exp in experiments:
            print("experiment id = {}".format(exp['id']))
        self.helper.delete_project(project['id'])
        for table in tables:
            results = rdb.table(table).count().run(self.conn)
            self.post_condition[table] = results
        print ("-------------- Restored tables -----------")
        for key in tables:
            if not self.pre_condition[key] == 0 \
                    and not self.post_condition[key] == 0 \
                    and self.pre_condition[key] == self.post_condition[key]:
                self.print_table_entry("   ", key)
        print ("------------ Non-Restored tables ----------")
        for key in tables:
            if not self.pre_condition[key] == 0 \
                    and not self.post_condition[key] == 0 \
                    and not self.pre_condition[key] == self.post_condition[key]:
                self.print_table_entry("-->", key)
        print ("------------ Tables in question -----------")
        for key in tables:
            if self.pre_condition[key] == 0 and self.post_condition[key] == 0:
                self.print_table_entry("???", key)

    def print_table_entry(self, mark, key):
        print("   {} {}: {} - {} ({})".
              format(mark, key, self.pre_condition[key], self.post_condition[key], self.after_create[key]))

    def determined_tables_used(self):
        # Assuming empty database
        tables = rdb.table_list().run(self.conn)
        print(tables)
        for table in tables:
            results = rdb.table(table).pluck('owner').run(self.conn)
            if results:
                results = list(results)
                if len(results) > 0 and results[0]:
                    results = results[0]
            print("{} --> {}".format(table, results))

if __name__ == "__main__":
    print("Project Delete Probe... ")
    print("For this probe, USER = {}, APIKEY = {}".format(USER_ID, APIKEY))
    print("Using database on port = {}".format(PORT))
    DeleteProjectProbe().doit()
    print("Done.")
