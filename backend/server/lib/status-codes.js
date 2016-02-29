
const httpStatus = require('http-status');

let _statusCodes = {
    SUCCESS: 0,
    SUCCESS_CREATED: 1,
    BAD_ARGS: -1,
    UNKNOWN_OBJECT: -2,
    MISSING_FIELD: -3,
    UNKNOWN_ERROR: -4
};

module.exports = _statusCodes;

function Success(val) {
    this.status =  _statusCodes.SUCCESS;
    this.errorMessage = '';
    this.val = val;
}
function Error(errorCode, errorMessage) {
    if (!(errorCode in _statusCodes)) {
        this.status = _statusCodes.UNKNOWN_ERROR;
    } else {
        this.status = errorCode;
    }
    this.errorMessage = errorMessage;
    this.val = null;
}

function isError(s) {
    return s.status !== _statusCodes.SUCCESS;
}

function toHTTPStatus(s) {
    switch (s.status) {
        case _statusCodes.SUCCESS:
            return httpStatus.OK;
        case _statusCodes.SUCCESS_CREATED:
            return httpStatus.CREATED;
        case _statusCodes.BAD_ARGS:
            return httpStatus.BAD_REQUEST;
        case _statusCodes.UNKNOWN_OBJECT:
            return httpStatus.NOT_FOUND;
        case _statusCodes.MISSING_FIELD:
            return httpStatus.UNPROCESSABLE_ENTITY;
        case _statusCodes.UNKNOWN_ERROR:
            return httpStatus.INTERNAL_SERVER_ERROR;
        default:
            return httpStatus.INTERNAL_SERVER_ERROR;
    }
}

module.exports.Success = Success;
module.exports.Error = Error;
module.exports.isError = isError;
module.exports.toHTTPStatus = toHTTPStatus;

