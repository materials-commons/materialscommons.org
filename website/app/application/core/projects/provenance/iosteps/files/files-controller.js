Application.Controllers.controller('projectsProvenanceIOStepsFiles',
    ["$scope", "ProvDrafts", "$stateParams", "pubsub", "Projects",  "model.projects", "watcher",
        function ($scope, ProvDrafts, $stateParams, pubsub, Projects, ListProjects, watcher) {
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
            $scope.selectProject = function(){
                $scope.project_id = $scope.bk.selected_project.id
            }

            function init() {
                $scope.bk ={
                    selected_project: ""
                }
                if ($stateParams.iostep === "inputs") {
                    $scope.channel = 'provenance.inputs.files';
                    $scope.files = ProvDrafts.current.process.input_files;
                } else {
                    $scope.channel = 'provenance.outputs.files';
                    $scope.files = ProvDrafts.current.process.output_files;
                }
                Projects.resetSelectedFiles($scope.files, ProvDrafts.current.project_id);
                Projects.setChannel($scope.channel);
                $scope.project_id = ProvDrafts.current.project_id;
                ListProjects.getList().then(function (data) {
                    $scope.projects = data;
                });
            }

            init();

            pubsub.waitOn($scope, $scope.channel, function (fileentry) {
                if (fileentry.selected) {
                    $scope.files.push(fileentry);
                } else {
                    var i = $scope.indexOfFile(fileentry.id);
                    if (i != -1) {
                        $scope.files.splice(i, 1);
                    }
                }
            });
        }]);
