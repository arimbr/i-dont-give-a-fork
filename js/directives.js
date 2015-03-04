/**
*  Directives
*
* Extend HTML code
*/
(function(){
    angular.module('forksDirectives', [])

        .directive('lineGraph', ['$window',function(){
            // Runs during compile
            return {
                restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
                //templateUrl: '../partials/linegraph.html',
                link: function(scope, elem, attrs, controller) {
                    // scope has access to the ForkController scope
                    // console.log(scope.forks);

                    

                    scope.render = function(data) {
                        dates = [];
                        data.forEach(function(fork) {
                            dates.push(fork.created_at);
                        });
                        if (dates.length > 0) {
                            console.log(dates);

                            var format = d3.time.format("%Y-%m-%dT%H:%M:%SZ");
                            //alert(format.parse(dates[0]));
                            //alert(angular.elem($window)[0].innerWidth);
                            var maxDate = format.parse(dates[0]);
                            var minDate = format.parse(dates[dates.length - 1]);

                            var lastFork = scope.forksCount - (scope.currentPage - 1) * scope.perPage;
                            var firstFork = Math.max(lastFork - scope.perPage + 1, 1);  // In case there are less forks than perPage, minimun is 1
                            // BUG: what if dates are equal, only one fork????
                            //alert(minDate + " " + maxDate);
                            d3.select(".chart").remove();  // Clean before drawing

                            var h = 400;
                            var pad = 50;

                            var svg = d3.select(elem[0])
                                        .append('svg')
                                        .attr('class', 'chart')
                                        .style('width', '100%')
                                        .style('height', h);

                            var lineFunction = d3.svg.line()
                                                    .x(function(d, i) { return xScale(format.parse(d)); })
                                                    .y(function(d, i) { console.log(i); return yScale(firstFork + i); })
                                                    .interpolate("step-after");

                            var xScale = d3.time.scale()
                                            .domain([minDate, maxDate])
                                            .range([pad, parseInt(svg.style("width"), 10) - pad]);

                            var yScale = d3.scale.linear()
                                            .domain([lastFork, firstFork])
                                            .range([pad, h - pad]);

                            var xAxis = d3.svg.axis()
                                            .scale(xScale)
                                            .orient("bottom")
                                            .tickFormat(d3.time.format('%b %-d'))
                                            .tickPadding(10);

                            var yAxis = d3.svg.axis()
                                            .scale(yScale)
                                            .orient("left");
                            
                            svg.append("g")
                                .attr("class", "axis")
                                .attr("transform", "translate(0," + (h - pad) + ")")
                                .call(xAxis)
                                .selectAll("text")
                                .attr("y", 9)
                                .attr("x", 9)
                                .attr("dy", ".35em")
                                .attr("transform", "rotate(45)")
                                .style("text-anchor", "start");

                            svg.append("g")
                                .attr("class", "axis")
                                .attr("transform", "translate(" + pad + ", 0)")
                                .call(yAxis);

                            // Draw the line
                            svg.append("path")
                                .attr("d", lineFunction(dates.reverse()))
                                .attr("stroke", "blue")
                                .attr("stroke-width", 2)
                                .attr("fill", "none");
                        }
                        
                    }

                    // Watch for changes in forks in the ForksController
                    scope.$watch('forks', function(newVal, oldVal) {
                        console.log("Forks have been updated");
                        // console.log(newVal[0].created_at);
                        // From here we will render the graph
                        scope.render(newVal);
                    });

                    // Watch for window resize event
                    scope.$watch(function() {
                        return angular.element(window)[0].innerWidth;
                    }, function() {
                        scope.render(scope.forks);
                    });

                    window.onresize = function() {
                        scope.$apply();
                    };
                }
            };
        }]);
})();