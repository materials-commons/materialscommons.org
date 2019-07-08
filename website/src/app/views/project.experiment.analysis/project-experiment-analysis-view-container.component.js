class MCProjectExperimentAnalysisViewContainerComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, $stateParams, mcChartService) {
        this.experimentsAPI = experimentsAPI;
        this.$stateParams = $stateParams;
        this.mcChartService = mcChartService;
        this.state = {
            line: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                series: ['Series A', 'Series B'],
                data: [
                    [65, 59, 80, 81, 56, 55, 40],
                    [28, 48, 40, 19, 86, 27, 90]
                ],
                datasetOverride: [{yAxisID: 'y-axis-1'}, {yAxisID: 'y-axis-2'}],
                options: {
                    scales: {
                        yAxes: [
                            {
                                id: 'y-axis-1',
                                type: 'linear',
                                display: true,
                                position: 'left'
                            },
                            {
                                id: 'y-axis-2',
                                type: 'linear',
                                display: true,
                                position: 'right'
                            }
                        ]
                    }
                },
            },
            scatter: {
                labels: ['Scatter Dataset'],
                data: [
                    {
                        x: 7,
                        y: 4
                    },
                    {
                        x: 8,
                        y: 3
                    },
                    {
                        x: 10,
                        y: 5
                    },
                    {
                        x: 6,
                        y: 5
                    },
                    {
                        x: 8,
                        y: 2
                    }
                ],
                options: {
                    scales: {
                        xAxes: [{
                            type: 'linear',
                            position: 'bottom'
                        }]
                    }
                }
            },
            bar: {
                labels: ['2006', '2007', '2008', '2009', '2010', '2011', '2012'],
                series: ['Series A', 'Series B'],

                data: [
                    [65, 59, 80, 81, 56, 55, 40],
                    [28, 48, 40, 19, 86, 27, 90]
                ],
            },
            charts: ['bar', 'line', 'scatter'],
            selectedChart: '',
            selectedAttributes: [],
            selectedSamples: [],
            samples: [],
            attributes: [],
        };
    }

    $onInit() {
        this.experimentsAPI.getSamplesWithAttributesForExperiment(this.$stateParams.experiment_id, this.$stateParams.project_id).then(
            (samples) => {
                this.state.samples = samples;
                // By default all samples are selected
                this.state.selectedSamples = angular.copy(samples);

                // Build a unique list of known attributes
                let attributes = {};
                samples.forEach(s => {
                    s.attributes.forEach(attr => {
                        attributes[attr.attribute] = true;
                    });
                });
                this.state.attributes = _.keys(attributes).map(a => ({name: a}));
            }
        );
    }

    selectSamples() {
        this.mcChartService.selectSamples(this.state.samples).then(
            selectedSamples => {
                this.state.selectedSamples = selectedSamples;
                console.log('this.state.selectedSamples =', this.state.selectedSamples);
            }
        );
    }

    selectAttributes() {
        this.mcChartService.selectAttributes(this.state.attributes, this.state.selectedChart).then(
            selectedAttributes => {
                this.state.selectedAttributes = selectedAttributes;
                console.log('this.state.selectedAttributes', this.state.selectedAttributes);
            }
        );
    }

    chartSelected() {
        console.log('chart type =', this.state.selectedChart);
        switch (this.state.selectedChart) {
            case 'line':
                this.createLineChart();
                break;
            case 'bar':
                this.createBarChart();
                break;
            case 'scatter':
                this.createScatterPlot();
                break;
        }
    }

    createScatterPlot() {
        console.log('createScatterPlot');
    }

    createLineChart() {
        console.log('createLineChart');
    }

    createBarChart() {
        console.log('createBarChart');
    }

    onClick(points, evt) {
        console.log(points, evt);
    }
}

angular.module('materialscommons').component('mcProjectExperimentAnalysisViewContainer', {
    controller: MCProjectExperimentAnalysisViewContainerComponentController,
    template: require('./project-experiment-analysis-view-container.html')
});