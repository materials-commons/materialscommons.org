class MCDatasetPropertyFilesComponentController {
    /*@ngInject*/
    constructor(User, $window) {
        this.isAuthenticated = User.isAuthenticated();
        this.apikey = User.apikey();
        this.$window = $window;
    }

    isDownloadAvailable() {
        return (this.dataset.zip && this.dataset.zip.size && (this.dataset.zip.size > 0));
    }

    urlForDownload() {
        const datasetId = this.dataset.id;
        const baseURL = `${this.$window.location.protocol}//${this.$window.location.hostname}:${this.$window.location.port}/api`;
        return `${baseURL}/pub/datasets/download/${datasetId}?apikey=${this.apikey}`;
    }

    filenameForDownload() {
        return (this.dataset.zip && this.dataset.zip.filename) ? (this.dataset.zip.filename) : "FullDataset.zip";
    }

    onDownload() {
        this.onDownloadRequest();
    }

}

angular.module('materialscommons').component('mcDatasetPropertyFiles', {
    template: `
        <label ng-if="$ctrl.isAuthenticated && $ctrl.dataset.published">Download</label>
        <label ng-if="$ctrl.isAuthenticated && !$ctrl.dataset.published">Files</label>
        <label ng-if="!$ctrl.isAuthenticated">Files</label>
        <span ng-if="!$ctrl.isAuthenticated">{{$ctrl.dataset.files.length}} files (Login and refresh page to see download link)</span>
        <span ng-if="$ctrl.isAuthenticated && !$ctrl.dataset.published">{{$ctrl.dataset.files.length}} files</span>
        <span ng-if="$ctrl.isAuthenticated && $ctrl.dataset.published && !$ctrl.isDownloadAvailable()">
            {{$ctrl.dataset.files.length}} files.
            Download zipfile is still building; check back later.
        </span>
        <span ng-if="$ctrl.isAuthenticated && $ctrl.dataset.published && $ctrl.isDownloadAvailable()">
            <a href="{{$ctrl.urlForDownload()}}" 
                    ng-click="$ctrl.onDownload()"
                    download="{{$ctrl.filenameForDownload()}}">
                <i class="fa fa-fw fa-download"></i>
                Download Dataset - {{$ctrl.dataset.files.length}} files
            </a>
            ({{$ctrl.dataset.zip.size | bytes}})
        </span>
    `,
    controller: MCDatasetPropertyFilesComponentController,
    bindings: {
        dataset: '<',
        onDownloadRequest: '&'
    }
});