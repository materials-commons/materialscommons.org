Application.Controllers.controller('toolbarSamples',
    ["$scope", "mcapi", "User", function ($scope, mcapi, User) {

        $scope.update = function () {
            $scope.doc.model.default = $scope.template.model.default;
            $scope.doc.model.additional = $scope.template.model.additional;
        };

        $scope.addAdditionalProperty = function () {
            $scope.doc.model.added_properties.push(JSON.parse($scope.additionalProperty));
        };

        $scope.addCustomProperty = function () {
            $scope.doc.model.added_properties.push({'name': $scope.customPropertyName, 'value': $scope.customPropertyValue, 'unit': '', 'value_choice': [], 'unit_choice': []});
        };

        $scope.save = function () {
            console.log('yes')
            $scope.doc.owner = User.u();
            mcapi('/samples/new')
                .success(function (data){
                    console.log(data);
                    mcapi('/samples/%', data.id)
                        .success(function (sample_obj) {
                            $scope.sample = sample_obj;
                            $scope.sample_list.unshift(sample_obj);
                            console.log($scope.sample_list);
                        })
                        .error(function (e) {

                        }).jsonp();
                    $scope.doc = {
                        'material': {},
                        'model': {
                            'added_properties': [],
                            'default': [],
                            'additional': []
                        }
                    };
                })
                .error(function (e) {

                }).post($scope.doc);
        };

        $scope.init = function () {
            $scope.doc = {'model': {
                'added_properties': [],
                'default': [],
                'additional': []
            }};
            $scope.selected_template = '';
            mcapi('/materials')
                .success(function (data) {
                    $scope.materials = data;
                })
                .error(function (data) {
                }).jsonp();

            mcapi('/templates')
                .argWithValue('filter_by', '"owner":"gtarcea@umich.edu", "template_pick":"material"')
                .success(function (data) {
                    $scope.templates = data;
                })
                .error(function (data) {
                }).jsonp();
        };
        $scope.init();

    }]);