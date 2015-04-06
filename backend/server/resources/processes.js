module.exports = function(processes, schema) {
    'use strict';
    let ec = require('./error-code');
    let parse = require('co-body');

    return {
        create: create
    };

    /////////////////////////

    // create creates a new process and associated dependencies.
    // It validates the submitted entry and enters in default
    // values for optional missing attributes.
    function *create(next) {
        try {
            let process = prepareProcess(yield parse(this));
            process.project_id = this.params.project_id;
            process.owner = this.reqctx.user.id;
            yield validateProcess(process);
            let inserted = yield processes.create(process);
            this.status = 200;
            this.body = inserted;
            yield next;
        } catch (err) {
            let e = ec(err);
            this.status = e.status();
            this.body = e.error();
        }

        //////////////////////

        /**
         * validateProcess validates the process, settings, files, samples
         * measurements. Aborts if any one of these items doesn't validate.
         *
         * @param {Process} process - The process as defined by the Process schema.
         */
        function *validateProcess(process) {
            yield schema.processes.validateAsync(process);
            yield *validateSettings(process.settings);
            yield *validateFiles(process.files_created, process.files_used);
            yield *validateSamples(process.samples_created, process.samples_used);
            yield *validateMeasurements(process.measurements);
        }

        /**
         * validateSettings validates the settings in a process. The settings
         * is validated against the Settings schema.
         *
         * @param {Array} settings - The settings as defined the by Settings schema.
         */
        function *validateSettings(settings) {
            for (let i = 0; i < settings.length; i++) {
                yield schema.settings.validateAsync(settings[i]);
            }
        }

        /**
         * validateFiles validates the files in a process. Each file is
         * is an object defined by the Files schema.
         *
         * @param{Array} files_created - Files created by this process.
         * @param{Array} files_used = Files used (input into) by this process.
         */
        function *validateFiles(files_created, files_used) {
            for (let i = 0; i < files_created.length; i++) {
                yield schema.files.validateAsync(files_created[i]);
            }

            for (let i = 0; i < files_used.length; i++) {
                yield schema.files.validateAsync(files_used[i]);
            }
        }

        /**
         * Validates the samples for a process.
         *
         * @param{Array} samples_created - The samples created by this process
         * @param{Array} samples_used = The samples used by (input into) this process
         */
        function *validateSamples(samples_created, samples_used) {
            for (let i = 0; i < samples_created.length; i++) {
                yield schema.samples.validateAsync(samples_created[i]);
            }
            for (let i = 0; i < samples_used.length; i++) {
                yield schema.samples.validateAsync(samples_used[i]);
            }
        }

        /**
         * Validates the measurements as defined by the Measurements schema.
         *
         * @param{Array} measurements - A measurements taken by this process.
         */
        function *validateMeasurements(measurements) {
            for (let i = 0; i < measurements.length; i++) {
                yield schema.measurements.validateAsync(measurements[i]);
            }
        }

    }

    function prepareProcess(process) {
        schema.processes.stripNonSchemaAttrs(process);
        schema.processes.addDefaultsToTarget(process);
        return process;
    }
};
