export class MCPubDatasetFilesListComponentController {
    /*@ngInject*/
    constructor(userService) {
        this.view = "list";
        this.user = userService.u();
    }

    setView(view) {
        this.view = view;
    }

    isActive(what) {
        return this.view === what;
    }
}
