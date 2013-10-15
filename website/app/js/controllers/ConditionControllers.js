function CreateConditionControllers($scope, mcapi){
    $scope.properties = [];

    $scope.add_property = function(){
        $scope.properties.push($scope.new_property);
    }

    $scope.create_template = function(){
        var temp = {};
        $scope.doc.properties = $scope.properties;
        temp = $scope.doc;
        mcapi('/templates/new')
            .success(function(data){
                console.log(' success');
            })
            .error(function(data){
                console.log(' error');
            }).post(temp)

    }

}

function ListConditionControllers($scope, mcapi){

}