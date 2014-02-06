function CreateNewMaterialController($scope,mcapi){

    mcapi('/materials')
        .success(function (data) {
            $scope.materials_list = data;
        })
        .error(function () {

        }).jsonp();

    $scope.clear_material = function () {
        $scope.material = '';
    }

    $scope.save = function () {
        var temp = $scope.material;
        console.log(temp)
        mcapi('/materials/new')
            .success(function (data) {
                mcapi('/materials/%', data.id)
                    .success(function (material_obj) {
                        $scope.mat = material_obj;
                        $scope.materials_list.push(material_obj)
                    })
                    .error(function (e) {

                    }).jsonp();
                $scope.material = "";

            })
            .error(function (e) {
            }).post(temp);
    }

    $scope.custom_property = function () {
        console.log($scope.additional_prop)
        if (!('model' in $scope.material)) {
            $scope.material.model = [];
        }
        if ($scope.additional_prop || $scope.additional_prop == ' ') {
            $scope.material.model.push({'name': $scope.additional_prop, 'value': ''})
            $scope.additional_prop = '';
        }

    }
}