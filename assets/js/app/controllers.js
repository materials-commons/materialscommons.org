/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:09 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

function ExperimentListController($scope, $location, cornercouch) {

    var mcdb = {rows:[
        { value:{"_id":"1", "name":"ALLISON-SEM-MAGNESIUSM",
            "description":"Test tensile strength of magnesium when heated"}},
        { value:{"_id":"2", "name":"ALLISON-THERMAL-MAGNESIUSM-HYBRID",
            "description":"Alloying of magnesium/aluminum hybrid under extreme temperatures"}},
        { value:{"_id":"3", "name":"ALLISON-SEM-CHROMIUM",
            "description":"Does chromium show same failure conditions as magnesium?"}}
    ]};

    console.log($location.url());

    $scope.mcdb = mcdb;

//    $scope.server = cornercouch();
//    $scope.server.session();
//    $scope.mcdb = $scope.server.getDB("materialscommons");
//    $scope.mcdb.query("materialscommons-app", "all_experiments");

    //$scope
}

function ExperimentDetailController($scope, $routeParams) {
    console.log("ExperimentDetailController");
    $scope.experimentId = $routeParams.experimentId;
}
