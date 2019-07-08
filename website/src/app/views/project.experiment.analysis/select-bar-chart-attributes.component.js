class MCSelectBarChartAttributesComponentController {
    /*@ngInject*/
    constructor() {
        console.log('mcSelecteBarChartAttributes');
        this.state = {
            attributes: [],
        };
    }

    $onChanges(changes) {
        if (changes.attributes) {
            this.state.attributes = angular.copy(changes.attributes.currentValue);
            console.log('this.state.attributes', this.state.attributes);
        }
    }

    handleAttributeSelected(attr) {
        this.onAttributeSelected({attr: attr.name, selected: attr.selected});
    }
}

angular.module('materialscommons').component('mcSelectBarChartAttributes', {
    controller: MCSelectBarChartAttributesComponentController,
    template: require('./select-bar-chart-attributes.html'),
    bindings: {
        attributes: '<',
        onAttributeSelected: '&',
    }
});