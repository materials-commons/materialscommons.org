module.exports = {
    users: [
        {
            id: 'user1',
            apikey: 'user1key',
            admin: false
        },
        {
            id: 'admin',
            apikey: 'adminkey',
            admin: true
        },
        {
            id: 'user2',
            apikey: 'user2key'
        }
    ],

    access: [
        {
            project_id: 'project1',
            project_name: 'project1',
            user_id: 'user1'
        },

        {
            project_id: 'project1',
            project_name: 'project1',
            user_id: 'admin'
        },
        {
            project_id: 'project2',
            project_name: 'project2',
            user_id: 'user2'
        }
    ],

    samples: [
        {
            id: 'sample1',
            name: 'sample1',
            project_id: 'project1'
        },
        {
            id: 'sample2',
            name: 'sample2',
            project_id: 'project2'
        }
    ],

    samples_attribute_set: [
        {
            sample_id: 'sample1',
            attribute_set_id: 'aset_sample_1',
            attributes: [
                {
                    id: 'attr_1',
                    measurements: [
                        {
                            id: 'measure_1',
                            otype: 'number'
                        },
                        {
                            id: 'measure_2',
                            otype: 'number'
                        }
                    ]
                },
                {
                    id: 'attr_2',
                    measurements: [
                        {
                            id: 'measure_1',
                            otype: 'string'
                        }
                    ]
                }
            ]
        },
        {
            sample_id: 'sample2',
            attribute_set_id: 'aset_sample_2',
            attributes: [
                {
                    id: 'attr_1',
                    measurements: [
                        {
                            id: 'measure_1',
                            otype: 'number'
                        },
                        {
                            id: 'measure_2',
                            otype: 'number'
                        }
                    ]
                },
                {
                    id: 'attr_2',
                    measurements: [
                        {
                            id: 'measure_1',
                            otype: 'string'
                        }
                    ]
                }
            ]
        }
    ],

    projects: [
        {
            id: 'project1',
            name: 'project1'
        },
        {
            id: 'project2',
            name: 'project2'
        }
    ]
};
