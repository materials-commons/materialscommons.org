class ProbeException(Exception):
    def __init__(self, attr):
        self.attr = str(attr)


class RequiredAttributeException(ProbeException):
    def __init__(self, attr):
        self.attr = str(attr)


class AuthenticationException(ProbeException):
    def __init__(self, attr):
        self.attr = str(attr)


class NoSuchItem(ProbeException):
    def __init__(self, attr):
        self.attr = str(attr)


class TransferFailed(ProbeException):
    def __init__(self, attr):
        self.attr = str(attr)

