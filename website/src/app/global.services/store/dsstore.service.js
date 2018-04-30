class MCDSStoreService {
    /*@ngInject*/
    constructor(User) {
        this.User = User;
        this.dsstore = {};
    }

    createDataset(title, samples, experiments) {
        let ds = {
            id: name,
            title: title,
            samples: samples,
            owner: this.User.attr().fullname,
            samples_count: samples.length,
            experiments: experiments.map(e => e.name),
            files_count: 0,
            published: false,
        };

        return ds;
    }

    addDataset(ds) {
        if (ds.id in this.dsstore) {
            return false;
        }

        this.dsstore[ds.id] = ds;
        return true;
    }

    getDataset(id) {
        if (id in this.dsstore) {
            return this.dsstore[id];
        }

        return null;
    }

    getDatasets() {
        return _.values(this.dsstore);
    }

    deleteDataset(id) {
        if (id in this.dsstore) {
            delete this.dsstore[id];
        }
    }

    loadDemoData() {
        return true;
    }

    reloadDatasets(datasets) {
        this.dsstore = {};
        datasets.forEach(ds => this.addDataset(ds));
    }
}

angular.module('materialscommons').service('mcdsstore', MCDSStoreService);