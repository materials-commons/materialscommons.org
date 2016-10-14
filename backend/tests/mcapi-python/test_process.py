import pytest
import rethinkdb as r


conn = r.connect('localhost', 30815, db='materialscommons')
p_id = 12345

def get_processes(id):
    return [1]


def test_get_processes_for_project():
    processes = get_processes(p_id)
    assert len(processes) > 0