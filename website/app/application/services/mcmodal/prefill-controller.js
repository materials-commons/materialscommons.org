(function (module) {
    module.controller('projectPreFillProcess', projectPreFillProcessController);
    projectPreFillProcessController.$inject = ["template", "$modalInstance", "Restangular", "project"];

    function projectPreFillProcessController(template, $modalInstance, Restangular, project) {
        var ctrl = this;

        ctrl.template = template;
        ctrl.ok = ok;
        ctrl.cancel = cancel;

        /////////////////////////

        function ok() {
            var command = templateExists(ctrl.template.name) ? 'update' : 'add';
            Restangular.one('v2').one('projects', project.id)
                .customPUT({
                    process_templates: [
                        {
                            command: command,
                            template: {
                                name: ctrl.template.name,
                                setup: ctrl.template.setup.settings[0],
                                process_name: ctrl.template.process_name
                            }
                        }
                    ]
                }).then(
                function success() {
                    $modalInstance.close(ctrl.template);
                },
                function failure() {

                });
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

        function templateExists(templateName) {
            var i = _.indexOf(project.process_templates, function(t) {
                return t.name === templateName;
            });

            return i !== -1;
        }
    }
}(angular.module('materialscommons')));
