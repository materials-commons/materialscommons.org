Application.Controllers.controller('toolbarTemplates',
    ["$scope", "mcapi", "User", "alertService", function ($scope, mcapi, User, alertService) {
        $scope.addSelection = function (t) {
            $scope.preferred_templates.push(t);
        };

        $scope.updatePreferences = function () {
            mcapi('/user/%/templates', User.u())
                .success(function (data) {
                    alertService.sendMessage("Preferred templates have been updated");
                }).put({'templates': $scope.preferred_templates});
        };


        $scope.remove_template = function () {

        };

        $scope.is_checked = function (t) {
            var i = _.indexOf($scope.preferred_templates, function (item) {
                return (item.template_name === t.template_name);
            });
            if (i < -1){
                return true;
            }
        };


        function init() {
            $scope.preferred_templates = [];
            mcapi('/templates/by_pick/%', 'experiment')
                .success(function (data) {
                    $scope.experimental_templates = data;

                }).jsonp();

            mcapi('/templates/by_pick/%', 'computation')
                .success(function (data) {
                    $scope.computational_templates = data;
                }).jsonp();

            mcapi('/user/%/preferred_templates', User.u())
                .success(function (data) {
                    $scope.preferred_templates = data.preferences.templates;
                }).jsonp();
        }

        init();

    }]);