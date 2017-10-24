class MCDataHomeComponentController {
    /*@ngInject*/
    constructor(mcbus, $state) {
        this.mcbus = mcbus;
        this.$state = $state;
        this.query = '';
        this.calling = false;
    }

    search() {
        this.mcbus.send('MCDATA$SEARCH', this.query);
    }

    selected(chip) {
        // Work around: this.calling is a workaround because md-on-select keeps calling this method while this.$state.go
        // is transitioning, this results in the route never completing and multiple calls are made to the backend.
        //
        // To work around this we set the this.calling flag and if it is set to true then just return. This, apparently,
        // gives enough time to complete the state transition.
        //
        if (this.calling) {
            return;
        }
        this.calling = true;
        this.$state.go('data.tag', {tag: chip});
    }
}

angular.module('materialscommons').component('mcDataHome', {
    templateUrl: 'app/data/components/home/mc-data-home.html',
    controller: MCDataHomeComponentController,
    bindings: {
        tags: '<'
    }
});
