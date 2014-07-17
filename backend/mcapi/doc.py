import dmutil
import json


def add_properties(properties, what):
    for prop in properties:
        attr_name, prop_vals = _new_property_attributes(prop)
        if attr_name is not None:
            what['properties'][attr_name] = prop_vals


def add_template_properties(j, ttype):
    t = dict()
    t['template'] = dmutil.get_required('id', j)
    t['properties'] = {}
    t['type'] = ttype
    attr = dmutil.get_optional("attribute", j, None)
    if attr is None:
        return None
    t['attribute'] = attr

    default_props = dmutil.get_optional('default_properties', j, [])
    add_properties(default_props, t)

    added_properties = dmutil.get_optional('added_properties', j, [])
    add_properties(added_properties, t)
    return t


def _new_property_attributes(attrs):
    attr_name = dmutil.get_optional('attribute', attrs, None)
    if attr_name is None:
        return None, None
    value = _get_value(attrs)
    if value == "":
        return None, None
    name = dmutil.get_optional('name', attrs)
    unit = dmutil.get_optional('unit', attrs)
    prop_type = dmutil.get_required('type', attrs)
    prop_type = _map_property_type(prop_type)
    attr_props = new_prop_attrs(name, unit, value, prop_type)
    return attr_name, attr_props


def _get_value(attrs):
    value = dmutil.get_optional('value', attrs, None)
    if value is None:
        return ""
    attrs_type = dmutil.get_required('type', attrs)
    # For object types we just get the id
    if attrs_type == "machines":
        return dmutil.get_required('id', value)
    return value


def new_prop_attrs(name, unit, value, prop_type):
    prop_attrs = {}
    if prop_type == 'select':
        x = value
        prop_attrs['value_name'] = x[u'name']
        prop_attrs['value'] = x[u'value']
    else:
         prop_attrs['value'] = value
         prop_attrs['value_name'] = ""
    prop_attrs['name'] = name
    prop_attrs['unit'] = unit
    prop_attrs['type'] = prop_type
    return prop_attrs


def _map_property_type(prop_type):
    if prop_type == "machines":
        return "id"
    elif prop_type == "samples":
        return "id"
    else:
        return prop_type
