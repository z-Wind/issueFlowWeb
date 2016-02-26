function flowChart(selector, width, height, cr) {
    this.width = typeof width !== 'undefined' ? width : 960;
    this.height = typeof height !== 'undefined' ? height : 500;
    this.cr = typeof cr !== 'undefined' ? cr : 30;

    var nodes = [],
        links = [];

    var color = d3.scale.category10();

    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .charge(-500)
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
        .style('background-color', '#000')
        .call(zoomListener).on("dblclick.zoom", null);

    var container = svg.append("g");

    container.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height);

    // for force 定時更新
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
        /*
        gnode.attr("cx", function(d) {
                return d.x;
            })
            .attr("cy", function(d) {
                return d.y;
            });*/
    }

    // click gnode
    function g_click(d) {
        if (d3.event.altKey) {
            var dcircleSel = d3.select(this).selectAll('circle');
            dcircleSel.classed("loaded", false);
            dcircleSel.classed("fixed", !dcircleSel.classed("fixed"));
            var a = dcircleSel.classed("fixed");
            d.fixed = dcircleSel.classed("fixed");
        }
    }

    // drag gnode
    function g_dragstart(d) {
        // 防止 zoom 的拖曳
        d3.event.sourceEvent.stopPropagation();

        var now_r = d3.select(this).selectAll('.node').classed("focus", true).attr('r');
        if(now_r == tcr)
        {
            container.selectAll('.gnode > .node')
                        .classed("focus", false)
                        .transition()
                        .duration(200)
                        .ease('linear')
                        .attr('r', tcr);
            d3.select(this).selectAll('.node')
                           .classed("focus", true)
                           .transition()
                           .duration(200)
                           .ease('linear')
                           .attr('r', tcr*1.5);
       }
    }

    // mouse over gnode
    var alpha;
    function g_mouseover(d) {
        alpha = force.alpha();
        force.stop();
        container.selectAll('.gnode').style("opacity", 1).selectAll('.node').classed("highlight", true);
        container.selectAll('.link').style("opacity", 1).classed("highlight", true);

        var nodelinked = new Set();
        nodelinked.add(d.id);
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
            .style("opacity", 0.1)
            .classed("highlight", false);

        container.selectAll('.gnode')
            .filter(function(o) {
                return !nodelinked.has(o.id);
            })
            .style("opacity", 0.1)
            .selectAll('.node')
            .classed("highlight", false);
        nodelinked.clear();

    }

    // mouse out gnode
    function g_mouseout(d) {
        container.selectAll('.gnode').style("opacity", 1).selectAll('.node').classed("highlight", false);
        container.selectAll('.link').style("opacity", 1).classed("highlight", false);
        if(alpha !== 0)
        {
            force.start();
        }
    }

    // for zoom
    var tcr = this.cr;
    function zoom() {
        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

        container.selectAll("g.gnode > text > tspan")
            .text(function(d){
                var min_n = 4*2;
                return cutString(this, d, min_n*zoomListener.scale(), tcr*2+15);
            });
    }

    // 只顯示特定數目以下的文字
    function cutString(textObj, str, min_n, tl)
    {
        min_n = Math.round(min_n);
        textObj = textObj.parentNode;
        var strS = str.replace(/ /g, 'S');
        var strC = encodeURIComponent(strS).replace(/%[A-F\d]{2}%[A-F\d]{2}%[A-F\d]{2}/g, '^$');
        var strF = strC.replace(/%[A-F\d]{2}/g, 'Z');

        if(strF.length > min_n)
        {
            d3.select(textObj).attr('textLength', tl);
            d3.select(textObj).attr('lengthAdjust', "spacingAndGlyphs");

            var uCount = (strF.slice(0, min_n).match(/\^\$/g) || []).length;

            if(strF[min_n] === '$' && strF[min_n-1] === '^')
                return str.slice(0, Math.max(1, min_n-1-uCount)) + "...";
            else {
                return str.slice(0, Math.max(1, min_n-uCount)) + "...";
            }
        }
        // 合適的值，以免變大後，字超過圓圈
        else if (strF.length >= 8){
            d3.select(textObj).attr('textLength', tl);
            d3.select(textObj).attr('lengthAdjust', "spacingAndGlyphs");
        }
        else {
            d3.select(textObj).attr('textLength', null);
            d3.select(textObj).attr('lengthAdjust', null);
        }
        return str;
    }

    // 畫圖
    this.drawGraph = function(datasets) {
        force.stop();
        for (var key in datasets) {
            this.additem(datasets[key]);
        }
        force.start();
        container.selectAll('g.gnode').selectAll('.node')
            .classed("hasChild", function(d) {
                return (d.related_n - d.weight) > 0;
            });
    };

    // 加入節點
    this.additem = function(dataset) {
        var i, j, k;
        var tcr = this.cr;
        var update = false;

        // check same and update
        for (i = 0; i < nodes.length; i++) {
            for (j = 0; j < dataset.nodes.length; j++) {
                if (nodes[i].id === dataset.nodes[j].id) {
                    for (k in dataset.nodes[j])
                    {
                        if(nodes[i][k] !== dataset.nodes[j][k])
                        {
                            nodes[i][k] = dataset.nodes[j][k];
                            update = true;
                        }
                    }
                    dataset.nodes.splice(j, 1);
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

        // update text
        if(update)
        {

             container.selectAll("g.gnode > text")
                 .selectAll("tspan")
                 .data(function(d){ return [d.body.name, d.describe];})
                 .text(function(d){
                     var min_n = 4*2;
                     return cutString(this, d, min_n, tcr*2+15);
                 });

             container.selectAll('g.gnode > title')
                      .text(function(d) {
                          return d.body.name + "\n" + d.describe;
                      });

             container.selectAll('g.gnode > circle')
                  .style('fill', function(d){ return color(d.body.id);});

             container.selectAll("g")
                      .attr("gid", function(d) {
                          return d.id;
                      })
                      .attr("gbid", function(d) {
                          return d.body.id;
                      });
        }

        if (dataset.links.length === 0 && dataset.nodes.length === 0) {
            return;
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

        var linkData = container.selectAll(".link")
            .data(force.links(), function(d) {
                return Math.min(d.source.id, d.target.id) + "-" + Math.max(d.source.id, d.target.id);
            });
        var link = linkData.enter().insert("line", ".gnode")
            .attr("class", "link")
            .attr("lid", function(d) {
                return Math.min(d.source.id, d.target.id) + "-" + Math.max(d.source.id, d.target.id);
            });
        linkData.exit().remove();

        var gnodeData = container.selectAll('g.gnode')
            .data(force.nodes(), function(d) {
                return d.id;
            });
        var gnode = gnodeData.enter().append("g")
            .classed('gnode', true)
            .attr("gid", function(d) {
                return d.id;
            })
            .attr("gbid", function(d) {
                return d.body.id;
            })
            .call(g_dragListener)
            .on("click", g_click)
            .on("mouseover", g_mouseover)
            .on("mouseout", g_mouseout);
        gnodeData.exit().remove();

        var node = gnode.append("circle")
            .attr("r", this.cr)
            .classed("node", true)
            .style('fill', function(d){ return color(d.body.id);});

        var label = gnode.append("text")
            .selectAll("tspan")
            .data(function(d){ return [d.body.name, d.describe];})
            .enter()
            .append("tspan")
            .attr("x", 0)
            .attr("y", -tcr/4)
            .attr("dy", function(d, i){ return i + "em";})
            .text(function(d){
                var min_n = 4*2;
                return cutString(this,  d, min_n, tcr*2+15);
            })
            .attr({
                'text-anchor': 'middle', //文字置中
                'class': 'text',
            });


        var title = gnode.append('title')
            .text(function(d) {
                return d.body.name + "\n" + d.describe;
            });
    };

    this.clear = function() {
        nodes.splice(0, nodes.length);
        links.splice(0, links.length);

        // 需清掉，以免影響 weight
        container.selectAll(".link")
            .data(force.links(), function(d) {
                return Math.min(d.source.id, d.target.id) + "-" + Math.max(d.source.id, d.target.id);
            }).exit().remove();

        container.selectAll('g.gnode')
            .data(force.nodes(), function(d) {
                return d.id;
            }).exit().remove();
    };

    this.fixeditems = function(dataset) {
    };
}
