angular.module('materialscommons').factory('projectTreeModel', projectTreeModelService);

function projectTreeModelService(mcprojstore) {
    'ngInject';

    return {
        findNodeByID: function(root, id) {
            return root.first({strategy: 'pre'}, (node) => node.model.id === id);
        },

        root: function() {
            const files = mcprojstore.currentProject.files[0],
                treeModel = new TreeModel();
            return treeModel.parse(files);
        }
    }
}