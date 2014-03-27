from dataitem import DataItem

class DataFile(DataItem):
    def __init__(self, name, access, owner):
        super(DataFile, self).__init__(name, access, owner, "datafile")
        # MD5 Hash computed at upload time
        self.checksum = ""

        # Size of file
        self.size = 0

        # delete not used
        self.location = ""

        # Not currently used. Will be the media type of the file as computed
        # by tika
        self.mediatype = ""

        # delete not used
        self.conditions = []

        # delete not used
        self.text = ""

        # delete not used
        self.metatags = []

        # The list of datadirs that the file is in
        self.datadirs = []

        # delete not used
        self.parent = ""
