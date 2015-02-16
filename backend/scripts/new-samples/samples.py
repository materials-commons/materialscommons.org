#!/usr/bin/env python

import rethinkdb as r


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


class Process2Sample(object):
    def __init__(self, sample_id, process_id, relationship):
        self.sample_id = sample_id
        self.process_id = process_id
        self.relationship = relationship


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


class Attribute(object):
    def __init__(self):
        self.parent_id = ""
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.name = ""
        self.value = ""
        self.value_type = ""
        self.units = ""
        self.normalized_value = ""
        self.normalized_units = ""
        self.value_unknown = True
        self._type = "attribute"


class Attribute2Process(object):
    def __init__(self, attribute_id, process_id):
        self.attribute_id = attribute_id
        self.process_id = process_id


class Measurement(object):
    def __init__(self, value, value_type, units, process_id):
        self.value = value
        self.value_type = value_type
        self.units = units
        self.process_id = process_id
        self.normalized_value = ""
        self.normalized_units = ""
        self._type = "measurement"


class Attribute2Measurement(object):
    def __init__(self, attribute_id, measurement_id):
        self.attribute_id = attribute_id
        self.measurement_id = measurement_id


class AttributeHistory(object):
    def __init__(self, attribute_id, process_id, measurement_id, value, units):
        self.attribute_id = attribute_id
        self.process_id = process_id
        self.measurement_id = measurement_id
        self.value = value
        self.units = units
        self.normalized_units = ""
        self.normalized_value = ""
        self.current = False
        self.value_unknown = False
        self.order = 0
        self.when = r.now()
        self._type = "attribute_history"


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


def create_db():
    print "Creating samplesdb..."
    conn = r.connect("localhost", 30815)
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
    create_table("process2sample", conn, "sample_id", "process_id")
    create_table("attribute2process", conn, "attribute_id",
                 "process_id")
    create_table("processes", conn)
    create_table("attributes", conn, "parent_id")
    create_table("measurements", conn, "process_id")
    create_table("attribute2measurement", conn, "attribute_id",
                 "measurement_id")
    create_table("attribute_history", conn, "process_id", "attribute_id")
    print "Done..."


def create_sample1(conn):
    s = Sample("sample1", "Empty sample", "test@mc.org")
    rv = insert(s.__dict__, "samples", conn)
    sample_id = rv['id']
    p2s = Project2Sample(PROJECTID, sample_id)
    insert(p2s.__dict__, "project2sample", conn)
    process = Process("as_received", "test@mc.org", "",
                      PROJECTID, "sample1")
    rv = insert(process.__dict__, "processes", conn)
    process_id = rv['id']
    p2proc = Project2Process(PROJECTID, process_id)
    insert(p2proc.__dict__, "project2process", conn)
    sample1_as = AttributeSet("as_received", "Initial Attributes", True, "")
    rv = insert(sample1_as.__dict__, "attribute_sets", conn)
    sample1_as_id = rv['id']
    s2as = Sample2AttributeSet(sample1_as_id, sample_id, 0, True)
    insert(s2as.__dict__, "sample2attribute_set", conn)

    # Create attributes
    comp1 = {
        "mg" : 0.1
    }
    comp2 = {
        "mg": 0.2
    }
    a1 = Attribute()
    a1.name = "composition"
    a1.value_type = "json"
    a1.value = comp2

    a1.units = "atomic_percentage"
    a1.value_unknown = False
    a1.normalized_value = a1.value
    a1.normalized_units = a1.units
    rv = insert(a1.__dict__, "attributes", conn)
    a1id = rv['id']
    as2a = AttributeSet2Attribute(sample1_as_id, a1id)
    insert(as2a.__dict__, "attribute_set2attribute", conn)
    a2proc = Attribute2Process(a1id, process_id)
    insert(a2proc.__dict__, "attribute2process", conn)

    # Need to setup the initial attribute history for this attribute
    ah = AttributeHistory(a1id, process_id, "", "", "")
    ah.current = False
    ah.value_unknown = False
    ah.value = comp1
    ah.normalized_value = comp1
    ah.units = a1.units
    ah.normalized_units = a1.normalized_units
    insert(ah.__dict__, "attribute_history", conn)

    #
    # Add history for attribute
    #

    # Create a process that measures the attribute
    process = Process("measures_composition", "test@mc.org", "",
                      PROJECTID, "measure composition")
    rv = insert(process.__dict__, "processes", conn)
    mproc_id = rv['id']
    p2s = Project2Process(PROJECTID, mproc_id)
    insert(p2s.__dict__, "project2process", conn)
    a2proc = Attribute2Process(a1id, mproc_id)
    insert(a2proc.__dict__, "attribute2process", conn)

    # Create measurement for the process

    m = Measurement(comp1, "json", "atomic_percentage", mproc_id)
    m.normalized_value = m.value
    m.normalized_units = m.units
    rv = insert(m.__dict__, "measurements", conn)
    m_id = rv['id']
    a2m = Attribute2Measurement(a1id, m_id)
    insert(a2m.__dict__, "attribute2measurement", conn)

    # We set up a1 to have the current value, now we set the measurement.
    # There are two history items, the first is when the attribute was
    # first entered into the system
    ah = AttributeHistory(a1id, process_id, m_id, "", "")
    ah.value = a1.value
    ah.normalized_value = a1.normalized_value
    ah.units = a1.units
    ah.normalized_units = a1.normalized_units
    ah.value_unknown = False
    ah.current = True
    ah.order = 1
    insert(ah.__dict__, "attribute_history", conn)


def create_sample2(conn):
    pass


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
    create_sample2(conn)
    print "Done..."


def main():
    create_db()
    conn = r.connect("localhost", 30815, db="samplesdb")
    make_tables(conn)
    load_tables(conn)


if __name__ == "__main__":
    main()
