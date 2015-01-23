import rethinkdb as r


class DataFile(object):
    def __init__(self, name, access, owner, size):
        self.name = name
        self.owner = owner
        self._type = "datafile"
        self.atime = r.now()
        self.birthtime = self.atime
        self.mtime = self.atime
        self.checksum = ""
        self.current = True
        self.description = self.name
        self.mediatype = {}
        self.parent = ""
        self.size = size
        self.uploaded = self.size
        self.usesid = ""
