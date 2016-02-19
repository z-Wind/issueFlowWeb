function flowChart(selector, width, height, cr) {
    this.width = typeof width !== 'undefined' ? width : 960;
    this.height = typeof height !== 'undefined' ? height : 500;
    this.cr = typeof cr !== 'undefined' ? cr : 30;

    var nodes = [],
        links = [];

    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .charge(-1000)
        .linkDistance(this.cr * 3)
        .size([this.width, this.height]);
    force.on("tick", tick);

    var min_zoom = 0.1;
    var max_zoom = 7;
    var zoomListener = d3.behavior.zoom()
        .scaleExtent([min_zoom, max_zoom])
        .on('zoom', zoom);

    var g_dragListener = force.drag()
        .on("dragstart", g_dragstart);

    var svg = d3.select(selector).append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .style('cursor', 'move')
        .style('border', '#50506f 5px solid')
        .call(zoomListener).on("dblclick.zoom", null);

    var container = svg.append("g");

    container.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height);


    function tick() {
        var link = container.selectAll(".link");
        var gnode = container.selectAll('g.gnode');
        var node = gnode.selectAll('.node');
        var label = gnode.selectAll('text');

        gnode.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        link.attr("x1", function(d) {
                return d.source.x;
            })
            .attr("y1", function(d) {
                return d.source.y;
            })
            .attr("x2", function(d) {
                return d.target.x;
            })
            .attr("y2", function(d) {
                return d.target.y;
            });

        gnode.attr("cx", function(d) {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            });

        /*
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        label.attr("x", function(d) { return d.x; })
              .attr("y", function(d) { return d.y; });*/
    }

    function g_click(d) {
        if (d3.event.altKey) {
            d3.select(this).selectAll('circle').classed("fixed", d.fixed = !d.fixed);
        }
    }

    function g_dragstart(d) {
        d3.event.sourceEvent.stopPropagation();
        container.selectAll('.gnode').selectAll('.node').classed("focus", false);
        d3.select(this).selectAll('.node').classed("focus", true);
    }

    function g_mouseover(d) {
        container.selectAll('.gnode').style("opacity", 1).selectAll('.node').classed("highlight", true);
        container.selectAll('.link').style("opacity", 1).classed("highlight", true);

        var nodelinked = new Set();
        container.selectAll('.link')
            .filter(function(o) {
                var checked = true;
                if (o.source.id === d.id || o.target.id === d.id) {
                    nodelinked.add(o.source.id);
                    nodelinked.add(o.target.id);
                    checked = false;
                }
                return checked;
            })
            .style("opacity", 0.2)
            .classed("highlight", false);

        container.selectAll('.gnode')
            .filter(function(o) {
                return !nodelinked.has(o.id);
            })
            .style("opacity", 0.2)
            .selectAll('.node')
            .classed("highlight", false);
        nodelinked.clear();
    }

    function g_mouseout(d) {
        container.selectAll('.gnode').style("opacity", 1).selectAll('.node').classed("highlight", false);
        container.selectAll('.link').style("opacity", 1).classed("highlight", false);
    }

    function zoom() {
        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    this.drawGraph = function(dataset) {
        this.additems(dataset);
    };

    this.additems = function(dataset) {
        var i, j;

        // check same
        for (i = 0; i < dataset.nodes.length; i++) {
            for (j = 0; j < nodes.length; j++) {
                if (dataset.nodes[i].id === nodes[j].id) {
                    dataset.nodes.splice(i, 1);
                    i--;
                    break;
                }
            }
        }

        for (i = 0; i < dataset.links.length; i++) {
            if (dataset.links[i].source.id === dataset.links[i].target.id) {
                dataset.links.splice(i, 1);
                i--;
                continue;
            }
            for (j = 0; j < links.length; j++) {
                if (dataset.links[i].source.id === links[j].source.id &&
                    dataset.links[i].target.id === links[j].target.id) {
                    dataset.links.splice(i, 1);
                    i--;
                    break;
                }
            }
        }

        // 因為 obj 值一樣，也不代表是同一個物件，所以重新指定
        for (i = 0; i < dataset.links.length; i++) {
            for (j = 0; j < nodes.length; j++) {
                if (dataset.links[i].source.id === nodes[j].id) {
                    dataset.links[i].source = nodes[j];
                }
                if (dataset.links[i].target.id === nodes[j].id) {
                    dataset.links[i].target = nodes[j];
                }
            }
        }

        for (i = 0; i < dataset.nodes.length; i++) {
            nodes.push(dataset.nodes[i]);
        }
        for (i = 0; i < dataset.links.length; i++) {
            links.push(dataset.links[i]);
        }

        linkData = container.selectAll(".link")
            .data(force.links(), function(d) {
                return Math.min(d.source.id, d.target.id) + "-" + Math.max(d.source.id, d.target.id);
            });
        link = linkData.enter().insert("line", ".gnode")
            .attr("class", "link")
            .attr("lid", function(d) {
                return Math.min(d.source.id, d.target.id) + "-" + Math.max(d.source.id, d.target.id);
            });
        linkData.exit().remove();

        gnodeData = container.selectAll('g.gnode')
            .data(force.nodes(), function(d) {
                return d.id;
            });
        gnode = gnodeData.enter().append("g")
            .classed('gnode', true)
            .attr("gid", function(d) {
                return d.id;
            })
            .attr("title", function(d) {
                return d.ph;
            })
            .attr("alt", function(d) {
                return d.ph;
            })
            .call(g_dragListener)
            .on("click", g_click)
            .on("mouseover", g_mouseover)
            .on("mouseout", g_mouseout);
        gnodeData.exit().remove();

        var node = gnode.append("circle")
                        .attr("class", "node")
                        .attr("r", this.cr);

        var min_n = 8;
        var max_n = 20;
        var showPixel = 11;
        var label = gnode.append("text")
                        .text(function(d) {
                            return d.ph.slice(0, max_n);
                        })
                        .attr({
                            'text-anchor': 'middle', //文字置中
                            'class': 'text',
                        })
                        .attr('font-size', function(d) {
                            if (d.ph.length < min_n)
                            {
                                return showPixel + 'px';
                            } else if (d.ph.length < max_n) {
                                return showPixel * min_n / d.ph.length  + 'px';
                            } else {
                                return showPixel * min_n /max_n  + 'px';
                            }
                        });

        var title = gnode.append('title')
                        .text(function(d) {
                            return d.ph;
                        });
        force.start();
    };

    this.clear = function()
    {
        nodes.splice(0,nodes.length);
        links.splice(0,links.length);
        this.additems({"nodes": [], "links": []});
    };
}
