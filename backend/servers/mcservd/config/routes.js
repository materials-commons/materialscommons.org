exports['default'] = {
    routes: (api) => {
        return {
            get: [
                {path: '/datasets/views/all', action: 'allPublishedDatasets'},
                {path: '/datasets/views/top', action: 'topViewedPublishedDatasets'},
                {path: '/datasets/views/recent', action: 'recentlyPublishedDatasets'},
                {path: '/datasets/:dataset_id', action: 'getPublishedDataset'}
            ]

            /* ---------------------
            routes.js

            For web clients (http and https) you can define an optional RESTful mapping to help route requests to actions.
            If the client doesn't specify and action in a param, and the base route isn't a named action, the action will attempt to be discerned from this routes.js file.

            Learn more here: http://www.actionherojs.com/docs/#routes

            examples:

            get: [
              { path: '/users', action: 'usersList' }, // (GET) /api/users
              { path: '/search/:term/limit/:limit/offset/:offset', action: 'search' }, // (GET) /api/search/car/limit/10/offset/100
            ],

            post: [
              { path: '/login/:userID(^\\d{3}$)', action: 'login' } // (POST) /api/login/123
            ],

            all: [
              { path: '/user/:userID', action: 'user', matchTrailingPathParts: true } // (*) /api/user/123, api/user/123/stuff
            ]

            ---------------------- */

        };
    }
};
