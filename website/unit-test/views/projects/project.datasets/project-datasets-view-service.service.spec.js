describe('project-datasets-view-service:createDatasetDialogState', function () {
    let createDatasetDialogState;

    beforeEach(module('materialscommons'));
    beforeEach(inject(function (_createDatasetDialogState_) {
        createDatasetDialogState = _createDatasetDialogState_;
    }));

    describe("computeExperimentsForSamples", () => {
        it('should exist', () => expect(createDatasetDialogState).toBeDefined());
        it('should add 1 experiment to sample', () => {
            let project = {
                experiments: {
                    "abc": {
                        id: "abc",
                        name: "name_abc",
                        samples: {
                            "s1": {
                                id: "s1"
                            }
                        }
                    }
                }
            };

            let samples = [
                {
                    id: "s1"
                }
            ];

            createDatasetDialogState.computeExperimentsForSamples(project, samples);
            expect(samples.length).toEqual(1);
            expect(samples[0].experimentNames).toBeDefined();
            expect(samples[0].experimentNames).toEqual("name_abc")
            expect(samples[0].experiments.length).toEqual(1);
        });

        it('should handle no samples in project', () => {
            let project = {
                experiments: {
                    "abc": {
                        id: "abc",
                        name: "name_abc",
                        samples: {},
                    }
                }
            };

            let samples = [];
            createDatasetDialogState.computeExperimentsForSamples(project, samples);
            expect(samples.length).toEqual(0);
        });
    });

    describe('determineSelectedSamplesForExperiments', () => {
        it("should return no selected samples when experiments is empty", () => {
            let selected = createDatasetDialogState.determineSelectedSamplesForExperiments([]);
            expect(_.values(selected).length).toEqual(0);
        });

        it("should return 1 selected sample", () => {
            let experiments = [{
                selected: true,
                samples: {
                    "s1": {id: "id_s1"},
                }
            }];

            let selected = createDatasetDialogState.determineSelectedSamplesForExperiments(experiments);
            expect(_.size(selected)).toEqual(1);
        });
    });
});