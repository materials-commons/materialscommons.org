class MCDatasetOverviewComponentController {
    /*@ngInject*/
    constructor(User, $mdDialog, publicDatasetsAPI) {
        this.showFiles = User.isAuthenticated();
        this.$mdDialog = $mdDialog;
        this.showProcessesWorkflow = false;
        this.publicDatasetsAPI = publicDatasetsAPI;
    }

    onFavoriteAction(dataset){
        console.log("Clicked on select as favorite.", dataset.title);
        this.showFavoriteDialog().then((val) => {
            let text = val.text;
            this.createNewFavorite(text);
        });
    }

    createNewFavorite(text) {
        console.log("Created favorate annotation for dataset: ", this.dataset.title);
        console.log("With optional annotation: ", text);
    }

    showFavoriteDialog() {
        return this.$mdDialog.show({
            templateUrl: 'app/components/datasets/mc-dataset-overview/dialog-select-favorite.html',
            controller: AddFavoriteDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                text: '',
                dataset: this.dataset
            }
        })
    }

}

angular.module('materialscommons').component('mcDatasetOverview', {
    templateUrl: 'app/components/datasets/mc-dataset-overview/mc-dataset-overview.html',
    controller: MCDatasetOverviewComponentController,
    bindings: {
        dataset: '<'
    }
});


class AddFavoriteDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.hide({text: this.text});
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}


