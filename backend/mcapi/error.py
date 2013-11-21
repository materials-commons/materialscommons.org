from flask import make_response, jsonify


class HttpStatusCode(object):
    #
    # Client Errors
    #
    STATUS_BAD_REQUEST = 400
    STATUS_NOT_AUTHORIZED = 401
    STATUS_FORBIDDEN = 403
    STATUS_NOT_FOUND = 404
    STATUS_METHOD_NOT_ALLOWED = 405
    STATUS_NOT_ACCEPTABLE = 406
    STATUS_ALREADY_EXISTS = 409

    #
    # Server Errors
    #
    STATUS_SERVER_INTERNAL_ERROR = 500
    STATUS_SERVER_SERVICE_UNAVAILABLE = 503


def error_response(message, status_code):
    return make_response(jsonify({'error': message}), status_code)


def bad_request(message):
    return error_response(message, HttpStatusCode.STATUS_BAD_REQUEST)


def not_authorized(message):
    return error_response(message, HttpStatusCode.STATUS_NOT_AUTHORIZED)


def forbidden(message):
    return error_response(message, HttpStatusCode.STATUS_FORBIDDEN)


def not_found(message):
    return error_response(message, HttpStatusCode.STATUS_NOT_FOUND)


def method_not_allowed(message):
    return error_response(message, HttpStatusCode.STATUS_METHOD_NOT_ALLOWED)


def not_acceptable(message):
    return error_response(message, HttpStatusCode.STATUS_NOT_ACCEPTABLE)


def already_exists(message):
    return error_response(message, HttpStatusCode.STATUS_ALREADY_EXISTS)


def server_internal_error(message):
    return error_response(message, HttpStatusCode.STATUS_SERVER_INTERNAL_ERROR)


def server_service_unavailable(message):
    return error_response(message,
                          HttpStatusCode.STATUS_SERVER_SERVICE_UNAVAILABLE)


def database_error(message):
    return server_internal_error(message)
