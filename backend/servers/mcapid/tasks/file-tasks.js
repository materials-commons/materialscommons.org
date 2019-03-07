const {api, Task} = require('actionhero');

module.exports.ConvertFileTask = class ConvertFileTask extends Task {
    constructor() {
        super();
        this.name = 'convertFile';
        this.description = 'Convert an image file or MS file';
        this.frequency = 0;
        this.queue = 'files';
    }

    async run(data) {
        api.mc.log.info('Converting file', data);
    }
};