import pytest
import rethinkdb as r


conn = r.connect('localhost', 201815, db='materialscommons')

# content of test_sample.py
def get_processes(id):
    return x + 1


def test_get_processes_for_project():
    processes = get_processes(p_id)
    assert len(processes) > 0