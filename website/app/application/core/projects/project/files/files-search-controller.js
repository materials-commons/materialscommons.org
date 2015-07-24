Application.Controllers.controller("FilesSearchController", ["$state", FilesSearchController]);
function FilesSearchController($state) {
    console.log("FileSearchController");
    var ctrl = this;
    ctrl.showResults = showResults;

    /////////////////
    function showResults() {
        $state.go('projects.project.files.search');
    }
}
