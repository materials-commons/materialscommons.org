const {Initializer, api} = require('actionhero');

module.exports = class FileWatcherInitializer extends Initializer {
    constructor() {
        super();
        this.name = 'file-watcher-initializer';
        this.loadPriority = 1100;
    }

    initialize() {
        const r = api.mc.r;

        r.table('datafiles').changes({squash: true}).toStream().on('data', async(file) => await processFile(file));
    }
};

async function processFile(file) {
    await api.tasks.enqueue('convertFile', file.new_val, 'files');
}