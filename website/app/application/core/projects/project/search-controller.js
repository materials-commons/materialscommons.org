Application.Controllers.controller('searchController',
    ["mcapi", "project", "$stateParams", searchController]);

function searchController(mcapi, project, $stateParams) {
    var ctrl = this;

    mcapi("/search/project/%/files", project.id)
        .success(function (results) {
            ctrl.results = results;
        })
        .post({query_string: $stateParams.query});
}