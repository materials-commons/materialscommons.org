angular.module("Provenance", [])
//    .factory('provInfo', function(){
//        var info = [];
//        return {
//            get_process_details: function (value, process){
//                var all_process = process;
//                info = process[value];
//                console.dir(info);
//
//            } ,
//            get_info: function(){
//                console.log('here is info' + info);
//                return info;
//            }
//
//        }
//
//    })
    .directive("prov", function ($compile) {

        return {
            restrict: "EA",
            replace: true,
            scope: {
                processList: "=processList",
                getProcessDetails: '&callbackFn'
            },

            link: function (scope, element) {
                var paper = Raphael(element[0], 1000, 200), connections = [], shapes = [], texts = [], x = 20, y = 20, width = 80, height = 40, radius = 5, i = 0;

                for (i; i < scope.processList.length; i++) {
                    shapes[i] = paper.rect(x, y, width, height, radius);
                    texts[i] = paper.text(x + 50, y + 20, scope.processList[i].name + ' - ' + i);
                    shapes[i].attr({fill: 'yellow', stroke: '#000080', "stroke-width": 2, cursor: "move", id: i});
                    texts[i].attr({fill: '#0000A0', stroke: "none", "font-size": 12, "font-weight": "bold", cursor: "move"});
                    texts[i].data("i", i)
                        .click(function () {
                            scope.getProcessDetails({arg1: this.data("i")});

                        });


                    var c = ["M", x + width, height, "L", x + 180, height].join(",");

                    if (i == 4) {
                    } else {
                        connections.push(paper.path(c))
                        x = x + 180;
                        y = y + 0;
                    }
                }
                $compile(element.contents())(scope);
            }

        }

    });











