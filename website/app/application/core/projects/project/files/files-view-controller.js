Application.Controllers.controller("projectFileView",
    ["$scope", "model.projects", "$stateParams", "mcapi", "User", "ProjectPath", projectFileView]);

function projectFileView($scope, Projects,$stateParams, mcapi, User, ProjectPath) {
    $scope.expand = function(df){
        $scope.datafile = df;
    }

    $scope.getTrail = function(){




    }
    $scope.getImages = function(){
        var item = ProjectPath.get_current_item();
        if (item == ""){
            $scope.datadir = $scope.project.datadir
                mcapi('/datafile/ids/%', $scope.datadir)
                .success(function (data) {
                    $scope.datafiles = data;
                }).jsonp()
        }
        else{
//            $scope.datadir = item.id;
                $scope.datafiles = item.children;
        }

    }

    function init(){
        $scope.apikey = User.apikey();
        Projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
            console.log($scope.project)
//            $scope.getImages('c90b6650-7e25-4e87-86b1-3e145ff3a682');
            $scope.getImages();

        });

    }
    init();
}
