class RequiredAttributeException(Exception):
    def __init__(self, attr):
        self.attr = str(attr)

class NoSuchItem(Exception):
    def __init__(self, id="Unknown"):
        self.id = str(id)

class AuthenticationException(Exception):
    pass

class AccessNotAllowedException(Exception):
    print 'dfgfdg**********8'
    def __init__(self, id="Unknown"):
        self.id = str(id)

class DatabaseError(Exception):
    pass
