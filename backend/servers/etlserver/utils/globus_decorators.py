from flask import redirect, request, session, url_for
from functools import wraps


def globus_authenticated(fn):
    """Mark a route as requiring authentication."""
    @wraps(fn)
    def decorated_function(*args, **kwargs):
        if request.path == '/globus/auth/logout':
            return fn(*args, **kwargs)

        if not session.get('is_authenticated'):
            return redirect(url_for('/globus/auth/login',
                                    apikey=request.args.get('apikey')))

        return fn(*args, **kwargs)
    return decorated_function
