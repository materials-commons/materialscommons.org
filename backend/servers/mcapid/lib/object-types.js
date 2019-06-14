
const validObjectTypes = ['project', 'experiment', 'sample', 'process', 'file', 'dataset', 'directory', 'sample_attribute'];

function validate(o) {
    let i = _.indexOf(validObjectTypes, o);
    if (i === -1) {
        throw new Error(`object_type must be one of ${validObjectTypes}, got ${o}.`);
    }
}

module.exports = {
    validate,
};