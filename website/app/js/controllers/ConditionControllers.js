function CreateConditionControllers($scope, mcapi, formatData, alertService,User, $state) {
    $scope.properties = [];
    $scope.add_property = function () {
        $scope.properties.push($scope.doc.new_property);
    }
    $scope.owner = User.u();
    $scope.create_template = function () {
        var temp = {};
        $scope.doc.properties = formatData.reformat_conditions($scope.properties);
        $scope.doc.owner = $scope.owner;
        temp = $scope.doc;
        mcapi('/templates/new')
            .success(function (data) {
                $scope.msg = "New template " + $scope.doc.template_name + " has been created"
                alertService.sendMessage($scope.msg);
                $state.transitionTo('subpages.templatereport', {id: data.id})
            })
            .error(function (data) {
                alertService.sendMessage(data.error);
            }).post(temp);
    }
}

function ListConditionControllers($scope, mcapi, $state) {
    mcapi('/templates')
        .success(function (data) {
            $scope.templates = data;
        }).jsonp();

    $scope.display_template = function (t) {
        $state.transitionTo('subpages.templatereport', {id: t.id})
    }
}

function TemplateReportController($scope, $stateParams, mcapi) {
    mcapi('/templates/%', $stateParams.id)
        .success(function (template) {
            $scope.properties = [];
            $scope.created_template = template;
            $scope.created_template.model.forEach(function (p) {
                $scope.properties.push(p.name);
            });
        }).jsonp();
}