(function() {
    angular.module('validation.rule', ['validation'])
        .config(['$validationProvider',
            function($validationProvider) {

                var expression = {
                    required: function(value) {
                        return !!value;
                    },
                    url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
                    email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
                    number: /^$|^[-]?\d+(\.\d+)?$/,
                    float: /[+-]?([0-9]+\.([0-9]+)?|\.[0-9]+)([eE][+-]?[0-9]+)?/,
                    int: /^$|^\d+$/
                };

                var defaultMsg = {
                    required: {
                        error: 'Required!!',
                        success: ''
                    },
                    url: {
                        error: 'This should be Url',
                        success: ''
                    },
                    email: {
                        error: 'This should be Email',
                        success: ''
                    },
                    number: {
                        error: 'This should be Number',
                        success: ''
                    },
                    float: {
                        error: 'This should be floating point number',
                        success: ''
                    },
                    int: {
                        error: 'This should be integer',
                        success: ''
                    }
                };
                $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
            }
        ]);

}).call(this);
