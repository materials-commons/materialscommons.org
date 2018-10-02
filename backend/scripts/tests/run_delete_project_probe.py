#!/usr/bin/env python

import rethinkdb as r
from os import environ
from os import path as os_path
from random import randint
from optparse import OptionParser

# noinspection PyUnresolvedReferences
from demo_project import DemoProject

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


class DeleteProjectProbe:
    def __init__(self, db_port):
        self.conn = r.connect('localhost', db_port, db='materialscommons')
        self.pre_condition = {}
        self.post_condition = {}

    def doit(self):
        tables = TABLES
        for table in tables:
            results = r.table(table).count().run(self.conn)
            self.pre_condition[table] = results
        project = self._build_project()
        print("project id = {}".format(project.id))
        print("project name = {}".format(project.name))
        experiments = project.get_all_experiments()
        for exp in experiments:
            print("experiment id = {}".format(exp.id))
        project.delete()
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

    def _build_project(self):
        project_name = self._fake_name("Project-Delete-Test-")

        self.test_project_name = project_name

        builder = DemoProject(self._make_test_dir_path())

        project = builder.build_project()
        project = project.rename(project_name)

        return project

    @staticmethod
    def _make_test_dir_path():
        test_path = os_path.abspath(environ['TEST_DATA_DIR'])
        test_path = os_path.join(test_path, 'demo_project_data')
        return test_path

    @staticmethod
    def _fake_name(prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int", help="rethinkdb port", default=30815)

    (options, args) = parser.parse_args()

    port = options.port
    print("Using database port = {}".format(port))

    DeleteProjectProbe(port).doit()
