class MCProjectNotesComponentController {
    /*@ngInject*/
    constructor(mcprojstore) {
        this.mcprojstore = mcprojstore;
        this.markdown = `# 1
# 2
# 3
# 4
# 5
# 6
# 7
# 8
# 9
        `;
        this.editMarkdown = false;
        this.noteTitle = 'This is a note title';
    }

    $onInit() {
        this.project = this.mcprojstore.currentProject;

        this.project.todos = [
            {
                title: 'Item 1',
            },
            {
                title: 'Item 2',
            },
            {
                title: 'Item 3'
            }
        ]
    }

    todoClicked(todo) {
        console.log('todo clicked:', todo);
    }
}

angular.module('materialscommons').component('mcProjectNotes', {
    template: require('./mc-project-notes.html'),
    controller: MCProjectNotesComponentController
});