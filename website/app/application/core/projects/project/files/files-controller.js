Application.Controllers.controller("FilesController", ["$state", FilesController]);
function FilesController($state) {
    //console.log("FileController going to projects.project.files.all");
    //$state.go('projects.project.files.all');
    var ctrl = this;

    ctrl.showSearchResults = showSearchResults;

    //////////////////
    function showSearchResults() {
        $state.go('projects.project.files.search');
    }
}
