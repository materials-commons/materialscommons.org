module.exports = function() {
    var r = require('./../dash');
    var run = require('./run');

    return {
        mustExist: mustExist
    };

    function mustExist(id, table_name, cb) {
        var query = r.table(table_name).get(id);
        return run(query).then(function(item) {
            var error = null;
            if (!item) {
                error = {
                    rule: 'mustExist',
                    actual: id,
                    expected: 'did not find ' + id + ' in model'
                };
            }
            cb(error);
        });
    }
};
