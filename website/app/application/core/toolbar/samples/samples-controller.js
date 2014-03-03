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
            $scope.doc.owner = User.u();
            mcapi('/samples/new')
                .success(function (data) {
                    mcapi('/samples/%', data.id)
                        .success(function (sample_obj) {
                            $scope.sample = sample_obj;
                            $scope.samples_list.unshift(sample_obj);
                        })
                        .error(function (e) {

                        }).jsonp();
                    $scope.init();
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