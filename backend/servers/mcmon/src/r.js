let ropts = {
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815,
    createDatabase: false
};

const orm = require('thinky')(ropts);

//module.exports = require('rethinkdbdash')(ropts);
module.exports = orm.r;