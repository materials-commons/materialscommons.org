class MCDSStoreService {
    /*@ngInject*/
    constructor(User) {
        this.User = User;
        this.dsstore = {};
    }

    createDataset(name, samples, experiments) {
        let ds = {
            id: name,
            name: name,
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
        if (_.size(this.dsstore) != 0) {
            return false;
        }

        let demoDatasets = [
            {
                id: 'DS1',
                name: 'DS1',
                owner: 'John Allison',
                experiments: ['E1', 'Stress testing of dilution factors'],
                samples_count: 5,
                files_count: 100,
                published: false
            },
            {
                id: 'DS2',
                name: 'DS2',
                owner: 'John Allison',
                experiments: ['long name 1', 'experiment test 2'],
                samples_count: 20,
                files_count: 1001,
                published: true
            },
            {
                id: 'DS3',
                name: 'DS3',
                owner: 'Brian Puchala',
                experiments: ['computational and DFT processes combined with casm', 'Hardness testing with Professor Allison'],
                samples_count: 15,
                files_count: 657,
                published: false
            },
            {
                id: 'DS4',
                name: 'DS4',
                owner: 'Tracy Berman',
                experiments: ['LIFT Anodized metals', 'My Postdoc research'],
                samples_count: 50,
                files_count: 150,
                published: true
            },
        ];

        demoDatasets.forEach(ds => this.addDataset(ds));

        return true;
    }
}

angular.module('materialscommons').service('mcdsstore', MCDSStoreService);