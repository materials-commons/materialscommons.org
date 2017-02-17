angular.module('materialscommons').component('mcFileDescription', {
    templateUrl: 'app/project/files/components/file/mc-file-description.html',
    controller: MCFileDescriptionComponentController,
    bindings: {
        file: '='
    }
});

function MCFileDescriptionComponentController(toast) {
    'ngInject';

    var ctrl = this;

    ctrl.editDescription = false;
    ctrl.save = save;
    ctrl.edit = edit;

    ///////////////////////

    function edit() {
        ctrl.description = ctrl.file.description;
        ctrl.editDescription = true;
    }

    function save() {
        // TODO: convert to api call using projectService
        if (ctrl.file.description !== ctrl.description) {
            ctrl.file.customPUT({description: ctrl.description}).then(function() {
                ctrl.file.description = ctrl.description;
                ctrl.editDescription = false;
            }).catch(function(err) {
                toast.error("Failed updating description: " + err.error);
            });
        }
    }
}
