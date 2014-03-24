Application.Controllers.controller('toolbarProcessNotes',
    ["$scope", "mcapi", "$state", "$stateParams", "User", "dateGenerate", "alertService",
        function ($scope, mcapi, $state, $stateParams, User, dateGenerate, alertService) {
            $scope.add_notes = function () {
                $scope.doc.notes.push({'message': $scope.model.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
                $scope.saveProcess();
                $scope.model.new_note = "";
            };
            $scope.saveProcess = function () {
                mcapi('/process/update/%', $scope.id)
                    .success(function (data) {
                        alertService.sendMessage("Notes has been added");
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put($scope.doc);
            };

            function init() {
                $scope.id = $stateParams.id;
                $scope.model = {
                    new_note: ''
                };
                mcapi('/processes/%', $scope.id)
                    .success(function (data) {
                        $scope.doc = data;
                    }).jsonp();
            }
            init();
        }]);