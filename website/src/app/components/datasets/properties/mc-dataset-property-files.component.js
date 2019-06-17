class MCDatasetPropertyFilesComponentController {
    /*@ngInject*/
    constructor(User, $window) {
        this.isAuthenticated = User.isAuthenticated();
        this.apikey = User.apikey();
        this.$window = $window;
        console.log('this.dataset', this.dataset);
    }

    isDownloadAvailable() {
        return (this.dataset.zip && this.dataset.zip.size && (this.dataset.zip.size > 0));
    }

    urlForDownload() {
        const baseURL = `${this.$window.location.protocol}//${this.$window.location.hostname}:${this.$window.location.port}/api/v3`;
        return `${baseURL}/downloadDatasetZipfile?apikey=${this.apikey}&dataset_id=${this.dataset.id}`;
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
                Download Dataset - {{$ctrl.dataset.file_count}} files
            </a>
            ({{$ctrl.dataset.zip.size | bytes}})
        </span>
        <span class="margin-left-15"><a ng-if="$ctrl.dataset.published_to_globus" href="{{$ctrl.dataset.globus_url}}" target="_blank">Download using globus</a></span>
    `,
    controller: MCDatasetPropertyFilesComponentController,
    bindings: {
        dataset: '<',
        onDownloadRequest: '&'
    }
});