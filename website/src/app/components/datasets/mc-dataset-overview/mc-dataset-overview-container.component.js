class MCDatasetOverviewContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, publicDatasetsAPI, User) {
        this.publicDatasetsAPI = publicDatasetsAPI;
        this.$stateParams = $stateParams;
        this.User = User;
        this.datasetId = this.$stateParams.dataset_id;
        this.userId = this.User.u();
    }

    $onInit() {
        let userId = '';
        if (this.User.isAuthenticated) {
            userId = this.userId;
        }
        this.publicDatasetsAPI.datasetWasViewed(userId, this.datasetId).then((dataset) => {
            dataset = this.setUsefulMarkerValues(dataset);
            this.dataset = dataset;
        });
    }

    setUsefulMarkerValues(dataset) {
        dataset.markedAsUseful = false;
        dataset.othersMarkedAsUsefulCount = 0;
        let interestedUsers = dataset.stats.interested_users;
        let otherInterestedUsers = [];
        for (let i = 0; i < interestedUsers.length; i++) {
            if (interestedUsers[i].email === this.userId) {
                dataset.markedAsUseful = true;
            } else {
                otherInterestedUsers.push(interestedUsers[i]);
                dataset.othersMarkedAsUsefulCount += 1;
            }
        }
        dataset.otherInterestedUsers = otherInterestedUsers;
        return dataset;
    }

    onToggleUseful() {
        let markedAsUseful = !this.dataset.markedAsUseful;
        this.publicDatasetsAPI.updateUseful(this.userId, this.dataset.id, markedAsUseful)
            .then((dataset) => {
                    let updated_dataset = this.setUsefulMarkerValues(dataset);
                    this.dataset = updated_dataset;
                }
            );
    }

    onDownloadRequest() {
        this.dataset.stats.download_count += 1;
    }

    onAddToCommentCount(){
        this.dataset.stats.download_count += 1;
    }

    onDeleteFromCommentCount(){
        this.dataset.stats.download_count += -1;
    }

}

angular.module('materialscommons').component('mcDatasetOverviewContainer', {
    template: `
        <mc-dataset-overview 
            layout="column" flex
            ng-if="$ctrl.dataset"
            dataset="$ctrl.dataset"
            on-toggle-useful="$ctrl.onToggleUseful()"
            on-download-request="$ctrl.onDownloadRequest()"
            on-add-to-comment-count="$ctrl.onAddToCommentCount()"
            on-delete-from-comment-count="$crtl.onDeleteFromCommentCount()"
            >
        </mc-dataset-overview>
    `,
    controller: MCDatasetOverviewContainerComponentController,
});
