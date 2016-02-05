(function(module) {
    module.factory('selectProcessTemplate', selectProcessTemplateService);
    selectProcessTemplateService.$inject = ['$modal'];

    function selectProcessTemplateService($modal) {
        return {
            open: function() {
                var modal = $modal.open({
                    size: 'lg',
                    templateUrl: 'application/core/projects/project/processes/template.html',
                    controller: 'SelectProcessTemplateModalController',
                    controllerAs: 'ctrl',
                    resolve: {
                        processTemplates: function() {
                            return [];
                        }
                    }
                });
                return modal.result;
            }
        }
    }

    module.controller('SelectProcessTemplateModalController', SelectProcessTemplateModalController);
    SelectProcessTemplateModalController.$inject = ["$modalInstance", "processTemplates"];
    function SelectProcessTemplateModalController() {
        var ctrl = this;

        ctrl.ok = ok;
        ctrl.cancel = cancel;

        ///////////////

        function ok() {
            $modalInstance.close('hello');
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }
    }

}(angular.module('materialscommons')));
