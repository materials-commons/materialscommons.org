Application.Controllers.controller("FilesController", ["$state", FilesController]);
function FilesController($state) {
    var ctrl = this;

    ctrl.showSearchResults = showSearchResults;

    init();

    //////////////////
    function showSearchResults() {
        $state.go('projects.project.files.search');
    }

    function init() {
        if ($state.current.name == "projects.project.files") {
            $state.go('projects.project.files.all');
        }
    }
}
