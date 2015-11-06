(function (module) {
    module.controller('EditProcessController', EditProcessController);
    EditProcessController.$inject = ["Restangular", "$stateParams", "selectItems", "$state", "process", "processTemplates"];

    function EditProcessController(Restangular, $stateParams, selectItems, $state, process, processTemplates) {
        var ctrl = this;

        ctrl.process = process[0];
        ctrl.process['updated_samples'] = [];
        ctrl.process['updated_input_files'] = [];
        ctrl.process['updated_output_files'] = [];

        ctrl.process.process_name = "APT"; //to be deleted
        ctrl.template = processTemplates.getTemplateByName(ctrl.process.process_name);

        ctrl.chooseSamples = chooseSamples;
        ctrl.chooseInputFiles = chooseInputFiles;
        ctrl.chooseOutputFiles = chooseOutputFiles;
        ctrl.fillSetUp = fillSetUp;
        ctrl.samples = samples;
        ctrl.files = files;
        ctrl.submit = submit;
        ctrl.cancel = cancel;
        ctrl.remove = remove;

        ctrl.fillSetUp();
        ctrl.samples();
        ctrl.files();
        /**
         * fillSetUp: will read all the setup values from process
         * and place inside template.
         *
         */
        function fillSetUp() {
            ctrl.settings = ctrl.template.setup.settings[0].properties;
            ctrl.process.setup[0].properties.forEach(function (property) {
                var i = _.indexOf(ctrl.settings, function (setting) {
                    return setting.property.attribute === property.attribute
                });
                if (i > -1) {
                    ctrl.settings[i].property.value = property.value;
                    ctrl.settings[i].property.unit = property.unit;
                    ctrl.settings[i].property.id = property.setup_id;
                    ctrl.settings[i].property.property_id = property.id;
                    ctrl.settings[i].property._type = property._type;
                    ctrl.settings[i].property.attribute = property.attribute;
                }
            });
            ctrl.process.setup = ctrl.template.setup;
        }

        function samples() {
            ctrl.process.input_samples = ctrl.process.samples.map(function (sample) {
                return {
                    id: sample.id,
                    name: sample.name,
                    old_properties: [],
                    new_properties: [],
                    property_set_id: sample.property_set_id,
                    files: []
                }
            });
        }

        function files() {
            ctrl.process['input_files'] = ctrl.process.files_used.map(function (file) {
                return {id: file.id, name: file.name}
            });
            ctrl.process['output_files'] = ctrl.process.files_produced.map(function (file) {
                return {id: file.id, name: file.name}
            });
        }

        function submit() {
            var updated_process = {
                id: ctrl.process.id,
                what: ctrl.process.what,
                name: ctrl.process.name,
                setup: ctrl.process.setup,
                input_samples: ctrl.process.updated_samples,
                input_files: ctrl.process.updated_input_files,
                output_files: ctrl.process.updated_output_files
            };
            console.dir(updated_process);
            //Restangular.one('v2').one('projects', $stateParams.id).one('processes', ctrl.process.id).
            //    customPUT(updated_process).then(function () {
            //        $state.go('projects.project.processes.list');
            //    }, function (e) {
            //        console.log('failure to save process', e);
            //    });
        }

        function cancel() {
            $state.go('projects.project.processes.list');
        }

        function chooseSamples() {
            selectItems.open('samples').then(function (item) {
                var uniqueSamples = differenceById(item.samples, ctrl.process.input_samples);
                uniqueSamples.forEach(function (sample) {
                    ctrl.process.input_samples.push({
                        id: sample.id,
                        name: sample.name,
                        old_properties: [],
                        new_properties: [],
                        property_set_id: sample.property_set_id,
                        files: []
                    });
                    ctrl.process.updated_samples.push({id: sample.id, command: 'add'});
                });
            });
        }

        function chooseInputFiles() {
            selectItems.open('files').then(function (item) {
                var uniqueFiles = differenceById(item.files, ctrl.process.input_files);
                uniqueFiles.forEach(function (file) {
                    ctrl.process.input_files.push({
                        id: file.id,
                        name: file.name
                    });
                    ctrl.process.updated_input_files.push({id: file.id, command: 'add'});
                });
            });
        }

        function chooseOutputFiles() {
            selectItems.open('files').then(function (item) {
                var uniqueFiles = differenceById(item.files, ctrl.process.output_files);
                uniqueFiles.forEach(function (file) {
                    ctrl.process.output_files.push({
                        id: file.id,
                        name: file.name
                    });
                    ctrl.process.updated_output_files.push({id: file.id, command: 'add'});
                });
            });
        }

        function remove(type, item) {
            if(type === 'input_sample'){
                remove_from_list('input_samples', item);
                remove_from_list('updated_samples', item);
            }else if(type === 'input_file'){
                remove_from_list('input_files', item);
                remove_from_list('updated_input_files', item);
            }else{
                remove_from_list('output_files', item);
                remove_from_list('updated_output_files', item);
            }
        }

        function remove_from_list(type, item){
            var i = _.indexOf(ctrl.process[type], function(file){
                return file.id === item.id
            });
            if (i > -1){
                ctrl.process[type].splice(i, 1);
            }else{
                ctrl.process[type].push({id: item.id, command: 'delete'})
            }
        }

    }

}(angular.module('materialscommons')));
