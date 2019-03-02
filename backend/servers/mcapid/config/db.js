exports['default'] = {
    db: api => {
        return {
            type: 'rethinkdb',
            connection: () => "default",
            param: 1,
        }
    }
};

exports.test = {
    db: api => {
        return {
            connection: () => "test",
            param: 2,
        }
    }
};

exports.production = {
    db: api => {
        return {
            connection: () => "production",
            param: 3,
        }
    }
}
