module.exports = function() {
    var r = require('./../dash');
    var run = require('./run');

    return {
        mustExist: mustExist
    };

    function mustExist(id, tableAndDatabaseName, cb) {
        var tableName = tableAndDatabaseName[0];
        var databaseName = tableAndDatabaseName[1];
        var query = r.db(databaseName).table(tableName).get(id);
        return run(query).then(item => {
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
