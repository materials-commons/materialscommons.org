module.exports = function (processes, schema) {
    'use strict';
    const ec = require('./error-code');
    const parse = require('co-body');
    const httpStatus = require('http-status');

    return {
        update: update,
        create: create,
        get: get
    };

    /////////////////////////

    function* update(next) {
        let process = yield parse(this);
        let rv = yield processes.update(this.params.process_id, process);
        if (rv.error) {
            this.throw(httpStatus.BAD_REQUEST, rv.error);
        }
        this.body = rv.val;
        yield next;

    }


    function* get(next) {
        yield next;
    }

    // create creates a new process and associated dependencies.
    // It validates the submitted entry and enters in default
    // values for optional missing attributes.
    function *create(next) {
        try {
            let process = yield parse(this);
            process.project_id = this.params.project_id;
            process.owner = this.reqctx.user.id;
            //process = prepareProcess(process);
            //yield validateProcess(process);
            let inserted = yield processes.create(process);
            this.status = 200;
            this.body = inserted;
            yield next;
        } catch (err) {
            console.log(err, err.stack.split("\n"));
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
            yield *validateSettings(process.setup.settings);
            yield *validateFiles(process.project_id, process.files_created, process.setup.files);
            yield *validateSamples(process.samples_created, process.samples_transformed);
            yield *validateMeasurements(process.measurements_taken);
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
         * @param {String} projectID - project files belong to.
         * @param{Array} files_created - Files created by this process.
         * @param{Array} files_used = Files used (input into) by this process.
         */
        function *validateFiles(projectID, files_created, files_used) {
            let filesList = "";
            let reason = {
                rule: 'validateFiles',
                what: '',
                expected: `all files in ${filesList} to be in project`
            };

            let count = yield schema.model.files.countInProject(files_created, projectID);
            if (count != files_created.length) {
                filesList = files_created;
                throw new Error(reason);
            }

            count = yield schema.model.files.countInProject(files_used, projectID);
            if (count != files_used.length) {
                filesList = files_used;
                throw new Error(reason);
            }
        }

        /**
         * Validates the samples for a process.
         *
         * @param{Array} samplesCreated - The samples created by this process
         * @param{Array} samplesTransformed = The samples transformed by this process
         */
        function *validateSamples(samplesCreated, samplesTransformed) {
            for (let i = 0; i < samplesCreated.length; i++) {
                yield schema.samples.validateAsync(samplesCreated[i]);
            }

            let model = schema.model.samples;
            for (let i = 0; i < samplesTransformed.length; i++) {
                yield schema.transformedSamples.validateAsync(samplesTransformed[i]);

                // validate the attribute ids for the transformed samples
                let shares = samplesTransformed[i].shares;
                let uses = samplesTransformed[i].uses;
                let asetID = samplesTransformed[i].attribute_set_id;

                let count = yield model.countAttributesInSample(asetID, shares);
                if (count !== shares.length) {
                    throw new Error('unknown attributes in shares');
                }

                count = yield model.countAttributesInSample(asetID, uses);
                if (count !== uses.length) {
                    throw new Error('unknown attributes in uses');
                }
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

        // Add owner and project to created samples
        process.samples_created.forEach(function (s) {
            s.owner = process.owner;
            s.project_id = process.project_id;
        });
        return process;
    }
};
