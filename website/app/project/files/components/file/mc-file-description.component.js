(function (module) {
    module.component('mcFileDescription', {
        templateUrl: 'app/project/files/components/file/mc-file-description.html',
        controller: 'MCFileDescriptionComponentController',
        bindings: {
            file: '='
        }
    });

    module.controller('MCFileDescriptionComponentController', MCFileDescriptionComponentController);
    MCFileDescriptionComponentController.inject = ["toastr"];
    function MCFileDescriptionComponentController(toastr) {
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
            // convert to api call using projectService
            if (ctrl.file.description !== ctrl.description) {
                ctrl.file.customPUT({description: ctrl.description}).then(function () {
                    ctrl.file.description = ctrl.description;
                    ctrl.editDescription = false;
                }).catch(function (err) {
                    toastr.error("Failed updating description: " + err.error, "Error");
                });
            }
        }
    }
}(angular.module('materialscommons')));
