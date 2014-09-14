//Application.Directives.directive('select2OnFocus', [select2OnFocusDirective]);
//
// function select2OnFocusDirective() {
//     return {
//         scope: {
//             select2OnFocus: "&"
//         },
//         link: function(scope, element, attrs) {
//             element.on('select2-focus', function() {
//                 console.log("select2-focus");
//                 scope.select2OnFocus();
//             });
//         }
//     };
// }

// Application.Directives.directive('select2OnBlur', [select2OnBlurDirective]);
// function select2OnBlurDirective() {
//     return {
//         scope: {
//             select2OnBlur: "&"
//         },
//         link: function(scope, element, attrs) {
//             element.on('select2-blur', function() {
//                 console.log("select2-blur");
//                 scope.select2OnBlur();
//             });
//         }
//     };
// }

Application.Directives.directive('myDirective', function() {
    return {
        link: function(scope, element) {
            var select = $('#1234');
            console.log("my-directive");
            select.select2().on('select2-focus', function(evt) {
                console.log("select2-focus");
            });
            select.select2().on('select2-blur', function(evt) {
                console.log("select2-blur");
            });
        }
    };
});

Application.Directives.directive('select2OnEvent', [select2OnEventDirective]);
function select2OnEventDirective() {
    return {
        // scope: {
        //     select2OnEvent: "="
        // },
        link: function(scope, element, attrs) {
            var select = element.find('select2')[0];
            //console.dir(element.select2);
            //console.dir(select);
            // element.select2.on("focus", function() {
            //     console.log("select2-focus");
            // });
            // element.select2.on("blur", function() {
            //     console.log("select2-blur");
            // });
            // for (eventKey in scope.select2OnEvent) {
            //     console.log(eventKey);
            //     if (! _.str.startsWith("select2-")) {
            //         element.on('select2-' + eventKey, function() {
            //             console.log(eventKey);
            //         });
            //     } else {
            //         element.on(eventKey, function() {
            //             console.log(eventKey);
            //         });
            //     }
            // });
        }
    };
}
