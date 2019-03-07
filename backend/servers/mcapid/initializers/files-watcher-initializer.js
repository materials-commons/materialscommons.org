const {Initializer, api} = require('actionhero');
const convertible = require('@lib/convertible');

module.exports = class FileWatcherInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'file-watcher-initializer';
        this.loadPriority = 1100;
    }

    initialize() {
        const r = api.mc.r;
        r.table('datafiles').changes({squash: false}).toStream().on('data', async(file) => await enqueueFileIfConvertible(file));
    }
};

async function enqueueFileIfConvertible(file) {
    if (isNewDoc(file) && convertible.isConvertibleFileType(file.new_val.mediatype.mime)) {
        await api.tasks.enqueue('convertFile', file.new_val, 'files');
    }
}

function isNewDoc(file) {
    // If this is a new file document then old_val will be null and new_val will not be null,
    // in addition we only need to convert files that don't have a usesid set. If there is a
    // usesid that means there is already an existing file that this entry points to and that
    // entry will have been converted (if its a file we can convert).
    return (file.old_val === null && file.new_val !== null && file.new_val.usesid === '');
}