import mcexceptions
from flask import g

def as_list(query, id="Unknown"):
    selection = list(query.run(g, time_format='raw'))
    if selection:
        return selection
    raise mcexceptions.NoSuchItem(id)

def as_single(query, id="Unknown"):
    item = query.run(g, time_format='raw')
    if item:
        return item
    raise mcexceptions.NoSuchItem(id)
