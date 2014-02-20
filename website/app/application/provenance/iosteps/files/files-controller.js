Application.Provenance.Controllers.controller('provenanceIOStepsFiles',
    ["$scope", "ProvDrafts", "$stateParams", "pubsub", "Projects",
        function ($scope, ProvDrafts, $stateParams, pubsub, Projects) {

            pubsub.waitOn($scope, $scope.channel, function (fileentry) {
                console.log("waitOn fileentry selected = " + fileentry.selected);
                if (fileentry.selected) {
                    $scope.files.push(fileentry);
                } else {
                    var i = $scope.indexOfFile(fileentry.id);
                    if (i != -1) {
                        $scope.files.splice(i, 1);
                    }
                }
            });

            $scope.removeFile = function (index) {
                $scope.files[index].selected = false;
                $scope.files.splice(index, 1);
            };

            $scope.indexOfFile = function (id) {
                for (var i = 0; i < $scope.files.length; i++) {
                    if ($scope.files[i].id == id) {
                        return i;
                    }
                }
                return -1;
            };

            $scope.init = function () {
                if ($stateParams.iostep === "inputs") {
                    $scope.channel = 'provenance.inputs.files';
                    $scope.files = ProvDrafts.current.attributes.process.required_input_files;
                } else {
                    $scope.channel = 'provenance.outputs.files';
                    $scope.files = ProvDrafts.current.attributes.process.required_output_files;
                }
                Projects.setChannel(channel);
            };

            $scope.init();
        }]);