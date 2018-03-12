class ProjectShortcutsService {
    constructor() {
        this._defaultShortcuts = ['Literature', 'Presentations', 'Project Documents'];
    }

    defaultShortcutPaths(projectName, dirs) {
        let defaultShortcutsNames = this._defaultShortcuts.map(shortcut => ({path: `${projectName}/${shortcut}`, name: shortcut}));
        let dirsMap = _.indexBy(dirs, 'path');
        return defaultShortcutsNames.map(entry => {
            if (entry.path in dirsMap) {
                return dirsMap[entry.path];
            } else {
                return {
                    path: entry.path,
                    name: entry.name,
                    shortcut: false,
                };
            }
        });
    }

    filterExistingDefaults(dirs) {
        return dirs.filter(d => _.findIndex(this._defaultShortcuts, name => name === d.name) === -1);
    }
}

angular.module('materialscommons').service('projectShortcuts', ProjectShortcutsService);
