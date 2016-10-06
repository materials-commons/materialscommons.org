angular.module('materialscommons').component('mcSamplesTable', {
    template: `
    <md-table-container>
        <table md-table>
            <thead md-head>
            <tr md-row>
                <th md-column>Sample</th>
                <th md-column>Description</th>
                <th md-column>Composition</th>
                <th md-column>Modified</th>
                <th md-column>Last Transformation</th>
                <th md-column># Files</th>
                <th md-column># Processes</th>
            </tr>
            </thead>
            <tbody md-body>
            <tr md-row class="md-row-hover pointer" ng-repeat="sample in $ctrl.samples">
                <td md-cell>
                    <a class="md-primary" ng-click="$ctrl.showSample({sample: sample})">{{sample.name}}</a>
                </td>
                <td md-cell style="width: 20%">
                    {{sample.description}}
                </td>
                <td md-cell>
                    Unknown
                </td>
                <td md-cell>
                    {{sample.mtime | toDate}}
                </td>
                <td md-cell>
                </td>
                <td md-cell>
                    <a ng-click="$ctrl.showFiles({files: sample.files})">
                        {{sample.files.length}}
                    </a>
                </td>
                <td md-cell>
                    <a ng-click="$ctrl.showProcesses({processes: sample.processes})" class="md-primary">
                        {{sample.processes.length}}
                    </a>
                </td>
            </tr>
            </tbody>
        </table>
    </md-table-container>
    `,
    bindings: {
        showSample: '&',
        showProcesses: '&',
        showFiles: '&',
        samples: '<',
        projectId: '<'
    }
});