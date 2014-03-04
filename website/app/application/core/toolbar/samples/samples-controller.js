Application.Controllers.controller('toolbarSamples',
    ["$scope", "mcapi", "User", function ($scope, mcapi, User) {
        $scope.model = {
            additionalProperty: {},
            template: null,
            customPropertyName: null,
            customPropertyValue: null
        };

        $scope.update = function () {
            $scope.doc.model.default = $scope.model.template.model.default;
            $scope.doc.model.additional = $scope.model.template.model.additional;
        };

        $scope.addAdditionalProperty = function () {
            $scope.doc.model.added_properties.push($scope.model.additionalProperty);
        };

        $scope.addCustomProperty = function () {
            $scope.doc.model.added_properties.push({'name': $scope.model.customPropertyName, 'value': $scope.model.customPropertyValue, 'unit': '', 'value_choice': [], 'unit_choice': []});
        };

        $scope.save = function () {
            $scope.doc.owner = User.u();
            mcapi('/samples/new')
                .success(function (data) {
                    $scope.doc = {'model': {
                        'added_properties': [],
                        'default': [],
                        'additional': []
                    }};
                    $scope.model.customPropertyName = '';
                    $scope.model.customPropertyValue = '';
                    $scope.model.template = '';
                    mcapi('/samples/%', data.id)
                        .success(function (sample_obj) {
                            $scope.sample = sample_obj;
                            $scope.samples_list.push(sample_obj);
                        })
                        .error(function (e) {

                        }).jsonp();
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
            mcapi('/materials')
                .success(function (data) {
                    $scope.materials = data;
                }).jsonp();

            mcapi('/templates')
                .argWithValue('filter_by', '"template_pick":"material"')
                .success(function (data) {
                    $scope.templates = data;
                })
                .error(function (data) {
                }).jsonp();

            mcapi('/samples')
                .argWithValue('filter_by', '"owner": User.u()')
                .success(function (data) {
                    $scope.samples_list = data;
                })
                .error(function (data) {
                }).jsonp();
        };
        $scope.init();

    }]);