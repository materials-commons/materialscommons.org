import rethinkdb as r


class PropertySet(object):
    def __init__(self, name, set_type, item_id, item_type):
        self.name = name
        self.stype = set_type
        self.item_id = item_id
        self.item_type = item_type


class Property(object):
    def __init__(self, name, display_name, value, ptype, item_id, item_type):
        # display_name: The name to display to the user
        # name: The property name
        # value: The property value
        # unit: The units for the property
        # ptype: The property type (number, string, selection, file,
        #        sample, etc...)
        # item_id: The id of the item this is associated with
        # item_type: The type of item that item_id points to
        # other: Additional attributes depending on the type
        self.birthtime = r.now()
        self.mtime = self.birthtime
        self.name = name
        self.display_name = display_name
        self.value = value
        self.unit = ""
        self.ptype = ptype
        self.item_id = item_id
        self.item_type = item_type
        self.other = {}
