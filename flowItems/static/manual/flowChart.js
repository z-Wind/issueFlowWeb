function flowChart(selector, width, height, cr)
{
    this.width = typeof width !== 'undefined' ? width : 960;
    this.height = typeof height !== 'undefined' ? height : 500;
    this.cr = typeof cr !== 'undefined' ? cr : 40;

    var nodes = [],
        links = [];

    var force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .charge(-400)
        .linkDistance(this.cr*3)
        .size([this.width, this.height]);
        force.on("tick", tick);

    var svg = d3.select(selector).append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    var drag = force.drag()
        .on("dragstart", dragstart);


    function tick() {
        var link = svg.selectAll(".link");
        var gnode = svg.selectAll('g.gnode');
        var node = gnode.selectAll('.node');
        var label = gnode.selectAll('text');

        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        label.attr("x", function(d) { return d.x; })
              .attr("y", function(d) { return d.y; });
    }

    function click(d, event) {
        if (d3.event.altKey) {
            d3.select(this).selectAll('circle').classed("fixed", d.fixed = false);
        }
    }

    function dragstart(d) {
      d3.select(this).selectAll('circle').classed("fixed", d.fixed = true);
    }

    this.drawGraph = function(dataset) {
        this.additems(dataset);
    };

    this.additems = function(dataset) {

        var i,j;

        // check same
        for (i=0; i<dataset.nodes.length; i++) {
            for (j=0; j<nodes.length; j++) {
                if(dataset.nodes[i].id === nodes[j].id )
                {
                    dataset.nodes.splice(i, 1);
                    i--;
                    break;
                }
            }
        }

        for (i=0; i<dataset.links.length; i++) {
            for (j=0; j<links.length; j++)
            {
                if(dataset.links[i].source.id === links[j].source.id &&
                   dataset.links[i].target.id === links[j].target.id )
                {
                    dataset.links.splice(i, 1);
                    i--;
                    break;
                }
            }
        }

        // 因為 obj 值一樣，也不代表是同一個物件，所以重新指定
        for (i=0; i<dataset.links.length; i++) {
            for (j=0; j<nodes.length; j++)
            {
                if(dataset.links[i].source.id === nodes[j].id )
                {
                    dataset.links[i].source = nodes[j];
                }
                if(dataset.links[i].target.id === nodes[j].id )
                {
                    dataset.links[i].target = nodes[j];
                }
            }
        }

        for (i=0; i<dataset.nodes.length; i++) {
            nodes.push(dataset.nodes[i]);
        }
        for (i=0; i<dataset.links.length; i++) {
            links.push(dataset.links[i]);
        }

        link = svg.selectAll(".link")
                    .data(force.links(), function(d) {
                        return Math.min(d.source.id, d.target.id) + "-" + Math.max(d.source.id, d.target.id);
                    })
                    .enter().insert("line", ".gnode")
                    .attr("class", "link");
        //link.exit().remove();

        gnode = svg.selectAll('g.gnode')
                    .data(force.nodes(), function(d) { return d.id;})
                    .enter().append("g")
                    .classed('gnode', true)
                    .attr("gid", function(d) { return d.id;})
                    .on("click", click)
                    .call(drag);
        //gnode.exit().remove();

        var node = gnode.append("circle")
                    .attr("class", "node")
                    .attr("r", this.cr);


        var label = gnode.append("text")
                        .text(function(d) { return d.ph; })
                        .attr({
                            'text-anchor': 'middle', //文字置中
                            'font-size': '14px', //字小一點比較秀氣
                            'cursor': 'move'
                        });

        force.start();
    };
}
