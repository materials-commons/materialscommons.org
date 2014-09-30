import rethinkdb as r


class PropertySet(object):
    def __init__(self, name, set_type, item_id, item_type):
        self.name = name
        self.type = set_type
        self.item_id = item_id
        self.item_type = item_type


class Property(object):
    def __init__(self, name, display_name, value, item_id, item_type):
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.name = name
        self.display_name = display_name
        self.value = value
        self.value_name = ""
        self.unit = ""
        self.item_id = item_id
        self.item_type = item_type
