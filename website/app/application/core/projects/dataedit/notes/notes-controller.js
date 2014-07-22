Application.Controllers.controller('projectsDataEditNotes',
    ["$scope", "mcapi", "$state", "$stateParams", "User", "dateGenerate", "alertService", "watcher",
        function ($scope, mcapi, $state, $stateParams, User, dateGenerate, alertService, watcher) {


            $scope.add_notes = function () {
                $scope.doc.notes.push({'message': $scope.model.new_note, 'who': User.u(), 'date': dateGenerate.new_date()});
                $scope.saveData();
                $scope.model.new_note = "";
            };
            $scope.saveData = function () {
                mcapi('/datafile/update/%', $scope.id)
                    .success(function (data) {
                        alertService.sendMessage("Notes has been added");
                        $scope.get_datafile();
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put($scope.doc);
            };

            $scope.get_datafile = function () {
                mcapi('/datafile/%', $scope.id)
                    .success(function (data) {
                        $scope.doc = data;
                    }).jsonp();
            };

            function init() {
                $scope.htmlContent =
                    $scope.id = $stateParams.data_id;
                $scope.model = {
                    new_note: ""
                };
                $scope.get_datafile();
            }

            init();
        }]);