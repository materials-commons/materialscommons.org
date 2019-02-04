class TemplateUnitsService {
    /*@ngInject*/
    constructor($mdDialog, $q) {
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.unitTypes = [];
        this._loadUnitTypes();
    }

    _loadUnitTypes() {
        this.unitTypes.push(unit('Temperature', 'f', 'c'));
        this.unitTypes.push(unit('Strain', 'percentage', 'mm/mm'));
        this.unitTypes.push(unit('Energy', 'pJ', 'nJ'));
        this.unitTypes.push(unit('Frequency', 'kHz'));
        this.unitTypes.push(unit('Pressure', 'atm', 'Pa', 'torr'));
        this.unitTypes.push(unit('Angle', 'degrees', 'rad'));
        this.unitTypes.push(unit('Memory', 'b', 'kb', 'mb', 'gb'));
        this.unitTypes.push(unit('Time', 'h', 'm', 's'));
        this.unitTypes.push(unit('Voltage', 'kV', 'V'));
        this.unitTypes.push(unit('Current', 'A', 'mA', 'nA'));
        this.unitTypes.push(unit('Distance', 'm', 'c', 'mm', 'nm'));
        this.unitTypes.push(unit('Composition', 'at%', 'wt%', 'atoms'));
        this.unitTypes.push(unit('Load', 'ibf', 'N'));
        this.unitTypes.push(unit('Cooling Rate', 'C/s', 'K/s'));
        this.unitTypes.push(unit('Speed', 'mm/min'));
        this.unitTypes.push(unit('Custom'));
    }

    getUnitTypes() {
        return this.$q.when(this.unitTypes);
    }

    _getUnitTypes() {
        return this.unitTypes;
    }

    findUnitType(name, unitTypes) {
        let u = _.find(unitTypes, 'name', name);
        return u ? u.units : [];
    }

    showChoices() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/unit-choices-dialog.html',
            controller: ShowUnitChoicesDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            multiple: true,
            clickOutsideToClose: true,
            locals: {
                unitTypes: this.unitTypes
            }
        });
    }
}

function unit(name, ...units) {
    return {
        name: name,
        units: units,
        expanded: false
    };
}

class ShowUnitChoicesDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done(unitType) {
        this.$mdDialog.hide(unitType);
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').service('templateUnits', TemplateUnitsService);
