class MCChartService {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    /*
    return this.$mdDialog.show({
                            templateUrl: 'app/modals/create-new-dataset-dialog.html',
                            controller: CreateNewDatasetDialogController,
                            controllerAs: '$ctrl',
                            bindToController: true,
                            clickOutsideToClose: true,
                            locals: {
                                samples: samples,
                                files: files,
                            }
     */

    selectSamples(samples) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/select-samples-dialog.html',
            controller: MCSelectSamplesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {samples}
        }).then(
            selected => selected
        );
    }

    selectAttributes(attributes, chartType) {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/select-attributes-for-chart-dialog.html',
            controller: MCSelectAttributesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            clickOutsideToClose: true,
            locals: {attributes, chartType}
        }).then(
            selected => selected
        )
    }
}

angular.module('materialscommons').service('mcChartService', MCChartService);

class MCSelectSamplesDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        console.log('samples = ', this.samples);
    }

    done() {
        let selected = this.samples.filter(s => s.selected);
        this.$mdDialog.hide(selected);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class MCSelectAttributesDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
        console.log('this.chartType =', this.chartType);

    }

    handleAttributeSelected(attr, selected) {
        for (let i = 0; i < this.attributes.length; i++) {
            if (this.attributes[i].name === attr) {
                this.attributes[i].selected = selected;
                break;
            }
        }
    }

    done() {
        let selected = this.attributes.filter(a => a.selected);
        this.$mdDialog.hide(selected);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}