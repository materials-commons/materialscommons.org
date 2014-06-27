Application.Controllers.controller('toolbarDataEditNotes',
    ["$scope", "mcapi", "$state", "$stateParams", "User", "dateGenerate", "alertService",
        function ($scope, mcapi, $state, $stateParams, User, dateGenerate, alertService) {
            $scope.add_notes = function () {
                console.log($scope.model.new_note);
                $scope.doc.notes.push({'message': $scope.model.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
                $scope.saveData();
                $scope.model.new_note = "";
            };
            $scope.saveData = function () {
                mcapi('/datafile/update/%', $scope.id)
                    .success(function (data) {
                        alertService.sendMessage("Notes has been added");
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put($scope.doc);
            };

            function init() {
                $scope.id = $stateParams.data_id;
                $scope.model = {
                    new_note: ''
                };
                mcapi('/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.doc = data;
                    }).jsonp();
            }
            init();
        }]);