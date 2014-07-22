Application.Controllers.controller('projectsDataEditDetails',
    ["$scope", "$window", "mcapi", "alertService", "$state", "$stateParams", "pubsub", "User", "ProjectPath", "Projects",
        function ($scope, $window, mcapi, alertService, $state, $stateParams, pubsub, User, ProjectPath, Projects) {

            $scope.setupAccessToUserFile = function () {
                if (isImage($scope.doc.name)) {
                    $scope.fileType = "image";
                } else {
                    $scope.fileType = "other";
                }
                $scope.fileSrc = "datafiles/static/" + $scope.doc.id + "?apikey=" + User.apikey();
                $scope.originalFileSrc = "datafiles/static/" + $scope.doc.id + "?apikey=" + User.apikey() + "&download=true";
                $scope.fileName = $scope.doc.name;
            };

            $scope.saveData = function () {
                $scope.doc.description = $scope.model.desc;
                mcapi('/datafile/update/%', $scope.doc.id)
                    .success(function (data) {
                        $scope.model.is_disabled = true;
                        alertService.sendMessage("Data has been saved");
                    }).error(function (data) {
                        alertService.sendMessage(data.error);
                    }).put($scope.doc);
//$window.history.back();
            };

            $scope.cancel = function () {
                $scope.model.is_disabled = true;
                $scope.model.desc = $scope.doc.description;

            };

            $scope.edit_details = function () {
                $scope.model.is_disabled = false;
            };
            function init() {
                $scope.model = {
                    is_disabled: true,
                    desc: ''
                };
                $scope.id = $stateParams.data_id;
                $scope.modal = Projects.model;
                mcapi('/datafile/%', $stateParams.data_id)
                    .success(function (data) {
                        $scope.doc = data;
                        $scope.model.desc = $scope.doc.description;
                        $scope.setupAccessToUserFile();
                        $scope.trail = ProjectPath.get_trail();
                        $scope.dir = ProjectPath.get_dir();
                    })
                    .error(function (data) {
                        alertService.sendMessage(data.error);
                    }).jsonp();
            }

            init();
        }]);
