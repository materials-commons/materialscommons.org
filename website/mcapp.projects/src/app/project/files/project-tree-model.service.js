angular.module('materialscommons').factory('projectTreeModel', projectTreeModelService);

function projectTreeModelService(mcstate) {
    'ngInject';

    return {
        findNodeByID: function(root, id) {
            return root.first({strategy: 'pre'}, (node) => node.model.id === id);
        },

        root: function() {
            const files = mcstate.get(mcstate.CURRENT$PROJECT).files[0],
                treeModel = new TreeModel();
            return treeModel.parse(files);
        }
    }
}