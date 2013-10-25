class RequiredAttributeException(Exception):
    def __init__(self, attr):
        self.attr = attr

class NoSuchItem(Exception):
    def __init__(self, id="Unknown"):
        self.id = id

class AuthenticationException(Exception):
    pass

class AccessNotAllowedException(Exception):
    def __init__(self, id="Unknown"):
        self.id = id

class DatabaseError(Exception):
    pass
