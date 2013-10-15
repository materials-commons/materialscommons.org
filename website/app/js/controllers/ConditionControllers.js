function CreateConditionControllers($scope, mcapi, formatData, alertService, $location){
    $scope.properties = [];


    $scope.add_property = function(){
        $scope.properties.push($scope.new_property);
    }

    $scope.create_template = function(){
        var temp = {};
        $scope.doc.properties = formatData.reformat_conditions($scope.properties);
        console.dir($scope.doc);
        temp = $scope.doc;
        mcapi('/templates/new')
            .success(function(data){
                $scope.msg = "New template " + $scope.doc.template_name + " has been created"
                alertService.prepForBroadcast($scope.msg);
                $location.path("/conditions/template/list");

            })
            .error(function(data){
                console.log(' error');
            }).post(temp);


    }

}

function ListConditionControllers($scope, mcapi){
    mcapi('/templates')
        .success(function(data){
            $scope.templates = data;
        }).jsonp();


}