class MCDatasetOverviewContainerComponentController {
    /*@ngInject*/
    constructor($stateParams,publicDatasetsAPI,User) {
        console.log('MCDatasetOverviewContainerComponentController');
        this.publicDatasetsAPI =  publicDatasetsAPI;
        this.$stateParams = $stateParams;
        this.User = User;
        this.datasetId = this.$stateParams.dataset_id;
        this.userId = this.User.u();
    }

    $onInit() {
        console.log('MCDatasetOverviewContainerComponentController: ', this.userId, this.datasetId);
        let userId = '';
        if (this.User.isAuthenticated) {
            userId = this.userId;
        }
        this.publicDatasetsAPI.datasetWasViewed(userId, this.datasetId).then((dataset) => {
            dataset = this.setUsefulMarkerValues(dataset);
            console.log('after publicDatasetsAPI call: ', dataset);
            this.dataset = dataset;
        });
    }

    setUsefulMarkerValues(dataset) {
        dataset.markedAsUseful = false;
        dataset.othersMarkedAsUsefulCount = 0;
        let interestedUsers = dataset.stats.interested_users;
        for (let i = 0; i < interestedUsers.length; i++) {
            if (interestedUsers[i].user_id === this.userId){
                dataset.markedAsUseful = true;
            } else {
                dataset.othersMarkedAsUsefulCount += 1;
            }
        }
        return dataset;
    }

    onToggleUseful(){
        let markedAsUseful = !this.dataset.markedAsUseful;
        console.log("called onToggleUseful",markedAsUseful);
        this.publicDatasetsAPI.updateUseful(this.userId, this.dataset.id, markedAsUseful)
            .then((dataset) => {
                console.log("onToggleUseful",dataset);
                this.datasetHolder.dataset = setUsefulMarkerValues(dataset);
            }
        );
    }

}

angular.module('materialscommons').component('mcDatasetOverviewContainer', {
    template: `
        <mc-dataset-overview 
            ng-if="$ctrl.dataset"
            dataset="$ctrl.dataset"
            onToggleUseful="$ctrl.onToggleUseful()"
            >
        </mc-dataset-overview>
    `,
    controller: MCDatasetOverviewContainerComponentController,
});
