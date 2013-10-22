from dataitem import DataItem

class DataFile(DataItem):
    def __init__(self, name, access, owner):
        super(DataFile, self).__init__(name, access, owner, "datafile")
        self.checksum = ""
        self.size = 0
        self.location = ""
        self.mediatype = ""
        self.conditions = []
        self.text = ""
        self.metatags = []
        self.datadirs = []
