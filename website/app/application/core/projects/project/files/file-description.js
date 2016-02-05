(function (module) {
    module.directive('fileDescription', fileDescriptionDirective);
    function fileDescriptionDirective() {
        return {
            restrict: "E",
            scope: {
                file: "="
            },
            controller: 'FileDescriptionDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/core/projects/project/files/file-description.html'
        };
    }

    module.controller('FileDescriptionDirectiveController', FileDescriptionDirectiveController);
    FileDescriptionDirectiveController.$inject = ['toastr'];

    function FileDescriptionDirectiveController(toastr) {
        var ctrl = this;

        ctrl.editDescription = false;
        ctrl.save = save;
        ctrl.cancel = cancel;
        ctrl.description = ctrl.file.description;

        ///////////////////////

        function save() {
            ctrl.file.customPUT({description: ctrl.description}).then(function() {
                ctrl.file.description = ctrl.description;
                ctrl.editDescription = false;
            }).catch(function(err) {
                toastr.error("Failed updating description: " + err.error, "Error");
            });
        }

        function cancel() {
            ctrl.description = ctrl.file.description;
            ctrl.editDescription = false;
        }
    }
}(angular.module('materialscommons')));

