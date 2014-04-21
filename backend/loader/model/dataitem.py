import rethinkdb as r

class DataItem(object):
    def __init__(self, name, access, owner, item_type):
        # Delete?
        self.item_type = item_type

        # The name of the item
        self.name = name

        # The type of access - currently ignored, but set to private or public
        self.access = access

        # Whether the item has been marked for review. Is this used?
        self.marked_for_review = False

        # Delete not used
        self.reviews = []

        # Creation time
        self.birthtime = r.now()

        # Last modification time  - delete not used
        self.mtime = self.birthtime

        # Last time file was access - delete not used
        self.atime = self.birthtime

        # Delete not used, moved to a join table
        self.tags = []

        # Delete not used, moved to a join table
        self.mytags = []

        # Description of entry
        self.description = name

        # Notes associated with entry. This is a series of Note objects.
        self.notes = []

        # Owner of item
        self.owner = owner

        # Delete not used
        self.process = ""

        # Delete not used
        self.machine = ""
