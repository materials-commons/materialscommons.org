import re

re1 = re.compile(r"\s+")
re2 = re.compile(r"/+")

def _normalise_property_name(name):
    if name:
        name = name.replace('-', '_')
        name = re1.sub("_", name)
        name = re2.sub("_", name)
        name = name.lower()
    return name
