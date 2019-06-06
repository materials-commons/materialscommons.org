class FileSelectionService {
    /*@ngInject*/
    constructor() {
        this.state = {
            selection: {
                include_files: {},
                exclude_files: {},
                include_dirs: {},
                exclude_dirs: {},
            }
        };
    }

    // loadSelection takes the selection object and loads it into a series of maps
    // for efficient look up.
    loadSelection(selection) {
        this.state.selection = {
            include_files: {},
            exclude_files: {},
            include_dirs: {},
            exclude_dirs: {},
        };
        for (let file of selection.include_files) {
            this.state.selection.include_files[file] = true;
        }

        for (let file of selection.exclude_files) {
            this.state.selection.exclude_files[file] = true;
        }

        for (let dir of selection.include_dirs) {
            this.state.selection.include_dirs[dir] = true;
        }

        for (let dir of selection.exclude_dirs) {
            this.state.selection.exclude_dirs[dir] = true;
        }
    }

    // toSelection will take the current selection maps and turn it back into a
    // selection object.
    toSelection() {
        let selection = {
            include_files: [],
            exclude_files: [],
            include_dirs: [],
            exclude_dirs: [],
        };

        _.forIn(this.state.selection.include_files, (value, key) => selection.include_files.push(key));
        _.forIn(this.state.selection.exclude_files, (value, key) => selection.exclude_files.push(key));
        _.forIn(this.state.selection.include_dirs, (value, key) => selection.include_dirs.push(key));
        _.forIn(this.state.selection.exclude_dirs, (value, key) => selection.exclude_dirs.push(key));

        return selection;
    }

    includeFile(filePath) {
        this.state.selection.include_files[filePath] = true;
        if ((filePath in this.state.selection.exclude_files)) {
            delete this.state.selection.exclude_files[filePath];
        }
    }

    excludeFile(filePath) {
        this.state.selection.exclude_files[filePath] = true;
        if ((filePath in this.state.selection.include_files)) {
            delete this.state.selection.include_files[filePath];
        }
    }

    includeDir(dirPath) {
        this.state.selection.include_dirs[dirPath] = true;
        if ((dirPath in this.state.selection.exclude_dirs)) {
            delete this.state.selection.exclude_dirs[dirPath];
        }
    }

    excludeDir(dirPath) {
        this.state.selection.exclude_dirs[dirPath] = true;
        if ((dirPath in this.state.selection.include_dirs)) {
            delete this.state.selection.include_dirs[dirPath];
        }
    }

    removeDir(dirPath) {
        if ((dirPath in this.state.selection.include_dirs)) {
            delete this.state.selection.include_dirs[dirPath];
        }

        if ((dirPath in this.state.selection.exclude_dirs)) {
            delete this.state.selection.exclude_dirs[dirPath];
        }
    }

    // isIncludedDir checks if the directory is in the include or exclude directories lists. If its
    // not then it returns parent.selected as that will denote the child state.
    isIncludedDir(dirPath, parent) {
        if ((dirPath in this.state.selection.include_dirs)) {
            return true;
        } else if ((dirPath in this.state.selection.exclude_dirs)) {
            return false;
        }

        return parent.selected;
    }

    // isIncludedFile checks if the file is in the include or exclude lists. If not then
    // it checks whether the directory the file is has been selected.
    isIncludedFile(filePath, dir) {
        if ((filePath in this.state.selection.include_files)) {
            return true;
        } else if ((filePath in this.state.selection.exclude_files)) {
            return false;
        } else {
            return dir.selected;
        }
    }
}

angular.module('materialscommons').service('fileSelection', FileSelectionService);