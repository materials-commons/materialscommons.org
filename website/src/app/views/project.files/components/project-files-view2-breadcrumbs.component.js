class ProjectFilesView2BreadcrumbsComponentController {
    /*@ngInject*/
    constructor() {
        this.state = {
            paths: [],
        };
    }

    $onChanges(changes) {
        if (changes.path) {
            let path = changes.path.currentValue;
            if (!path) {
                return;
            }
            let paths = path.split('/');
            for (let i = 0; i < paths.length; i++) {
                let o = {
                    name: paths[i],
                };
                let toHere = paths[0];
                for (let j = 1; j <= i; j++) {
                    toHere = toHere + `/${paths[j]}`;
                }
                o.path = toHere;
                console.log(o);
                this.state.paths.push(o);
            }
        }
    }

    handleChangeDir(entry) {
        console.log('breadcrumbs handleChangeDir', entry);
        this.onChangeDir({path: entry.path});
    }
}

angular.module('materialscommons').component('mcProjectFilesView2Breadcrumbs', {
    controller: ProjectFilesView2BreadcrumbsComponentController,
    template: require('./project-files-view2-breadcrumbs.html'),
    bindings: {
        path: '<',
        onChangeDir: '&'
    }
});