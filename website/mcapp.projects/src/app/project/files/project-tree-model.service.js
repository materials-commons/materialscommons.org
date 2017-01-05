angular.module('materialscommons').factory('projectTreeModel', projectTreeModelService);

function projectTreeModelService(mcreg) {
    'ngInject';

    return {
        findNodeByID: function(root, id) {
            return root.first({strategy: 'pre'}, (node) => node.model.id === id);
        },

        root: function() {
            const files = mcreg.current$project.files[0],
                treeModel = new TreeModel();
            return treeModel.parse(files);
        }
    }
}