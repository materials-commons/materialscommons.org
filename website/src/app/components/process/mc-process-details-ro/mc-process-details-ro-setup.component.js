class MCProcessDetailsROSetupComponentController {
    /*@ngInject*/
    constructor($filter) {
        this.$filter = $filter;

    }

    $onInit() {
        this.initSetupValues();
    }

    initSetupValues() {
        this.processSetupWithValues = [];
        this.processHasSetupValues = false;
        for (let i = 0; i < this.processSetup.length; i++) {
            this.processSetupWithValues.push(this.processSetup.slice(i)[0]);
            let properties = this.processSetupWithValues[i].properties;
            this.processSetupWithValues[i].properties = this.$filter('filter')(properties, MCProcessDetailsROSetupComponentController.removeEmpty());
        }

        for (let i = 0; i < this.processSetupWithValues.length; i++) {
            if (this.processSetupWithValues[i].properties.length) {
                this.processHasSetupValues = true;
                break;
            }
        }
    }

    $onChanges(changes) {
        if (!changes.processSetup.isFirstChange()) {
            this.processSetup = changes.processSetup.currentValue;
            this.initSetupValues();
        }
    }

    static removeEmpty() {
        return function(prop) {
            return prop.value !== '';
        }
    }
}

angular.module('materialscommons').component('mcProcessDetailsRoSetup', {
    templateUrl: 'app/components/process/mc-process-details-ro/mc-process-details-ro-setup.html',
    controller: MCProcessDetailsROSetupComponentController,
    bindings: {
        processSetup: '<'
    }
});

