(function (module) {
    module.controller('EditProcessController', EditProcessController);
    EditProcessController.$inject = ["Restangular", "$stateParams", "selectItems", "$state", "process", "$modal", "processTemplates"];

    function EditProcessController(Restangular, $stateParams, selectItems, $state, process, $modal, processTemplates) {
        var ctrl = this;

        ctrl.process = process[0];
        console.dir(ctrl.process);
        ctrl.process.process_name = "APT"; //to be deleted
        ctrl.template = processTemplates.getTemplateByName(ctrl.process.process_name);

        ctrl.fillSetUp = fillSetUp;
        ctrl.samples = samples;
        ctrl.files = files;
        ctrl.submit = submit;
        ctrl.cancel = cancel;

        ctrl.chooseSamples = chooseSamples;
        ctrl.chooseInputFiles = chooseInputFiles;
        ctrl.chooseOutputFiles = chooseOutputFiles;

        ctrl.fillSetUp();
        ctrl.samples();
        ctrl.files();
        console.dir(ctrl.process);

        /**
         * fillSetUp: will read all the setup values from process and place inside template.
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
                    ctrl.settings[i].property.setup_id = property.setup_id;
                    ctrl.settings[i].property.id = property.id;
                }
            });
            ctrl.process.setup = ctrl.template.setup;
        }

        function samples() {
            ctrl.process.input_samples = ctrl.process.samples.map(function(sample){
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

        function cancel() {
            $state.go('projects.project.processes.list');
        }

        function files() {
            ctrl.process['input_files'] = ctrl.process.files_used.map(function(file){
                return {id: file.id, name: file.name}
            });

            ctrl.process['output_files'] = ctrl.process.files_produced.map(function(file){
                return {id: file.id, name: file.name}
            });
        }

        function submit(){
        console.dir(ctrl.process);
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
                });
            });
        }
    }

}(angular.module('materialscommons')));
