/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:09 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

function ExperimentListController($scope, cornercouch) {
    $scope.experiments = [
        {"name": "ALLISON-SEM-MAGNESIUSM",
        "snippet": "Test tensile strength of magnesium when heated"},
        {"name": "ALLISON-THERMAL-MAGNESIUSM-HYBRID",
            "snippet": "Alloying of magnesium/aluminum hybrid under extreme temperatures"},
        {"name": "ALLISON-SEM-CHROMIUM",
            "snippet": "Does chromium show same failure conditions as magnesium?"}
    ];

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "all_experiments");
}
