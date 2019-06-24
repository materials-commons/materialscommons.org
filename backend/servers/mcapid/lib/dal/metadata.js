module.exports = function(r) {

    const db = require('./db')(r);

    async function getMetadata(oid, otype) {
        let table = objectTypeToTable(otype);
        if (table === null) {
            return null;
        }

        let o = await r.table(table).get(oid);
        if (o) {
            return {id: o.id, object_type: otype, metadata: o.metadata ? o.metadata : {}};
        }

        return null;
    }

    async function setMetadata(oid, otype, metadata) {
        let table = objectTypeToTable(otype);
        if (table === null) {
            return null;
        }

        let o = await db.update(table, oid, {metadata: metadata});
        return {id: o.id, object_type: otype, metadata: o.metadata};
    }

    function objectTypeToTable(otype) {
        switch (otype) {
            case 'experiment':
                return 'experiments';
            case 'file':
                return 'datafiles';
            case 'directory':
                return 'datadirs';
            case 'sample':
                return 'samples';
            case 'process':
                return 'processes';
            case 'dataset':
                return 'datasets';
            case 'sample_attribute':
                return 'properties';
            default:
                return null;
        }
    }

    return {
        getMetadata,
        setMetadata,
    };
};