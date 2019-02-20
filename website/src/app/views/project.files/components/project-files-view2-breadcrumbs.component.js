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

            // Handle case where path is not populated, otherwise we get an error
            if (!path) {
                return;
            }

            this.createPathNameEntries(path);
        }
    }

    // createPathNameEntries will popup this.state.paths as follows:
    //
    // Split path on '/' so that we can construct a list of
    // names and their part of the path. This partial path allows
    // us to say where the user wants to go.
    // For example:
    //  Given a path /a/b/c
    //  Then this.state.paths will contain 3 entries that look as follows:
    //    [0] = {name: 'a', path: 'a'}
    //    [1] = {name: 'b', path: 'a/b'}
    //    [2] = {name: 'c', path: 'a/b/c}
    //
    // Now in the template we can set up a click handler so that when
    // a user clicks on 'b' portion, we know the path is 'a/b'. This will
    // be passed to handleChangeDir() method.
    createPathNameEntries(path) {
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
            this.state.paths.push(o);
        }
    }

    handleChangeDir(entry) {
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