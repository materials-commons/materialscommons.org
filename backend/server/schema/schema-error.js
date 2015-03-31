var _ = require('lodash');

module.exports = function serror(_rule, _actual, _expected) {
    return new E(_rule, _actual, _expected);
};

function E(_rule, _actual, _expected) {
    this.e = {
        rule: _rule ? _rule : '',
        actual: _actual ? _actual : '',
        expected: _expected ? _expected : ''
    };
}

E.prototype.rule = function(r) {
    this.e.rule = r;
    return this;
};

E.prototype.actual = function(a) {
    this.e.actual = a;
    return this;
};

E.prototype.expected = function(e) {
    this.e.expected = e;
    return this;
};

E.prototype.from = function(what) {
    if (_.isArray(what)) {
        this.e.rule = what[0] || this.e.rule;
        this.e.actual = what[1] || this.e.actual;
        this.e.expected = what[2] || this.e.expected;
    } else if(_.isObject(what)) {
        this.e.rule = what.rule || this.e.rule;
        this.e.actual = what.actual || this.e.actual;
        this.e.expected = what.expected || this.e.expected;
    }
    return this;
};

E.prototype.done = function() {
    return this.e;
};
