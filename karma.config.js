// karma.conf.js
module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],

        // reporters configuration
        reporters: ['mocha']

        // reporter options
        mochaReporter: {
            colors: {
                success: 'blue',
                info: 'bgGreen',
                warning: 'cyan',
                error: 'bgRed'
            },
            symbols: {
                success: '+',
                info: '#',
                warning: '!',
                error: 'x'
            }
        }
    });
};