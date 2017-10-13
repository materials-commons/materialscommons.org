class MCCommentsComponentController {
    constructor(User) {
        this.user = User.u();
        console.log(this.comments)
        if (! this.comments) {
            this.comments = [
                {
                    comment: 'First Comment!',
                    owner: 'tradiasa@umich.edu',
                    owner_details: {
                        fullname: 'Tracy Berman'
                    },
                    birthtime: Date.now(),
                    mtime: Date.now()
                },
                {

                    comment: 'This is a comment',
                    owner: 'gtarcea@umich.edu',
                    owner_details: {
                        fullname: 'Glenn Tarcea'
                    },
                    birthtime: Date.now(),
                    mtime: Date.now()
                },
                {
                    comment: 'It works!',
                    owner: 'bpuchala@umich.edu',
                    owner_details: {
                        fullname: 'Brian Puchala'
                    },
                    birthtime: Date.now(),
                    mtime: Date.now()
                },
                {
                    comment: 'Another comment',
                    owner: 'johnea@umich.edu',
                    owner_details: {
                        fullname: 'John Allison'
                    },
                    birthtime: Date.now(),
                    mtime: Date.now()
                }
            ]
        }

    }
}

angular.module('materialscommons').component('mcComments', {
    templateUrl: 'app/components/comments/mc-comments.html',
    controller: MCCommentsComponentController,
    bindings: {
        comments: '<'
    }
});

// angular.module('materialscommons').directive('mcCommentsButton', mcCommentsButtonDirective);
