#!/usr/bin/env python

import rethinkdb as r
from optparse import OptionParser

PROJECTID = ""


class DatabaseError(Exception):
    pass


class Process(object):
    def __init__(self, name, owner, template_id, project_id,
                 description):
        self.name = name
        self.owner = owner
        self.description = description
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.template_id = template_id

        # Are we going to version processes? If so
        # we will need a process history table.
        self.version = ""
        self._type = "process"


class Project2Process(object):
    def __init__(self, project_id, process_id):
        self.project_id = project_id
        self.process_id = process_id


class Sample(object):
    def __init__(self, name, description, owner):
        self.name = name
        self.description = description
        self.owner = owner
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self._type = "sample"


class Sample2File(object):
    def __init__(self, sample_id, file_id):
        self.sample_id = sample_id
        self.datafile_id = file_id


# TODO: Rename class and table to better reflect what it does.
class Process2Sample(object):
    def __init__(self, sample_id, process_id, attribute_set_id):
        self.sample_id = sample_id
        self.process_id = process_id
        self.attribute_set_id = attribute_set_id


class Project2Sample(object):
    def __init__(self, project_id, sample_id):
        self.sample_id = sample_id
        self.project_id = project_id


class Sample2AttributeSet(object):
    def __init__(self, attribute_set_id, sample_id, version, current):
        self.attribute_set_id = attribute_set_id
        self.sample_id = sample_id
        self.version = version
        self.current = current


class AttributeSet(object):
    def __init__(self, name, display_name, current, parent_id):
        self.name = name
        self.display_name = display_name

        # May not need current since it is in the join table
        self.current = current
        self.parent_id = parent_id
        self._type = "attribute_set"


class AttributeSet2Attribute(object):
    def __init__(self, attribute_set_id, attribute_id):
        self.attribute_id = attribute_id
        self.attribute_set_id = attribute_set_id


class Value(object):
    def __init__(self):
        self.properties = {}

    def add_property(self, name, prop):
        self.properties[name] = prop.__dict__


class Property(object):
    def __init__(self, _type, value, units, nvalue, nunits):
        self._type = _type
        self.value = value
        self.units = units
        self.nvalue = nvalue
        self.nunits = nunits


class Attribute(object):
    def __init__(self):
        self.parent_id = ""
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.name = ""
        self.best_measure_id = ""
        self._type = "attribute"


class Attribute2Process(object):
    def __init__(self, attribute_id, process_id):
        self.attribute_id = attribute_id
        self.process_id = process_id


class Measurement(Value):
    def __init__(self, process_id):
        Value.__init__(self)
        self.process_id = process_id
        self._type = "measurement"


class Attribute2Measurement(object):
    def __init__(self, attribute_id, measurement_id):
        self.attribute_id = attribute_id
        self.measurement_id = measurement_id


class BestMeasureHistory(object):
    def __init__(self, attribute_id, measurement_id):
        self.attribute_id = attribute_id
        self.measurement_id = measurement_id
        self.when = r.now()
        self._type = "best_measure_history"


class DataFile(object):
    def __init__(self, name, owner, checksum, mediatype, size):
        self.name = name
        self.owner = owner
        self._type = "datafile"
        self.atime = r.now()
        self.birthtime = self.atime
        self.mtime = self.atime
        self.checksum = checksum
        self.current = True
        self.description = self.name
        self.mediatype = mediatype
        self.parent = ""
        self.size = size
        self.uploaded = self.size
        self.usesid = ""


class Project(object):
    def __init__(self, name, owner):
        self._type = "project"
        self.name = name
        self.owner = owner
        self.description = name
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.size = 0
        self.mediatypes = {}


class DataDir(object):
    def __init__(self, name, owner, parent):
        self._type = "datadir"
        self.name = name
        self.owner = owner
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.parent = parent


class User(object):
    def __init__(self, name, apikey):
        self._type = "user"
        self.id = name
        self.fullname = name
        self.apikey = apikey
        self.last_login = r.now()
        self.birthtime = self.last_login
        self.mtime = self.birthtime
        self.email = self.id
        self.password = ""
        self.preferences = {
            "tags": [],
            "templates": []
        }


def create_table(table, conn, *args):
    run(r.table_create(table), conn)
    for index_name in args:
        create_index(table, index_name, conn)


def create_index(table, name, conn):
    run(r.table(table).index_create(name), conn)


def run(rql, conn):
    try:
        rql.run(conn)
    except r.RqlRuntimeError:
        pass


def insert(item, table, conn):
    rv = r.table(table).insert(item, return_changes=True).run(conn)
    if rv['inserted'] == 1 or rv['replaced'] == 1:
        if 'changes' in rv:
            return rv['changes'][0]['new_val']
        else:
            return rv['new_val']
    raise DatabaseError()


def update(db_id, what, table, conn):
    r.table(table).get(db_id).update(what).run(conn)


def create_db(port):
    print "Creating samplesdb..."
    conn = r.connect("localhost", port)
    run(r.db_drop("samplesdb"), conn)
    run(r.db_create("samplesdb"), conn)
    conn.close()
    print "Done..."


def make_tables(conn):
    print "Creating tables..."
    create_table("users", conn)
    create_table("projects", conn, "name", "owner")
    create_table("processes", conn, "template_id")
    create_table("project2process", conn, "project_id", "process_id")
    create_table("samples", conn)
    create_table("sample2datafile", conn, "sample_id", "datafile_id")
    create_table("sample2attribute_set", conn, "sample_id",
                 "attribute_set_id")
    create_table("attribute_set2attribute", conn, "attribute_set_id",
                 "attribute_id")
    create_table("attribute_sets", conn, "parent_id")
    create_table("project2sample", conn, "sample_id", "project_id")
    create_table("process2sample", conn, "sample_id", "process_id",
                 "attribute_set_id")
    create_table("attribute2process", conn, "attribute_id",
                 "process_id")
    create_table("processes", conn)
    create_table("attributes", conn, "parent_id")
    create_table("measurements", conn, "process_id")
    create_table("attribute2measurement", conn, "attribute_id",
                 "measurement_id")
    create_table("best_measure_history", conn, "process_id", "attribute_id")
    print "Done..."


def add_measurement(name, prop, attr_id, process_id, conn):
    m = Measurement(process_id)
    m.add_property(name, prop)
    rv = insert(m.__dict__, "measurements", conn)
    m_id = rv['id']
    a2m = Attribute2Measurement(attr_id, m_id)
    insert(a2m.__dict__, "attribute2measurement", conn)
    return m_id


def add_process(proc, conn):
    rv = insert(proc.__dict__, "processes", conn)
    process_id = rv['id']
    p2proc = Project2Process(PROJECTID, process_id)
    insert(p2proc.__dict__, "project2process", conn)
    return process_id


def add_attribute_set(sample_id, aset, conn):
    rv = insert(aset.__dict__, "attribute_sets", conn)
    as_id = rv['id']
    s2as = Sample2AttributeSet(as_id, sample_id, 0, True)
    insert(s2as.__dict__, "sample2attribute_set", conn)
    return as_id


def add_attribute(as_id, attr, conn):
    rv = insert(attr.__dict__, "attributes", conn)
    attr_id = rv['id']
    as2a = AttributeSet2Attribute(as_id, attr_id)
    insert(as2a.__dict__, "attribute_set2attribute", conn)
    return attr_id


def add_attribute_id(as_id, attr_id, conn):
    as2a = AttributeSet2Attribute(as_id, attr_id)
    insert(as2a.__dict__, "attribute_set2attribute", conn)


def add_best_measure(attr_id, m_id, conn):
    update(attr_id, {"best_measure_id": m_id}, "attributes", conn)
    best = BestMeasureHistory(attr_id, m_id)
    insert(best.__dict__, "best_measure_history", conn)


def clear_current(sample_id, conn):
    r.db("samplesdb").table("sample2attribute_set")\
                     .get_all(sample_id, index="sample_id")\
                     .update({"current": False})\
                     .run(conn)


def create_sample1(conn):
    # Set up sample with initial attribute set
    s = Sample("sample1", "Initial sample", "test@mc.org")
    rv = insert(s.__dict__, "samples", conn)
    sample_id = rv['id']
    p2s = Project2Sample(PROJECTID, sample_id)
    insert(p2s.__dict__, "project2sample", conn)

    process = Process("as_received", "test@mc.org", "",
                      PROJECTID, "receive sample1")
    process_id = add_process(process, conn)

    aset = AttributeSet("as_received", "Initial Attributes", True, "")
    as_id = add_attribute_set(sample_id, aset, conn)
    attr = Attribute()
    attr.name = "composition"
    attr_id = add_attribute(as_id, attr, conn)
    comp_attr_id = attr_id

    p2s = Process2Sample(sample_id, process_id, as_id)
    insert(p2s.__dict__, "process2sample", conn)

    # add measurement
    p = Property("json", {"mg": 0.1}, "aw", {"mg": 0.1}, "aw")
    m1_id = add_measurement("composition", p, attr_id, process_id, conn)
    add_best_measure(attr_id, m1_id, conn)

    # Add new process and measurement
    process = Process("sem", "test@mc.org", "", PROJECTID,
                      "measure composition")
    sem_process_id = add_process(process, conn)
    p2s = Process2Sample(sample_id, sem_process_id, as_id)
    insert(p2s.__dict__, "process2sample", conn)

    p = Property("json", {"mg": 0.2}, "aw", {"mg": 0.2}, "aw")
    m2_id = add_measurement("composition", p, attr_id, sem_process_id, conn)
    add_best_measure(attr_id, m2_id, conn)

    #
    # Add second attribute - Grain size
    #
    attr = Attribute()
    attr.name = "grain_size"
    attr_id = add_attribute(as_id, attr, conn)

    # Add a couple of measurements for the grain size attribute
    p = Property("number", 1.08, "mm", 1.08, "mm")
    add_measurement("grain_size", p, attr_id, sem_process_id, conn)
    p = Property("number", 1.1, "mm", 1.1, "mm")
    add_measurement("grain_size", p, attr_id, sem_process_id, conn)
    p = Property("number", 1.09, "mm", 1.09, "mm")
    m3_id = add_measurement("grain_size", p, attr_id, sem_process_id, conn)
    add_best_measure(attr_id, m3_id, conn)

    transform_sample1(sample_id, comp_attr_id, conn)


def transform_sample1(sample_id, comp_attr_id, conn):
    # Create the transforming process
    process = Process("heat_treatment", "test@mc.org", "", PROJECTID,
                      "heat treat sample1")
    process_id = add_process(process, conn)

    # Create a new attribute set since we transformed the sample

    # Mark existing attributes for sample as not current
    clear_current(sample_id, conn)
    aset = AttributeSet("heat_treatment", "heat treated", True, "")
    as_id = add_attribute_set(sample_id, aset, conn)

    # TODO: Add API call to do this, or update existing API call to do it
    p2s = Process2Sample(sample_id, process_id, as_id)
    insert(p2s.__dict__, "process2sample", conn)

    # Create new attribute set that changes grain size
    # but leaves composition the same.
    attr = Attribute()
    attr.name = "grain_size"
    attr_id = add_attribute(as_id, attr, conn)

    # Add measurements
    p = Property("number", 2.01, "mm", 2.01, "mm")
    add_measurement("grain_size", p, attr_id, process_id, conn)

    p = Property("number", 2.02, "mm", 2.02, "mm")
    add_measurement("grain_size", p, attr_id, process_id, conn)

    p = Property("number", 2.02, "mm", 2.02, "mm")
    m_id = add_measurement("grain_size", p, attr_id, process_id, conn)
    add_best_measure(attr_id, m_id, conn)

    # Bring over the composition attribute
    add_attribute_id(as_id, comp_attr_id, conn)


def create_user(conn):
    user = User("test@mc.org", "test")
    insert(user.__dict__, "users", conn)


def create_project(conn):
    global PROJECTID
    project = Project("test", "test@mc.org")
    project.id = "test"
    created_project = insert(project.__dict__, "projects", conn)
    PROJECTID = created_project['id']


def load_tables(conn):
    print "Loading tables..."
    create_user(conn)
    create_project(conn)
    create_sample1(conn)
    print "Done..."


def main(port):
    create_db(port)
    conn = r.connect("localhost", port, db="samplesdb")
    make_tables(conn)
    load_tables(conn)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-P", "--port", dest="port", type="int",
                      help="rethinkdb port", default=30815)
    (options, args) = parser.parse_args()
    main(options.port)
