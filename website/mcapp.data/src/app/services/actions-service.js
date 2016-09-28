export class actionsService {
    /*@ngInject*/
    constructor(Restangular, toastr, userService, pubAPI) {
        this.Restangular = Restangular;
        this.userService = userService;
        this.toastr = toastr;
        this.pubAPI = pubAPI;
    }

    appreciate(dataset_id, user_id) {
        return this.pubAPI('appreciate').customPOST({
            user_id: user_id,
            dataset_id: dataset_id
        });
    }

    removeAppreciation(dataset_id, user_id) {
        return this.pubAPI('appreciate').one('remove')
            .customPUT({user_id: user_id, dataset_id: dataset_id});
    }

    viewDataset(dataset_id, user_id) {
        return this.pubAPI('views').customPOST({user_id: user_id, dataset_id: dataset_id});
    }

    getAllActions(dataset_id) {
        return this.pubAPI('actions').customGET(dataset_id).then(function(result) {
            return result.plain();
        });
    }

    addComment(msg, dataset_id, user_id) {
        return this.pubAPI('comments').customPOST({
            message: msg,
            user_id: user_id,
            dataset_id: dataset_id
        }).then((result)=> {
            this.toastr.success("Your comment has been registered");
        });
    }

    addTag(dataset_id, user_id, tag) {
        return this.pubAPI('tags').customPOST({
            user_id: user_id,
            dataset_id: dataset_id,
            tag: tag
        }).then(
            result => result,
            (error) => {
                this.toastr.warning("Duplicate request");
            });
    }

    removeTag(dataset_id, user_id, tag) {
        return this.pubAPI('tags').customPUT({
            dataset_id: dataset_id,
            user_id: user_id,
            tag: tag
        }).then(result => result);
    }


    getAllTags() {
        return this.pubAPI('tags').getList().then(function(tags) {
            return tags.plain();
        });
    }

    getTagsByCount() {
        return this.pubAPI('tags').one('bycount').getList().then(function(tags) {
            return tags.plain();
        });
    }

    getAllTagsCount() {
        return this.pubAPI('tags').one('count').get().then(function(tags) {
            return tags;
        });
    }


    getProcessTypes() {
        return this.pubAPI('processes').one('types').getList().then(function(process_types) {
            return process_types.plain();
        });
    }

    getSamples() {
        return this.pubAPI('samples').getList().then(function(samples) {
            return samples.plain();
        });
    }

    getDatasetsByTag(tag) {
        return this.pubAPI('tags', tag).one('datasets').getList().then(function(tags) {
            let res = tags.plain();
            return res;
        });
    }

    getAllAuthors() {
        return this.pubAPI('authors').one('datasets').getList().then(function(authors) {
            return authors.plain();
        });
    }

    getAllAuthorsCount() {
        return this.pubAPI('authors').one('count').get().then(function(authors) {
            return authors;
        });
    }
}
