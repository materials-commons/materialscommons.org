from dataitem import DataItem

class DataSet(DataItem):
    def __init__(self, name, access, owner):
        super(DataSet, self).__init__(name, access, owner, "dataset")
        self.items = []
