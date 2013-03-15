function MyLabTabController($scope, $routeParams) {
    $scope.template = "partials/mylab/experiment-list.html";
    if ($routeParams.tab) {
        switch ($routeParams.tab) {
            case "myexperiments":
                $scope.template = partialForMyExperimentsRoute();
//                $scope.template = "partials/mylab/experiment-list.html";
                $('#my-experiments-tab').addClass("active");
                break;
            case "mydata":
//                $scope.template = "partials/mylab/mydata/mydata.html";
                $scope.template = partialForMyDataRoute();
                $('#my-data-tab').addClass("active");
                break;
            case "myreferences":
                $scope.template = "partials/mylab/myreferences.html";
                $('#my-references-tab').addClass("active");
                break;
            case "myforms":
                $scope.template="partials/mylab/myforms/myforms.html";
                $('#my-forms-tab').addClass("active");
                break;
            default:
                $scope.template = "partials/mylab/experiment-list.html";
                $('#my-experiments-tab').addClass("active");
                break;
        }
    }

    function partialForMyExperimentsRoute() {
        if ($routeParams.subpage == "experiment-list") {
            return "partials/mylab/experiment-list.html";
        }
        else if ($routeParams.subpage == "create-experiment") {
            return "partials/mylab/experiment.html";
        }
        else if ($routeParams.subpage == "edit-experiment") {
            return "partials/mylab/experiment.html";
        }
    }

    function partialForMyDataRoute() {
        if ($routeParams.subpage == "edit-data") {
            return "partials/mylab/mydata/data.html";
        }
        else if ($routeParams.subpage == "add-data") {
            return "partials/mylab/mydata/add-data.html";
        }
        else {
            return "partials/mylab/mydata/mydata.html";
        }
    }
}