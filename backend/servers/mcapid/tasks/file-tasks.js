const {api, Task} = require('actionhero');
let convertible = require('@lib/convertible');

module.exports.ConvertFileTask = class ConvertFileTask extends Task {
    constructor() {
        super();
        this.name = 'convertFile';
        this.description = 'Convert an image file or MS file';
        this.frequency = 0;
        this.queue = 'files';
    }

    async run(file) {
        api.mc.log.info('Converting file:', file);
        try {
            return await convertible.convertFile(file);
        } catch (e) {
            api.mc.log.info('Failed converting file:', e);
            return false;
        }
    }
};