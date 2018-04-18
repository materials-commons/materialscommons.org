import sys

from .mcexceptions import RequiredAttributeException

def get_required(what, d):
    if what not in d:
        msg("get_required not found: %s in %s" % (what, d))
        raise RequiredAttributeException(what)
    val = d[what]
    if val is None:
        msg("get_required attribute value %s is None in %s" % (what, d))
        raise RequiredAttributeException(what)
    return val


def get_optional(what, d, novalue=""):
    if what not in d:
        return novalue
    val = d[what]
    if val is None:
        return novalue
    return val
