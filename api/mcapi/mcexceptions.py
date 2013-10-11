class RequiredAttributeException(Exception):
    def __init__(self, attr):
        self.attr = attr

class AuthenticationException(Exception):
    pass

class AccessNotAllowedException(Exception):
    pass
