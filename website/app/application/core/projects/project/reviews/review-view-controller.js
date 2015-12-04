(function (module) {
    module.controller('projectViewReview', projectViewReview);
    projectViewReview.$inject = ["project","Review", "User", "mcmodal", "review"];

    function projectViewReview(project, Review, User, mcmodal, review) {

        var ctrl = this;
        ctrl.project = project;
        ctrl.review = review;
        ctrl.user = User.u();
        ctrl.today = new Date();
        ctrl.modal = {title: "", comment: ''};

        ctrl.openReview = openReview;
        ctrl.addComment = addComment;
        ctrl.archiveReview = archiveReview;
        ctrl.openDetails = openDetails;

        function openReview(review) {
            ctrl.review = review;
        }

        function addComment() {
            Review.addComment(ctrl.model, ctrl.review);
            ctrl.model.comment = '';
        }

        function archiveReview() {
            Review.closeReview(ctrl.review.id, ctrl.project);
        }

        function openDetails(params, type) {
            mcmodal.openModal(params, type, ctrl.project);
        }
    }
}(angular.module('materialscommons')));
