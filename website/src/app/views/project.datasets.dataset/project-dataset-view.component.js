class MCProjectDatasetViewComponentController {
    /*@ngInject*/
    constructor(datasetsAPI, mcshow) {
        this.datasetsAPI = datasetsAPI;
        this.mcshow = mcshow;
        this.state = {
            dataset: null,
            project: null,
            selectedTab: 'details',
        };
    }

    $onChanges(changes) {
        if (changes.dataset) {
            this.state.dataset = angular.copy(changes.dataset.currentValue);
            if (this.state.selectedTab === 'samples') {
                this.samplesSelected();
            } else if (this.state.selectedTab === 'files') {
                this.filesSelected();
            }
        }

        if (changes.project) {
            this.state.project = angular.copy(changes.project.currentValue);
        }
    }

    showJson() {
        this.mcshow.showJson(this.state.dataset);
    }

    handleDeleteFiles(filesToDelete) {
        this.onDeleteFiles({filesToDelete: filesToDelete});
    }

    handleAddFiles(filesToAdd) {
        this.onAddFiles({filesToAdd: filesToAdd});
    }

    handleUpdateDataset(dataset) {
        this.onUpdateDataset({dataset: dataset});
    }

    handlePublishDataset() {
        this.onPublishDataset();
    }

    handleUnpublishDataset() {
        this.onUnpublishDataset();
    }

    handleAddDOI(doiDetails) {
        this.onAddDoi({doiDetails: doiDetails});
    }

    handleAddAuthor(author) {
        this.onAddAuthor({author: author});
    }

    handleAddPaper(paper) {
        this.onAddPaper({paper: paper});
    }

    handleCancel() {
        this.onCancel();
    }

    handleSelectionChanged() {
        this.onSelectionChanged();
    }

    detailsSelected() {
        this.state.selectedTab = 'details';
    }

    samplesSelected() {
        this.state.selectedTab = 'samples';
        if (!this.state.dataset.samplesLoaded) {
            this.onLoadSamples();
        }
    }

    filesSelected() {
        this.state.selectedTab = 'files';
        if (!this.state.dataset.filesLoaded) {
            this.onLoadFiles();
        }
    }
}

angular.module('materialscommons').component('mcProjectDatasetView', {
    template: require('./project-dataset-view.html'),
    controller: MCProjectDatasetViewComponentController,
    bindings: {
        dataset: '<',
        project: '<',
        onDeleteFiles: '&',
        onAddFiles: '&',
        onUpdateDataset: '&',
        onPublishDataset: '&',
        onUnpublishDataset: '&',
        onSelectionChanged: '&',
        onAddAuthor: '&',
        onAddPaper: '&',
        onAddDoi: '&',
        onCancel: '&',
        onLoadSamples: '&',
        onLoadFiles: '&',
    }
});