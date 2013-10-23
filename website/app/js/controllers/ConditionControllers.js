function CreateConditionControllers($scope, mcapi, formatData, alertService, $location){
    $scope.properties = [];
    $scope.add_property = function(){
        $scope.properties.push($scope.doc.new_property);
    }

//    $scope.change_properties = function(value){
//        if (value == 'condition'){
//            $scope.properties = [];
//            $scope.created_template = '';
//        }
//        if (value == 'process'){
//            $scope.properties = [];
//            $scope.created_template = '';
//        }
//    }
    $scope.create_template = function(){
        var temp = {};
        $scope.doc.properties = formatData.reformat_conditions($scope.properties);
        temp = $scope.doc;
        mcapi('/templates/new')
            .success(function(data){
                $scope.msg = "New template " + $scope.doc.template_name + " has been created"
                alertService.prepForBroadcast($scope.msg);
                $location.path('/conditions/template-report/' + data.id);
            })
            .error(function(data){
                alertService.prepForBroadcast(data.error);
            }).post(temp);


    }

}

function ListConditionControllers($scope, mcapi, $location){
    mcapi('/templates')
        .success(function(data){
            $scope.templates = data;
        }).jsonp();

    $scope.display_template = function(t){
        console.log('here '+ t.id);
        $location.path('/conditions/template-report/' + t.id);

    }


}

function TemplateReportController($scope,  $routeParams, mcapi){
    mcapi('/templates/%', $routeParams.id)
        .success(function(template){
            $scope.properties = [];
            $scope.created_template = template;
            $scope.created_template.model.forEach( function(p){
                $scope.properties.push(p.name);
            });
        }).jsonp();


}