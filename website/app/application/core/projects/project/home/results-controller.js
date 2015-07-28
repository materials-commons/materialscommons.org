Application.Controllers.controller('searchResultsController',
    ["mcapi","project", "$stateParams", searchResultsController]);

function searchResultsController(mcapi, project, $stateParams) {
    var ctrl = this;

    mcapi("/search/project/%/files", project.id)
        .success(function(results) {
            console.dir(results);
            ctrl.result = results;
        })
        .post({query_string: $stateParams.query});
}