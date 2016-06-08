class CurrentNode {
    constructor() {
        this.currentNode = null;
        this.onChangeFN = null;
    }

    setOnChange(fn) {
        this.onChangeFN = fn;
    }

    get() {
        return this.currentNode;
    }

    set(node) {
        this.currentNode = node;
        if (this.onChangeFN) {
            this.onChangeFN();
        }
    }
}

angular.module('materialscommons').service('currentNode', CurrentNode);
