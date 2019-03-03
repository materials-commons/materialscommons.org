exports['default'] = {
    db: api => {
        return {
            type: 'rethinkdb',
            name: process.env.MCDB || 'materialscommons',
            port: process.env.MCDB_PORT || 30815,
        };
    }
};

exports.test = {
    db: api => {
        return {
            port: process.env.MCDB_PORT || 30815,
        };
    }
};

exports.production = {
    db: api => {
        return {
            port: process.env.MCDB_PORT || 28015,
        };
    }
};
