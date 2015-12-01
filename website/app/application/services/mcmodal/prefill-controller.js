(function (module) {
    module.controller('PreFillProcessController', PreFillProcessController);
    PreFillProcessController.$inject = ['template', 'existingTemplateNames', 'toastr', '$modalInstance'];

    function PreFillProcessController(template, existingTemplateNames, toastr, $modalInstance) {
        var ctrl = this;

        ctrl.template = template;
        ctrl.ok = ok;
        ctrl.cancel = cancel;

        /////////////////////////

        function ok() {
            var index = _.indexOf(existingTemplateNames, template.name);
            if (index !== -1) {
                var msg = "A template with name '" + template.name + "' already exists. Please choose a unique name.";
                toastr.error(msg, 'Error');
            } else {
                $modalInstance.close(ctrl.template);
            }
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }
    }
}(angular.module('materialscommons')));
