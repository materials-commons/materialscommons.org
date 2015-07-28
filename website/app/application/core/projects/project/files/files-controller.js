Application.Controllers.controller("FilesController", ["$state", FilesController]);
function FilesController($state) {
    var ctrl = this;

    ctrl.showSearchResults = showSearchResults;

    //////////////////
    function showSearchResults() {
        $state.go('projects.project.files.search');
    }
}
