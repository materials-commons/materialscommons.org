class ProjectShortcutsService {
    constructor() {
        this._defaultShortcuts = ['Literature', 'Presentations', 'Project Documents'];
    }

    defaultShortcutPaths(projectName) {
        return this._defaultShortcuts.map(shortcut => `${projectName}/${shortcut}`);
    }
}

angular.module('materialscommons').service('projectShortcuts', ProjectShortcutsService);
