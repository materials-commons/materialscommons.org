/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:09 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

function ExperimentListController($scope, $location, cornercouch) {

//    var mcdb = {rows:[
//        { value:{"_id":"1", "name":"ALLISON-SEM-MAGNESIUSM",
//            "description":"Test tensile strength of magnesium when heated"}},
//        { value:{"_id":"2", "name":"ALLISON-THERMAL-MAGNESIUSM-HYBRID",
//            "description":"Alloying of magnesium/aluminum hybrid under extreme temperatures"}},
//        { value:{"_id":"3", "name":"ALLISON-SEM-CHROMIUM",
//            "description":"Does chromium show same failure conditions as magnesium?"}}
//    ]};
//
//    $scope.mcdb = mcdb;

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "all_experiments");

    //$scope
}

function ExperimentDetailController($scope, $routeParams, cornercouch) {
    $scope.experimentId = $routeParams.experimentId;
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.experiment = $scope.mcdb.getDoc($scope.experimentId);

    $scope.deleteExperiment = function() {
        $scope.experiment.remove().success(function() {
            alert("Deleted experiment");
        });
    }

    //$scope.$on('$viewContentLoaded', showExperimentLayout);
}

function MessagesController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "recent_events");
}

function ChartController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.chart_data = $scope.mcdb.getDoc("942ecdf121a6f788cc86a10a7e3e8ab6");

    $scope.$on('$viewContentLoaded', function() {
        alert("viewContentLoaded");
        $("span[data-chart=peity-bar]").peity("bar");
    });
}

function FrontPageController($scope, $routeParams) {
    // Nothing to do yet.
}

function DataSearchController($scope, $routeParams) {
    // Nothing to do yet
}

function ModelsSearchController($scope, $routeParams) {
    // Nothing to do yet
}

function ExperimentCreateController($scope, $routeParams) {
    $scope.$on('$viewContentLoaded', setupWizard);

    $scope.testClick = function() {
        alert("testClick");
    }
}
