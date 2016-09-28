class NavbarOnChangeService {
    constructor() {
        this.onChangeFN = null;
    }

    setOnChange(fn) {
        this.onChangeFN = fn;
    }

    fireChange() {
        if (this.onChangeFN) {
            this.onChangeFN();
        }
    }
}

angular.module('materialscommons').service('navbarOnChange', NavbarOnChangeService);
