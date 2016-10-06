export class releaseService {
    /*@ngInject*/
    constructor(Restangular, userService, pubAPI) {
        this.releases = [];
        this.Restangular = Restangular;
        this.userService = userService;
        this.pubAPI = pubAPI;
        this.user = userService.u();
    }

    getAll() {
        return this.pubAPI('datasets').getList().then(function(releases) {
            return releases.plain();
        });
    }

    getAllCount() {
        return this.pubAPI('datasets').one('count').get().then(function(releases) {
            return releases
        });
    }

    getRecent() {
        return this.pubAPI('datasets').one('recent').getList().then(function(datasets) {
            for (let ds of datasets) {
                ds.birthtime = new Date(ds.birthtime);
            }
            return datasets.plain();
        });
    }

    topViews() {
        return this.pubAPI('datasets').one('views').getList().then(function(releases) {
            return releases.plain();
        });
    }

    getByID(id) {
        if (this.user) {
            return this.pubAPI('datasets', id).get().then(function(dataset) {
                return dataset.plain();
            });
        } else {
            return this.pubAPI('datasets', id).get().then(function(dataset) {
                return dataset.plain();
            });
        }
    }
}
