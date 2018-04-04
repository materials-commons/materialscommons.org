class MCProjectDatasetsViewContainerComponentController {
    /*@ngInject*/
    constructor($state) {
        this.$state = $state;

        this.state = {
            datasets: []
        };

        this.state.datasets = [
            {
                name: 'DS1',
                owner: 'John Allison',
                experiments: ['E1', 'Stress testing of dilution factors'],
                samples_count: 5,
                files_count: 100,
                published: false
            },
            {
                name: 'DS2',
                owner: 'John Allison',
                experiments: ['long name 1', 'experiment test 2'],
                samples_count: 20,
                files_count: 1001,
                published: true
            },
            {
                name: 'DS3',
                owner: 'Brian Puchala',
                experiments: ['computational and DFT processes combined with casm', 'Hardness testing with Professor Allison'],
                samples_count: 15,
                files_count: 657,
                published: false
            },
            {
                name: 'DS4',
                owner: 'Tracy Berman',
                experiments: ['LIFT Anodized metals', 'My Postdoc research'],
                samples_count: 50,
                files_count: 150,
                published: true
            },
        ];
    }

    handleNewDataset(dataset) {
        this.state.datasets = this.state.datasets.concat([dataset]);
        this.$state.go('project.datasets.dataset');
    }
}

angular.module('materialscommons').component('mcProjectDatasetsViewContainer', {
    template: `
        <mc-project-datasets-view datasets="$ctrl.state.datasets" on-new-dataset="$ctrl.handleNewDataset(dataset)">
        </mc-project-datasets-view>`,
    controller: MCProjectDatasetsViewContainerComponentController
});