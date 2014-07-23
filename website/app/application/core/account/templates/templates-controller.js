Application.Controllers.controller('accountTemplates',
    ["$scope", "mcapi", "User", "alertService", "$filter", "Nav", function ($scope, mcapi, User, alertService, $filter, Nav) {
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
                    alertService.sendMessage("Preferred templates have been updated");
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
        $scope.showTemplate = function(t){
            console.log(t)
            $scope.temp = t;
        }

        function init() {
            Nav.setActiveNav('Templates');
            $scope.preferred_templates = [];
            mcapi('/templates')
                .argWithValue('filter_by', '"template_type":"process"')
                .success(function (processes) {
                    $scope.process_templates = processes;
                    $scope.experimental_templates = $filter('templateFilter')($scope.process_templates, 'experiment');
                    $scope.computational_templates = $filter('templateFilter')($scope.process_templates, 'computation');

                })
                .error(function () {
                    alertService.sendMessage("Unable to retrieve processes from database.");
                }).jsonp();

            mcapi('/user/%/preferred_templates', User.u())
                .success(function (data) {
                    $scope.preferred_templates = data.preferences.templates;
                }).jsonp();
        }

        init();

    }
    ])
;
