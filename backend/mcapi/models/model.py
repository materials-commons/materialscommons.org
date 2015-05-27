from rethinkdb import r


class DatabaseError(Exception):
    pass


class Value(object):
    def __init__(self):
        self.properties = {}

    def add_property(self, name, prop):
        self.properties[name] = prop.__dict__


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


class Settings(object):
    def __init__(self, name):
        self.name = name
        self.birthtime = r.now()
        self._type = "settings"
        self.settings = {}

    def add_setting(self, name, _type, value, unit="", nvalue="", nunit=""):
        p = Property(_type, value, unit, nvalue, nunit)
        if p.nvalue == "":
            p.nvalue = value
        if p.nunits == "":
            p.nunits = p.units
        self.settings[name] = p.__dict__


class Process2Setting(object):
    def __init__(self, process_id, setting_id, _type):
        self.process_id = process_id
        self.setting_id = setting_id
        self._type = _type


class Process2File(object):
    def __init__(self, process_id, file_id, _type):
        self.process_id = process_id
        self.datafile_id = file_id
        self._type = _type


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
    def __init__(self, sample_id, process_id, attribute_set_id, _type):
        self.sample_id = sample_id
        self.process_id = process_id
        self.attribute_set_id = attribute_set_id
        self._type = _type


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


def add_measurement(name, prop, attr_id, process_id, conn):
    m = Measurement(process_id)
    m.add_property(name, prop)
    rv = insert(m.__dict__, "measurements", conn)
    m_id = rv['id']
    a2m = Attribute2Measurement(attr_id, m_id)
    insert(a2m.__dict__, "attribute2measurement", conn)
    return m_id


def add_process(project_id, proc, conn):
    rv = insert(proc.__dict__, "processes", conn)
    process_id = rv['id']
    p2proc = Project2Process(project_id, process_id)
    insert(p2proc.__dict__, "project2process", conn)
    return process_id


def add_attribute_set(process_id, sample_id, aset, direction, conn):
    rv = insert(aset.__dict__, "attribute_sets", conn)
    as_id = rv['id']
    s2as = Sample2AttributeSet(as_id, sample_id, 0, True)
    insert(s2as.__dict__, "sample2attribute_set", conn)
    p2s = Process2Sample(sample_id, process_id, as_id, direction)
    insert(p2s.__dict__, "process2sample", conn)
    return as_id


def add_attribute_set_id(process_id, sample_id, as_id, direction, conn):
    p2s = Process2Sample(sample_id, process_id, as_id, direction)
    insert(p2s.__dict__, "process2sample", conn)


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


def add_settings(process_id, settings, _type, conn):
    rv = insert(settings.__dict__, "settings", conn)
    setting_id = rv['id']
    p2s = Process2Setting(process_id, setting_id, _type)
    insert(p2s.__dict__, "process2setting", conn)
