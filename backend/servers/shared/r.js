let ropts = {
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
};

module.exports = require('rethinkdbdash')(ropts);