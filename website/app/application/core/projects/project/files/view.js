Application.Controllers.controller('projectFilesViewFile',
                                   ["toastr", "$scope", "mcapi", "ProjectPath", "User",
                                    "projectFiles", "$stateParams", "ui", "projectFileTabs",
                                    "recent", "project", projectFilesViewFile]);

function projectFilesViewFile(toastr, $scope, mcapi, ProjectPath, User, projectFiles,
                              $stateParams, ui, projectFileTabs, recent, project) {

    $scope.project = project;
    $scope.addTag = function (entry, selected_tag) {
        //Filling tag join table
        var item2tag = {};
        item2tag.item_id = entry.id;
        item2tag.item_name = entry.name;
        item2tag.item_type = 'datafile';
        item2tag.user = User.u();
        item2tag.tag = selected_tag;
        item2tag.datadir_id = $scope.file.datadirs[0];
        mcapi('/item/tag/new')
            .success(function (data) {
                $scope.file.tags.push(item2tag.tag);
                var i;
                i = _.indexOf($scope.dir, function (item) {
                    return item.id === entry.id;
                });
                if(i != -1){
                    if ((Object.keys($scope.dir[i]['tags'])).indexOf($scope.user) === 0){
                        $scope.dir[i]['tags'][$scope.user].push(selected_tag);
                    }
                    else{
                        $scope.dir[i]['tags'][$scope.user] = [selected_tag];
                    }
                }
            }).error(function(e){
                toastr.error(e.error, 'Error', {
                    closeButton: true
                });
            }).post(item2tag);
        //Sticking tag in the tree
    };

    $scope.close = function() {
        projectFileTabs.delete($stateParams.id, $scope.file);
        recent.gotoLast($stateParams.id);
    };

    function init() {
        $scope.file = {};
        ui.setShowFiles($stateParams.id, true);
        $scope.user = User.u();
        $scope.user_tags = User.attr().preferences.tags;
        //This code is to populate tags in the tree when any tag is added from datafile page
        // $scope.model = projectFiles.model;
        // $scope.dir = $scope.model.projects[$stateParams.id].dir.children;
        //////end//////
        mcapi('/datafile/%', $stateParams.fileid)
            .success(function (data) {
                $scope.file = data;
                $scope.trail = ProjectPath.get_trail();
                $scope.dir = ProjectPath.get_dir();
                $scope.fileType = "other";
                if (isImage($scope.file.name)) {
                    $scope.fileType = "image";
                } else if (_.str.endsWith($scope.file.name, "pdf")) {
                    $scope.fileType = "pdf";
                }

                $scope.fileSrc = "datafiles/static/" + $scope.file.id + "?apikey=" + User.apikey();
                $scope.originalFileSrc = "datafiles/static/" + $scope.file.id + "?apikey=" + User.apikey() + "&download=true";
            }).jsonp();
    }

    init();
}
