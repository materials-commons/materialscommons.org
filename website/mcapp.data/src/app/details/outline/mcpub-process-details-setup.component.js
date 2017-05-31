export class MCPubProcessDetailsSetupComponentController {
    /*@ngInject*/
    constructor($filter) {
        this.$filter = $filter;
        this.processSetupWithValues = [];
        this.processHasSetupValues = false;
    }

    $onInit() {
        for (let i = 0; i < this.processSetup.length; i++) {
            this.processSetupWithValues.push(this.processSetup.slice(i)[0]);
            let properties = this.processSetupWithValues[i].properties;
            this.processSetupWithValues[i].properties = this.$filter('filter')(properties, this.removeEmpty());
        }

        for (let i = 0; i < this.processSetupWithValues.length; i++) {
            if (this.processSetupWithValues[i].properties.length) {
                this.processHasSetupValues = true;
                break;
            }
        }
    }

    removeEmpty() {
        return function (prop) {
            return prop.value !== '';
        }
    }
}
