#!/usr/bin/env python

import rethinkdb as r
import requests
from os import environ
from os import path as os_path
from collections import OrderedDict
from random import randint

PORT = 30815
USER_ID = 'test@test.mc'
APIKEY = 'totally-bogus'

# noinspection SpellCheckingInspection
TABLES = ['access', 'best_measure_history', 'comments', 'datadir2datafile', 'datadirs',
          'datafiles', 'dataset2datafile', 'dataset2experimentnote', 'dataset2process',
          'dataset2sample', 'datasets', 'deletedprocesses', 'elements', 'events',
          'experiment2datafile', 'experiment2dataset', 'experiment2experimentnote',
          'experiment2experimenttask', 'experiment2process', 'experiment2sample',
          'experiment_etl_metadata', 'experimentnotes', 'experiments', 'experimenttask2process',
          'experimenttasks', 'machines', 'measurement2datafile',
          'measurements', 'note2item', 'notes', 'process2file', 'process2measurement',
          'process2sample', 'process2setup', 'process2setupfile', 'processes',
          'project2datadir', 'project2datafile', 'project2dataset', 'project2experiment',
          'project2process', 'project2sample', 'projects', 'properties', 'property2measurement',
          'propertyset2property', 'propertysets', 'review2item', 'reviews', 'runs',
          'sample2datafile', 'sample2propertyset', 'sample2sample', 'samples',
          'setupproperties', 'setups', 'shares', 'tag2item', 'tags']

# Check: project2dataset
# these tables are not getting reset by project delete:
#             datadirs
#             process2setup
#             properties
#             property2measurement
#             propertyset2property
#             propertysets
#             sample2propertyset
#             setupproperties


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
        self.user_id = user_id
        self.api = StubApiInterface(apikey)

    def build_project(self):
        project_name = self._fake_name("ProjectForDeleteProbe-")
        project = self._build_sample_project()
        project = self._rename_project(project, project_name)
        return project

    def delete_project(self, project_id):
        pass

    def _build_sample_project(self):
        url = self.api.url("users/{}/create_demo_project".format(self.user_id))
        data = {}
        ret = self.api.put(url, data)
        return ret

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
        self.conn = r.connect('localhost', PORT, db='materialscommons')
        self.helper = DeleteProjectHelper(APIKEY, USER_ID)
        self.pre_condition = {}
        self.post_condition = {}

    def doit(self):
        tables = TABLES
        for table in tables:
            results = r.table(table).count().run(self.conn)
            self.pre_condition[table] = results
        project = self.helper.build_project()
        print("project id = {}".format(project['id']))
        print("project name = {}".format(project['name']))
        print()
        experiments = project['experiments']
        for exp in experiments:
            print("experiment id = {}".format(exp['id']))
        self.helper.delete_project(project['id'])
        for table in tables:
            results = r.table(table).count().run(self.conn)
            self.post_condition[table] = results
        for key in tables:
            mark = "-->" if not self.pre_condition[key] == self.post_condition[key] else "   "
            print("{} {}: {} - {}".format(mark, key, self.pre_condition[key], self.post_condition[key]))

    def determined_tables_used(self):
        # Assuming empty database
        tables = r.table_list().run(self.conn)
        print(tables)
        for table in tables:
            results = r.table(table).pluck('owner').run(self.conn)
            if results:
                results = list(results)
                if len(results) > 0 and results[0]:
                    results = results[0]
            print("{} --> {}".format(table, results))

if __name__ == "__main__":
    print("Using database on port = {}".format(PORT))
    print("For this probe, USER = {}, APIKEY = {}".format(USER_ID, APIKEY))
    DeleteProjectProbe().doit()
