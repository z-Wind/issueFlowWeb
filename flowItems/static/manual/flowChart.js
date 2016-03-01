function flowChart(selector, width, height, cr) {
    this.width = typeof width !== 'undefined' ? width : 960;
    this.height = typeof height !== 'undefined' ? height : 500;
    this.cr = typeof cr !== 'undefined' ? cr : 30;

    var nodes = [],
        links = [];

    //var color = function(n){ return colores_google(n); };//d3.scale.category20();
    var color = d3.scale.category10();

    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .charge(-500)
        .linkDistance(this.cr * 7/2)
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

    // build the arrow.
    container.append("svg:defs").selectAll("marker")
        .data(["arrow"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -3 10 10")
        .attr("refX", 5)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M 0,-3 L 10,0 L0,3 Z");

    // for force 定時更新
    function tick() {
        var link = container.selectAll(".link");
        var gnode = container.selectAll('g.gnode');
        var node = gnode.selectAll('.node');
        var label = gnode.selectAll('text');

        gnode.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        link.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy),
                drx = dr/2.8,// for chrome no double arrow
                dry = dr/2.8;
            return "M" +
                d.source.x + "," +
                d.source.y + " " +
                "A " +
                drx + ", "+ dry + ", 0, 0, 1, " +
                (d.target.x+d.source.x)/2 + "," +
                (d.target.y+d.source.y)/2 +
                "A " +
                drx + ", "+ dry + ", 0, 0, 0, " +
                d.target.x + "," + d.target.y;
                /*"L" +
                (d.target.x+d.source.x)/2 + "," +
                (d.target.y+d.source.y)/2 +
                "L " +
                d.target.x + "," +
                d.target.y;*/
        });
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
        // 防止 右鍵
        if (d3.event.sourceEvent.which === 1) {
            // 防止 zoom 的拖曳
            d3.event.sourceEvent.stopPropagation();

            var now_r = d3.select(this).selectAll('.node').classed("focus", true).attr('r');
            if (now_r == tcr) {
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
                    .attr('r', tcr * 1.5);
            }
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
        if (alpha !== 0) {
            force.start();
        }
    }

    // for zoom
    var tcr = this.cr;
    var pre_scale;
    function zoom() {
        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

        if(pre_scale !== d3.event.scale)
        {
            pre_scale = d3.event.scale;
            container.selectAll("g.gnode > text > tspan:first-of-type")
                .text(function(d) {
                    var min_n = 4 * 2;
                    return cutString(this, d.body.name, min_n * zoomListener.scale(), tcr * 2 + 15);
                });
            container.selectAll("g.gnode > text > tspan:last-of-type")
                .text(function(d) {
                    var min_n = 4 * 2;
                    return cutString(this, d.describe, min_n * zoomListener.scale(), tcr * 2 + 15);
                });
        }
    }

    // 只顯示特定數目以下的文字
    function cutString(textObj, str, min_n, tl) {
        min_n = Math.round(min_n);
        //textObj = textObj.parentNode;
        var strS = str.replace(/ /g, 'S');
        var strC = encodeURIComponent(strS).replace(/%[A-F\d]{2}%[A-F\d]{2}%[A-F\d]{2}/g, '^$');
        var strF = strC.replace(/%[A-F\d]{2}/g, 'Z');

        if (strF.length > min_n) {
            // chrome tspan doesn't inherit the text
            d3.select(textObj).attr('textLength', tl);
            d3.select(textObj).attr('lengthAdjust', "spacingAndGlyphs");
            // Firefox doesn't let you use textLength on <tspan> elements
            d3.select(textObj.parentNode).attr('textLength', tl);
            d3.select(textObj.parentNode).attr('lengthAdjust', "spacingAndGlyphs");

            var uCount = (strF.slice(0, min_n).match(/\^\$/g) || []).length;

            if (strF[min_n] === '$' && strF[min_n - 1] === '^')
                return str.slice(0, Math.max(1, min_n - 1 - uCount)) + "...";
            else {
                return str.slice(0, Math.max(1, min_n - uCount)) + "...";
            }
        }
        // 合適的值，以免變大後，字超過圓圈
        else if (strF.length > 8) {
            // chrome tspan doesn't inherit the text
            d3.select(textObj).attr('textLength', tl);
            d3.select(textObj).attr('lengthAdjust', "spacingAndGlyphs");
            // Firefox doesn't let you use textLength on <tspan> elements
            d3.select(textObj.parentNode).attr('textLength', tl);
            d3.select(textObj.parentNode).attr('lengthAdjust', "spacingAndGlyphs");
        } else {
            // chrome ignore lengthAdjust for error
            d3.select(textObj).attr('textLength', null);
            //d3.select(textObj).attr('lengthAdjust', null);
            // Firefox doesn't let you use textLength on <tspan> elements
            d3.select(textObj.parentNode).attr('textLength', null);
            //d3.select(textObj.parentNode).attr('lengthAdjust', null);
        }
        return str;
    }

    // 畫圖
    this.drawGraph = function(datasets) {
        force.stop();
        for (var key in datasets) {
            switch (datasets[key].action) {
                case 'get':
                case 'insert':
                    this.addItem(datasets[key]);
                    break;
                case 'modify':
                    this.modifyItem(datasets[key]);
                    break;
                case 'delete':
                    this.delItem(datasets[key]);
            }
        }
        this.updateLayout();
        force.start();
        container.selectAll('g.gnode').selectAll('.node')
            .classed("hasChild", function(d) {
                return (d.related_n - d.weight) > 0;
            });
    };

    this.validateData = function(dataset) {
        var i, j, k;

        switch (dataset.action) {
            case 'get':
            case 'insert':
                // check same and update
                for (i = 0; i < nodes.length; i++) {
                    for (j = 0; j < dataset.nodes.length; j++) {
                        if (nodes[i].id === dataset.nodes[j].id) {
                            dataset.nodes.splice(j, 1);
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
                        //防止雙向
                        else if (dataset.links[i].source.id === links[j].target.id &&
                            dataset.links[i].target.id === links[j].source.id) {
                            dataset.links.splice(i, 1);
                            i--;
                            break;
                        }
                    }
                }
                break;
            case 'modify':
                break;
            case 'delete':
                break;
        }

        if (dataset.links.length === 0 && dataset.nodes.length === 0) {
            return false;
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

        return true;
    };

    // 加入節點
    this.addItem = function(dataset) {
        var i, j, k;
        var tcr = this.cr;

        if (this.validateData(dataset)) {
            // add items
            for (i = 0; i < dataset.nodes.length; i++) {
                nodes.push(dataset.nodes[i]);
            }
            for (i = 0; i < dataset.links.length; i++) {
                links.push(dataset.links[i]);
            }
        }
    };

    // 修正節點
    this.modifyItem = function(dataset) {
        var i;
        if (this.validateData(dataset)) {
            for (i = 0; i < nodes.length; i++) {
                if (nodes[i].id === dataset.nodes[0].id) {
                    for (var key in dataset.nodes[0]) {
                        nodes[i][key] = dataset.nodes[0][key];
                    }
                    break;
                }
            }

            var gnode = container.select("g.gnode[gid='" + dataset.nodes[0].id + "']")
                .attr("gid", function(d) {
                    return d.id;
                })
                .attr("gbid", function(d) {
                    return d.body.id;
                });
            var text = gnode.select("text");
            text.selectAll("tspan:first-of-type")
                .text(function(d) {
                    var min_n = 4 * 2;
                    return cutString(this, d.body.name, min_n, tcr * 2 + 15);
                });
            text.selectAll("tspan:last-of-type")
                .text(function(d) {
                    var min_n = 4 * 2;
                    return cutString(this, d.describe, min_n, tcr * 2 + 15);
                });

            gnode.selectAll('title')
                .text(function(d) {
                    return d.body.name + "\n" + d.describe;
                });

            gnode.selectAll('circle')
                .style('fill', function(d) {
                    return color(d.body.id);
                });
        }
    };

    // 刪除節點
    this.delItem = function(dataset) {
        var i, j;
        if (this.validateData(dataset)) {
            for (i = 0; i < nodes.length; i++) {
                if (nodes[i].id === dataset.nodes[0].id) {
                    nodes.splice(i, 1);
                    break;
                }
            }
            for (i = 0; i < links.length; i++) {
                if (dataset.nodes[0].id === links[i].source.id ||
                    dataset.nodes[0].id === links[i].target.id) {
                    links.splice(i, 1);
                    i--;
                }
            }

            // 更新 related_n
            for (i = 0; i < nodes.length; i++) {
                for (j = 1; j < dataset.nodes.length; j++) {
                    if (nodes[i].id === dataset.nodes[j].id) {
                        for (var key in dataset.nodes[j]) {
                            nodes[i][key] = dataset.nodes[j][key];
                        }
                        break;
                    }
                }
            }
        }
    };

    // 清除全部
    this.clear = function() {
        nodes.splice(0, nodes.length);
        links.splice(0, links.length);

        // 需清掉，以免影響 weight
        container.selectAll(".link")
            .data(force.links(), function(d) {
                //return Math.min(d.source.id, d.target.id) + "-" + Math.max(d.source.id, d.target.id);
                return d.target.id + "-" + d.source.id;
            }).exit().remove();

        container.selectAll('g.gnode')
            .data(force.nodes(), function(d) {
                return d.id;
            }).exit().remove();
    };

    // 更新 layout
    this.updateLayout = function() {
        var linkData = container.selectAll(".link")
            .data(force.links(), function(d) {
                //return Math.min(d.source.id, d.target.id) + "-" + Math.max(d.source.id, d.target.id);
                return d.target.id + "-" + d.source.id;
            });

        // add the links and the arrows
        var link = linkData.enter().insert("svg:path", ".gnode")
                .attr("class", "link")
                .attr("marker-mid", "url(#arrow)")
                .attr("lid", function(d) {
                    //return Math.min(d.source.id, d.target.id) + "-" + Math.max(d.source.id, d.target.id);
                    return d.target.id + "-" + d.source.id;
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
            .style('fill', function(d) {
                return color(d.body.id);
            });

        var label = gnode.append("text");

        //body
        label.append("tspan")
            .attr("x", 0)
            .attr("y", -tcr / 4)
            .text(function(d) {
                var min_n = 4 * 2;
                return cutString(this, d.body.name, min_n, tcr * 2 + 15);
            })
            .attr({
                'text-anchor': 'middle', //文字置中
                'class': 'text',
            });

        //describe
        label.append("tspan")
            .attr("x", 0)
            .attr("y", -tcr / 4)
            .attr("dy", "1em")
            .text(function(d) {
                var min_n = 4 * 2;
                return cutString(this, d.describe, min_n, tcr * 2 + 15);
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
}
