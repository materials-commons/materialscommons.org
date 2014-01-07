

function FrontPageController($scope, $location) {
    $scope.messages = [];
    $scope.sent = 0;
    $scope.search_key = function () {
        $location.path("/searchindex/search_key/" + $scope.keyword);
    }
}

function HomeController($scope, mcapi) {
    mcapi('/news')
        .success(function (data) {
            $scope.news = data;
        }).jsonp();
}

function ExploreController($scope) {
    $scope.pageDescription = "Explore";
}

function AboutController($scope) {
    $scope.pageDescription = "About";


}

function ContactController($scope) {
    $scope.pageDescription = "Contact";

}

function HelpController($scope) {
    $scope.pageDescription = "Help";


}


function EventController($scope, alertService) {
    $scope.message = '';
    $scope.$on('handleBroadcast', function () {
        $scope.message = {"type": "info",
            "content": alertService.message};
    });

}

function ProvenanceController($scope) {
    $scope.process = [
        {
            name: 'TEM',
            owner: 'Allison',
            inputs: ['TEM-excel-analysis', 'TEM conditions.txt'],
            outputs: ['image-display.jpg', 'TEM-analysis.xls', 'TEM.jpg']
        },
        {
            name: 'pr22',
            owner: 'Emanuelle',
            inputs: ['TEM-analysis.xls', 'a.txt'],
            outputs: ['pr22-excel-analysis', 'a.txt', 'pr22.jpg']
        },
        {
            name: 'SEM',
            owner: 'Emanuelle',
            inputs: ['SEM-excel-analysis', 'a.txt', 'pr22.jpg'],
            outputs: ['TEM-excel-analysis', 'a.txt', 'TEM.jpg', 'file1.txt']
        },
        {
            name: 'P4',
            owner: 'Allison',
            inputs: ['file1.txt', 'file2.txt', 'file4.txt'],
            outputs: ['TEM-excel-analysis', 'a.txt', 'TEM.jpg']
        },
        {
            name: 'P5',
            owner: 'Emanuelle',
            inputs: ['p5-excel-analysis', 'a.txt', 'p5.jpg'],
            outputs: ['TEM-excel-analysis', 'a.txt', 'TEM.jpg']
        }
    ];
    $scope.get_process_details = function (index) {
        $scope.$apply(function () {
            $scope.details = $scope.process[index];

        })
    }

    redraw();
    function redraw() {
        console.log('yes')
        var width = 600;
        var height = 400;

        $scope.g = new Graph();

        /* add a simple node */
        $scope.g.addNode("strawberry");
        $scope.g.addNode("cherry");

        /* add a node with a customized label */
        $scope.g.addNode("1", { label : "Tomato" });


        /* add a node with a customized shape
         (the Raphael graph drawing implementation can draw this shape, please
         consult the RaphaelJS reference for details http://raphaeljs.com/) */
        $scope.render = function(r, n) {
            $scope.label = r.text(0, 30, n.label).attr({opacity:0});
            //the Raphael set is obligatory, containing all you want to display
            $scope.set = r.set().push(
                    r.rect(-30, -13, 62, 86)
                        .attr({"fill": "#fa8",
                            "stroke-width": 2
                            , r : 9 }))
                .push($scope.label);
            // make the label show only on hover
            $scope.set.hover(
                function mouseIn() {
                    $scope.label.animate({opacity:1,"fill-opacity":1}, 500);
                },
                function mouseOut() {
                    $scope.label.animate({opacity:0},300);
                }
            );

            tooltip = r.set()
                .push(
                    r.rect(0, 0, 90, 30).attr({"fill": "#fec", "stroke-width": 1, r : 9 })
                ).push(
                    r.text(25, 15, "overlay").attr({"fill": "#000000"})
                );
            for(i in $scope.set.items) {
                $scope.set.items[i].tooltip(tooltip);
            };
            //            set.tooltip(r.set().push(r.rect(0, 0, 30, 30).attr({"fill": "#fec", "stroke-width": 1, r : "9px"})).hide());
            return $scope.set;
        };

        $scope.g.addNode("id35", {
            label : "meat\nand\ngreed",
            /* filling the shape with a color makes it easier to be dragged */
            /* arguments: r = Raphael object, n : node object */
            //render : render
        });
        //    g.addNode("Wheat", {
        /* filling the shape with a color makes it easier to be dragged */
        /* arguments: r = Raphael object, n : node object */
        //        shapes : [ {
        //                type: "rect",
        //                x: 10,
        //                y: 10,
        //                width: 25,
        //                height: 25,
        //                stroke: "#f00"
        //            }, {
        //                type: "text",
        //                x: 30,
        //                y: 40,
        //                text: "Dump"
        //            }],
        //        overlay : "<b>Hello <a href=\"http://wikipedia.org/\">World!</a></b>"
        //    });

        $scope.st = { directed: true, label : "Label",
            "label-style" : {
                "font-size": 20
            }
        };
        $scope.g.addEdge("kiwi", "penguin", $scope.st);

        /* connect nodes with edges */
        $scope.g.addEdge("strawberry", "cherry", {directed: true});
        $scope.g.addEdge("cherry", "apple");
        $scope.g.addEdge("cherry", "apple")
        $scope.g.addEdge("1", "id35");
        $scope.g.addEdge("penguin", "id35");
        $scope.g.addEdge("penguin", "apple");
        $scope.g.addEdge("kiwi", "id35");

        /* a directed connection, using an arrow */
        $scope.g.addEdge("1", "cherry", { directed : true } );

        /* customize the colors of that edge */
        $scope.g.addEdge("id35", "apple", { stroke : "#bfa" , fill : "#56f", label : "Meat-to-Apple" });

        /* add an unknown node implicitly by adding an edge */
        $scope.g.addEdge("strawberry", "apple");

        //g.removeNode("1");

        /* layout the graph using the Spring layout implementation */
        $scope.layouter = new Graph.Layout.Spring($scope.g);

        /* draw the graph using the RaphaelJS draw implementation */
        $scope.renderer = new Graph.Renderer.Raphael('canvas', $scope.g, width, height);

            $scope.layouter.layout();
            $scope.renderer.draw();
        $scope.hide = function(id) {
            $scope.g.nodes[id].hide();
        };
        $scope.show = function(id) {
            $scope.g.nodes[id].show();
        };
        //    console.log(g.nodes["kiwi"]);


    }





    };





