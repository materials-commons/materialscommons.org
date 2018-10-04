angular.module('materialscommons').directive('periodicTable',
    function() {
        return {
            restrict: "E",
            controller: PeriodicTableController,
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                composition: '=composition'
            },
            template: require('./periodic-table.html')
        };
    });

function PeriodicTableController(focus) {
    'ngInject';

    var ctrl = this;

    ctrl.addElement = addElement;
    ctrl.removeElement = removeElement;
    ctrl.showRemaining = showRemaining;
    ctrl.getElementColor = getElementColor;
    ctrl.addElementFromInput = addElementFromInput;
    ctrl.elementName = '';
    ctrl.elementPercentage = 0;
    ctrl.lookForMatches = lookForMatches;

    ctrl.composition.unit = "at%"; //setting default unit for composition

    ctrl.panel_one_elements = [
        {e: "H", chosen: false, color: 'element-other-nonmetal'},
        {e: "Li", chosen: false, color: 'element-alkali-metal'},
        {e: "Na", chosen: false, color: 'element-alkali-metal'},
        {e: "K", chosen: false, color: 'element-alkali-metal'},
        {e: "Rb", chosen: false, color: 'element-alkali-metal'},
        {e: "Cs", chosen: false, color: 'element-alkali-metal'},
        {e: "Fr", chosen: false, color: 'element-alkali-metal'}
    ];

    ctrl.panel_two_elements = [
        {e: "Be", chosen: false, color: 'element-alkaline-earth-metal'},
        {e: "Mg", chosen: false, color: 'element-alkaline-earth-metal'},
        {e: "Ca", chosen: false, color: 'element-alkaline-earth-metal'},
        {e: "Sr", chosen: false, color: 'element-alkaline-earth-metal'},
        {e: "Ba", chosen: false, color: 'element-alkaline-earth-metal'},
        {e: "Ra", chosen: false, color: 'element-alkaline-earth-metal'}
    ];

    ctrl.panel_three_elements = [
        {e: "Sc", chosen: false, color: 'element-transition-metal'},
        {e: "Y", chosen: false, color: 'element-transition-metal'},
        {e: "La-Lu", chosen: false, color: 'element-lanthanoid'},
        {e: "Ac-Lr", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.panel_three_1_elements = [
        {e: "Ti", chosen: false, color: 'element-transition-metal'},
        {e: "Zr", chosen: false, color: 'element-transition-metal'},
        {e: "Hf", chosen: false, color: 'element-transition-metal'},
        {e: "Rf", chosen: false, color: 'element-transition-metal'}
    ];

    ctrl.panel_three_2_elements = [
        {e: "V", chosen: false, color: 'element-transition-metal'},
        {e: "Nb", chosen: false, color: 'element-transition-metal'},
        {e: "Ta", chosen: false, color: 'element-transition-metal'},
        {e: "Db", chosen: false, color: 'element-transition-metal'}
    ];

    ctrl.panel_three_3_elements = [
        {e: "Cr", chosen: false, color: 'element-transition-metal'},
        {e: "Mb", chosen: false, color: 'element-transition-metal'},
        {e: "W", chosen: false, color: 'element-transition-metal'},
        {e: "Sg", chosen: false, color: 'element-transition-metal'}
    ];

    ctrl.panel_three_4_elements = [
        {e: "Mn", chosen: false, color: 'element-transition-metal'},
        {e: "Tc", chosen: false, color: 'element-transition-metal'},
        {e: "Re", chosen: false, color: 'element-transition-metal'},
        {e: "Bh", chosen: false, color: 'element-transition-metal'}
    ];

    ctrl.panel_three_5_elements = [
        {e: "Fe", chosen: false, color: 'element-transition-metal'},
        {e: "Ru", chosen: false, color: 'element-transition-metal'},
        {e: "Os", chosen: false, color: 'element-transition-metal'},
        {e: "Hs", chosen: false, color: 'element-transition-metal'}
    ];

    ctrl.panel_three_6_elements = [
        {e: "Co", chosen: false, color: 'element-transition-metal'},
        {e: "Rh", chosen: false, color: 'element-transition-metal'},
        {e: "Ir", chosen: false, color: 'element-transition-metal'},
        {e: "Mt", chosen: false, color: 'element-transition-metal'}
    ];

    ctrl.panel_three_7_elements = [
        {e: "Ni", chosen: false, color: 'element-transition-metal'},
        {e: "Pd", chosen: false, color: 'element-transition-metal'},
        {e: "Pt", chosen: false, color: 'element-transition-metal'},
        {e: "Ds", chosen: false, color: 'element-transition-metal'}
    ];

    ctrl.panel_three_8_elements = [
        {e: "Cu", chosen: false, color: 'element-transition-metal'},
        {e: "Ag", chosen: false, color: 'element-transition-metal'},
        {e: "Au", chosen: false, color: 'element-transition-metal'},
        {e: "Rg", chosen: false, color: 'element-transition-metal'}
    ];

    ctrl.panel_three_9_elements = [
        {e: "Zn", chosen: false, color: 'element-transition-metal'},
        {e: "Cd", chosen: false, color: 'element-transition-metal'},
        {e: "Hg", chosen: false, color: 'element-transition-metal'},
        {e: "Cn", chosen: false, color: 'element-transition-metal'}
    ];

    ctrl.panel_two_1_elements = [
        {e: "B", chosen: false, color: 'element-metalloid'},
        {e: "Al", chosen: false, color: 'element-post-transition-metal'},
        {e: "Ga", chosen: false, color: 'element-post-transition-metal'},
        {e: "In", chosen: false, color: 'element-post-transition-metal'},
        {e: "Ti", chosen: false, color: 'element-post-transition-metal'},
        {e: "Uut", chosen: false, color: 'element-post-transition-metal'}
    ];

    ctrl.panel_two_2_elements = [
        {e: "C", chosen: false, color: 'element-other-nonmetal'},
        {e: "Si", chosen: false, color: 'element-metalloid'},
        {e: "Ge", chosen: false, color: 'element-metalloid'},
        {e: "Sn", chosen: false, color: 'element-post-transition-metal'},
        {e: "Pb", chosen: false, color: 'element-post-transition-metal'},
        {e: "Fl", chosen: false, color: 'element-post-transition-metal'}
    ];

    ctrl.panel_two_3_elements = [
        {e: "N", chosen: false, color: 'element-other-nonmetal'},
        {e: "P", chosen: false, color: 'element-other-nonmetal'},
        {e: "As", chosen: false, color: 'element-metalloid'},
        {e: "Sb", chosen: false, color: 'element-metalloid'},
        {e: "Bi", chosen: false, color: 'element-post-transition-metal'},
        {e: "Uup", chosen: false, color: 'element-post-transition-metal'}
    ];

    ctrl.panel_two_4_elements = [
        {e: "O", chosen: false, color: 'element-other-nonmetal'},
        {e: "S", chosen: false, color: 'element-other-nonmetal'},
        {e: "Se", chosen: false, color: 'element-other-nonmetal'},
        {e: "Te", chosen: false, color: 'element-metalloid'},
        {e: "Po", chosen: false, color: 'element-metalloid'},
        {e: "Lv", chosen: false, color: 'element-post-transition-metal'}
    ];

    ctrl.panel_two_5_elements = [
        {e: "F", chosen: false, color: 'element-halogen'},
        {e: "Cl", chosen: false, color: 'element-halogen'},
        {e: "Br", chosen: false, color: 'element-halogen'},
        {e: "I", chosen: false, color: 'element-halogen'},
        {e: "At", chosen: false, color: 'element-halogen'},
        {e: "Uus", chosen: false, color: 'element-halogen'}
    ];

    ctrl.panel_one_1_elements = [
        {e: "He", chosen: false, color: 'element-noble-gas'},
        {e: "Ne", chosen: false, color: 'element-noble-gas'},
        {e: "Ar", chosen: false, color: 'element-noble-gas'},
        {e: "Kr", chosen: false, color: 'element-noble-gas'},
        {e: "Xe", chosen: false, color: 'element-noble-gas'},
        {e: "Rn", chosen: false, color: 'element-noble-gas'},
        {e: "Uuo", chosen: false, color: 'element-noble-gas'}
    ];

    ctrl.bottom_1_elements = [
        {e: "La", chosen: false, color: 'element-lanthanoid'},
        {e: "Ac", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_2_elements = [
        {e: "Ce", chosen: false, color: 'element-lanthanoid'},
        {e: "Th", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_3_elements = [
        {e: "Pr", chosen: false, color: 'element-lanthanoid'},
        {e: "Pa", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_4_elements = [
        {e: "Nd", chosen: false, color: 'element-lanthanoid'},
        {e: "U", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_5_elements = [
        {e: "Pm", chosen: false, color: 'element-lanthanoid'},
        {e: "Np", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_6_elements = [
        {e: "Sm", chosen: false, color: 'element-lanthanoid'},
        {e: "Pu", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_7_elements = [
        {e: "Eu", chosen: false, color: 'element-lanthanoid'},
        {e: "Am", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_8_elements = [
        {e: "Gd", chosen: false, color: 'element-lanthanoid'},
        {e: "Cm", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_9_elements = [
        {e: "Tb", chosen: false, color: 'element-lanthanoid'},
        {e: "Bk", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_10_elements = [
        {e: "Dy", chosen: false, color: 'element-lanthanoid'},
        {e: "Cf", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_11_elements = [
        {e: "Ho", chosen: false, color: 'element-lanthanoid'},
        {e: "Es", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_12_elements = [
        {e: "Er", chosen: false, color: 'element-lanthanoid'},
        {e: "Fm", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_13_elements = [
        {e: "Tm", chosen: false, color: 'element-lanthanoid'},
        {e: "Md", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_14_elements = [
        {e: "Yb", chosen: false, color: 'element-lanthanoid'},
        {e: "No", chosen: false, color: 'element-actinoid'}
    ];

    ctrl.bottom_15_elements = [
        {e: "Lu", chosen: false, color: 'element-lanthanoid'},
        {e: "Lr", chosen: false, color: 'element-actinoid'}
    ];

    var allElements = [].concat(ctrl.panel_one_elements, ctrl.panel_two_elements,
        ctrl.panel_three_elements, ctrl.panel_three_1_elements, ctrl.panel_three_2_elements,
        ctrl.panel_three_3_elements, ctrl.panel_three_4_elements, ctrl.panel_three_5_elements,
        ctrl.panel_three_6_elements, ctrl.panel_three_7_elements, ctrl.panel_three_8_elements,
        ctrl.panel_three_9_elements, ctrl.panel_two_1_elements, ctrl.panel_two_2_elements,
        ctrl.panel_two_3_elements, ctrl.panel_two_4_elements, ctrl.panel_two_5_elements,
        ctrl.panel_one_1_elements, ctrl.bottom_1_elements, ctrl.bottom_2_elements,
        ctrl.bottom_3_elements, ctrl.bottom_4_elements, ctrl.bottom_5_elements,
        ctrl.bottom_6_elements, ctrl.bottom_7_elements, ctrl.bottom_8_elements,
        ctrl.bottom_9_elements, ctrl.bottom_10_elements, ctrl.bottom_11_elements,
        ctrl.bottom_12_elements, ctrl.bottom_13_elements, ctrl.bottom_14_elements,
        ctrl.bottom_15_elements);
    var matchingElements = [];

    ////////////////////////////////

    function addElement(element) {
        if (!element.chosen) {
            ctrl.composition.value.push({element: element.e, value: 0});
            element.chosen = true;
        }
    }

    function removeElement(index) {
        if (index === 0) {
            // Removing base element so clear everything
            ctrl.composition.value.length = 0;
            allElements.forEach(function(e) { e.chosen = false; });
            matchingElements.length = 0;
            return;
        }
        var e = ctrl.composition.value[index].element;
        ctrl.composition.value.splice(index, 1);
        var i = _.findIndex(allElements, {e: e});
        if (i !== -1) {
            allElements[i].chosen = false;
        }
    }

    function addElementFromInput() {
        var i = _.findIndex(allElements, function(e) { return e.e.toUpperCase() == ctrl.elementName.toUpperCase()});
        if (i !== -1 && !allElements[i].chosen) {
            var element = allElements[i];
            ctrl.composition.value.push({element: element.e, value: ctrl.elementPercentage});
            element.chosen = true;
            ctrl.elementName = '';
            ctrl.elementPercentage = 0;
            matchingElements.length = 0;
            focus('elementName');
        }
    }

    function showRemaining() {
        if (!ctrl.composition.value.length) {
            return;
        }
        var total = 0;
        for (var i = 1; i < ctrl.composition.value.length; i++) {
            total += +ctrl.composition.value[i].value;
        }
        ctrl.composition.value[0].value = 100.0 - total;
        return ctrl.composition.value[0].value;
    }

    function getElementColor(e) {
        if (e.chosen) {
            return 'element-chosen';
        }

        if (_.findIndex(matchingElements, function(item) {return item === e.e;}) !== -1) {
            return 'element-match';
        }
        return e.color;
    }

    function lookForMatches() {
        if (ctrl.elementName === '') {
            matchingElements.length = 0;
        } else {
            matchingElements = allElements
                .filter(function(e) { return e.e.toUpperCase().startsWith(ctrl.elementName.toUpperCase());})
                .map(function(e) { return e.e;})
        }
    }
}
