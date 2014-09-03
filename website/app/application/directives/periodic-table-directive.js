Application.Controllers.controller("PeriodicTableController",
    ["$scope", "watcher", function ($scope) {

        $scope.addElement = function (ele) {
            $scope.doc.composition.value.push({'element': ele, 'value': ''});
        };
        $scope.removeElement = function (i) {
            $scope.doc.composition.value.splice(i, 1);
        };

        function init() {
            $scope.doc.composition.unit = "at%"; //setting default unit for composition
            $scope.panel_one_elements = ["H", "Li", "Na", "K", "Rb", "Cs", "Fr"];
            $scope.panel_two_elements = ["Be", "Mg", "Ca", "Sr", "Ba", "Ra"];
            $scope.panel_three_elements = ["Sc", "Y", "La-Lu", "Ac-Lr"];
            $scope.panel_three_1_elements = ["Ti", "Zr", "Hf", "Rf"];
            $scope.panel_three_2_elements = ["V", "Nb", "Ta", "Db"];
            $scope.panel_three_3_elements = ["Cr", "Mb", "W", "Sg"];
            $scope.panel_three_4_elements = ["Mn", "Tc", "Re", "Bh"];
            $scope.panel_three_5_elements = ["Fe", "Ru", "Os", "Hs"];
            $scope.panel_three_6_elements = ["Co", "Rh", "Ir", "Mt"];
            $scope.panel_three_7_elements = ["Ni", "Pd", "Pt", "Ds"];
            $scope.panel_three_8_elements = ["Cu", "Ag", "Au", "Rg"];
            $scope.panel_three_9_elements = ["Zn", "Cd", "Hg", "Cn"];
            $scope.panel_two_1_elements = ["B", "Al", "Ga", "In", "Ti", "Uut"];
            $scope.panel_two_2_elements = ["C", "Si", "Ge", "Sn", "Rb", "Fl"];
            $scope.panel_two_3_elements = ["N", "P", "As", "Sb", "Bi", "Uup"];
            $scope.panel_two_4_elements = ["O", "S", "Se", "Te", "Po", "Lv"];
            $scope.panel_two_5_elements = ["F", "Cl", "Br", "I", "At", "Uus"];
            $scope.panel_one_1_elements = ["He", "Ne", "Ar", "Kr", "Xe", "Rn", "Uuo"];
        }

        init();
    }]);
Application.Directives.directive('periodicTable',
    function () {
        return {
            restrict: "A",
            controller: 'PeriodicTableController',
            scope: {
                doc: '='
            },
            templateUrl: 'application/directives/periodic-table.html'
        };
    });