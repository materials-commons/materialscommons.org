module.exports = function(err) {
    return new _E(err);
};

function _E(err) {
    this.err = err;
    this.validationError = this._isValidationError(err);
}

_E.prototype._isValidationError = function(err) {
    for (var key in err) {
        if ('errors' in err[key]) {
            return true;
        }
    }
    return false;
};

_E.prototype.status = function() {
    if (this.validationError) {
        return 406;
    }
    return 500;
};

_E.prototype.error = function() {
    return {
        error: this.validationError ? this.err : String(this.err)
    };
};
