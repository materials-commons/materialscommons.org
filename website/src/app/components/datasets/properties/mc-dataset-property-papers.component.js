angular.module('materialscommons').component('mcDatasetPropertyPapers', {
    template: `
        <label>Papers</label>
        <ul>
            <li ng-if="paper.title" ng-repeat="paper in $ctrl.dataset.papers">
                <div class="md-subtitle">
                    <b>{{paper.title}}</b>
                    <a ng-if="paper.link" href="{{paper.link}}">
                        <i class="fa fa-fw fa-file-text-o"></i>
                    </a>
                    <span ng-if="paper.doi"><b>DOI:</b> {{paper.doi}}</span>
                </div>
            </li>
        </ul>
    `,
    bindings: {
        dataset: '<'
    }
});