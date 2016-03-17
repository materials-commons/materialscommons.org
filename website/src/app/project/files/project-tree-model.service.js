angular.module('materialscommons').factory('projectTreeModel', projectTreeModelService);

function projectTreeModelService(project) {
    'ngInject';

    return {
        findNodeByID: function(root, id) {
            return root.first({strategy: 'pre'}, (node) => node.model.id === id);
        },

        root: function() {
            var files = project.get().files[0],
                treeModel = new TreeModel();
            return treeModel.parse(files);
        }
    }
}