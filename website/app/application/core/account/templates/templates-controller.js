(function (module) {
    module.controller('accountTemplates', accountTemplates);
    accountTemplates.$inject = ["$scope", "mcapi", "User", "$filter", "model.templates"];

    function accountTemplates($scope, mcapi, User, $filter, templates) {
        $scope.check = function (t) {
            var status = $scope.preferred_templates.filter(function (el) {
                return el.template_name === t.template_name;
            })[0];
            if (status) {
                for (var i = 0; i < $scope.preferred_templates.length; i++)
                    if ($scope.preferred_templates[i].template_name === t.template_name) {
                        $scope.preferred_templates.splice(i, 1);
                        break;
                    }
            } else {
                var template = {
                    id: t.id,
                    template_name: t.template_name
                };
                $scope.preferred_templates.push(template);

            }
        };

        $scope.updatePreferences = function () {
            mcapi('/user/%/templates', User.u())
                .success(function (data) {
                    //alertService.sendMessage("Preferred templates have been updated");
                }).put({'templates': $scope.preferred_templates});
        };

        $scope.is_checked = function (t) {
            for (var i = 0; i < $scope.preferred_templates.length; i++) {
                if ($scope.preferred_templates[i].template_name === t.template_name) {
                    return true;
                }
            }
            return false;
        };

        $scope.showTemplate = function (t, index, type) {
            $scope.template = t;
        };

        function init() {
            $scope.preferred_templates = [];
            templates.getList().then(function (templates) {
                $scope.all_templates = templates;
                $scope.process_templates = $filter('byKey')(templates, 'template_type', 'process');
                $scope.experimental_templates = $filter('byKey')(templates, 'template_pick', 'experiment');
                $scope.computational_templates = $filter('byKey')(templates, 'template_pick', 'computation');
                $scope.sample_templates = $filter('byKey')(templates, 'template_type', 'material');
            });

            $scope.preferred_templates = User.attr().preferences.templates;
        }

        init();
    }
}(angular.module('materialscommons')));
