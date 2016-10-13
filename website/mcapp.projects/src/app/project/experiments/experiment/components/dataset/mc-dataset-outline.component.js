class MCDatasetOutlineComponentController {
    /*@ngInject*/
    constructor(processTree) {
        this.processTree = processTree;
    }

    $onInit() {
        this.buildOutline();
    }

    buildOutline() {
        console.log('this.dataset', this.dataset);
        let t = this.processTree.build(this.dataset.processes);
        console.log('past processTree.build');
        this.root = t.root;
        this.rootNode = t.rootNode;
        console.log('this.root', this.root);
    }
}

class MCDatasetOutlineDirDirectiveController {
    /*@ngInject*/
    constructor() {

    }
}

/*@ngInject*/
function mcDatasetOutlineDirDirective(RecursionHelper) {
    return {
        restrict: 'E',
        scope: {
            process: '=',

            // This needs to be passed in rather than required. It appears that RecursionHelper is
            // preventing the link function from being called.
            mcDatasetOutline: '='
        },
        controller: MCDatasetOutlineDirDirectiveController,
        controllerAs: '$ctrl',
        bindToController: true,
        templateUrl: 'app/project/experiments/experiment/components/dataset/mc-dataset-outline-dir.html',
        compile: function(element) {
            return RecursionHelper.compile(element, function() {});
        }
    }
}

angular.module('materialscommons').directive('mcDatasetOutlineDir', mcDatasetOutlineDirDirective);

angular.module('materialscommons').component('mcDatasetOutline', {
    templateUrl: 'app/project/experiments/experiment/components/dataset/mc-dataset-outline.html',
    controller: MCDatasetOutlineComponentController,
    bindings: {
        dataset: '<'
    }
});
