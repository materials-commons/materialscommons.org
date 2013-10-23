from dataitem import DataItem

class DataParam(DataItem):
    def __init__(self, name, access, owner):
        super(DataParam, self).__init__(name, access, owner, "dataparam")
        self.conditions = []
