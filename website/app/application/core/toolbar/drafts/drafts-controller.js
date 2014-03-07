Application.Controllers.controller('toolbarDrafts',
    ["$scope", "pubsub", "ProvDrafts", "$state",
        function ($scope, pubsub, ProvDrafts, $state) {
            pubsub.waitOn($scope, ProvDrafts.channel, function () {
                $scope.drafts = ProvDrafts.drafts;
            });

            $scope.gotoDraft = function (draft) {
                $state.go('toolbar.projectspage', {id: draft.attributes.project_id, draft_id: draft.id});
            };

            $scope.markForReview = function (draft) {
                $scope.draft = draft;
            };

            $scope.deleteDraft = function (draft) {
                ProvDrafts.deleteRemoteDraft(draft.id);
            };

            $scope.closeReviews = function () {
                $state.go('toolbar.drafts');
            };

            $scope.cloneProvenance = function (draft) {
                var new_draft = {};
                if (draft.clone_number) {
                    new_draft = ProvDrafts.prepareClone(draft, draft.clone_number);
                    console.log(new_draft);
                } else {
                    new_draft = ProvDrafts.prepareClone(draft, '');
                    console.log(new_draft);

                }

            };

            $scope.prepareClone = function (old_df, clone_num) {

                if (old_df.clone_number) {
                    var make_name = '', existing_clone_list = [], split_item = [];
                    $scope.drafts.forEach(function (df) {
                        existing_clone_list.push(df.clone_number);
                    });
                    split_item = old_df.clone_number.split('-');
                    make_name = split_item[0] + (split_item[1] + 1);
                    if (existing_clone_list.indexOf(make_name) === -1) {
                        ProvDrafts.clone_number = make_name;
                        //modify n save draft
                    }
                }
            };

            $scope.init = function () {
                $scope.drafts = ProvDrafts.drafts;

            };
            $scope.init();
        }]);