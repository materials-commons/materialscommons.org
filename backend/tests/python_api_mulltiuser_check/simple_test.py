import logging
import sys
from random import randint

from materials_commons.api import create_project
from materials_commons.api import _use_remote as use_remote, _set_remote as set_remote


class SimpleTest1:
    def __init__(self, name, apikey1, apikey2):
        self.log = logging.getLogger(self.__class__.__name__ + "::" + name)
        self.log.info("init: keys = {}, {}".format(apikey1, apikey2))
        self.name = name
        self.apikey1 = apikey1
        self.apikey2 = apikey2

    def run(self, with_error):
        self.log.info("running: with_error flag = {}".format(with_error))
        # noinspection PyBroadException
        try:
            self.log.info("SimpleTest1")
            self._set_up_remote_for(self.apikey1)
            self.log.info("with apikey = {}".format(self.apikey1))
            project1 = self.make_project(apikey=self.apikey1)
            self.log.info("project, {}, owner = {}".format(project1.name, project1.owner))
            experiment1 = self.make_experiment(project1)
            self.log.info("experiment, {}, owner = {}".format(experiment1.name, experiment1.owner))

            self._set_up_remote_for(self.apikey2)
            self.log.info("with apikey = {}".format(self.apikey1))
            project2 = self.make_project(apikey=self.apikey2)
            self.log.info("project, {}, owner = {}".format(project2.name, project2.owner))
            if with_error:
                self._set_up_remote_for(self.apikey1)
            experiment2 = self.make_experiment(project2)
            self.log.info("experiment, {}, owner = {}".format(experiment2.name, experiment2.owner))

        except BaseException:
            self.log.exception("Exception in worker {}".format(self.name))

    def make_project(self, apikey=None):
        name = self.fake_name("Project-")
        description = "Auto generated for test"
        return create_project(name, description, apikey=apikey)

    def make_experiment(self, project):
        name = self.fake_name("Experiment-")
        description = "Auto generated for test"
        return project.create_experiment(name, description)

    @staticmethod
    def fake_name(prefix):
        number = "%05d" % randint(0, 99999)
        return prefix + number

    @staticmethod
    def _set_up_remote_for(key):
        remote = use_remote()
        remote.config.mcapikey = key
        remote.config.params = {'apikey': key}
        set_remote(remote)


if __name__ == "__main__":
    root = logging.getLogger()
    root.setLevel(logging.INFO)

    ch = logging.StreamHandler(sys.stdout)
    ch.setLevel(logging.INFO)
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(name)s - %(lineno)s - %(message)s')
    ch.setFormatter(formatter)
    root.addHandler(ch)

    startup_log = logging.getLogger("top_level_setup")
    test = SimpleTest1("test1-no-error","totally-bogus","another-bogus-account")
    test.run(True)