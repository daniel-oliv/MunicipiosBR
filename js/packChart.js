PackChart = function(_parentElement, _data={}, _title = ""){
    this.parentElement = _parentElement;
    this.data = _data;
    this.title = _title;
    //console.log(_parentElement);
    this.initVis();
};

PackChart.prototype.initVis = function(){
    var vis = this;
    vis.width = $(vis.parentElement).width();
    vis.height = 800;
    console.log(vis.parentElement)
    vis.svg = d3.select(vis.parentElement).append("svg")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.g = vis.svg.append("g")
        .attr("transform", "translate(1,1)"); 

    // Different way for us to get a color scale
    vis.color = d3.scaleSequential(d3.interpolateMagma)
        .domain([-4, 4]);

    // Similar to how d3.treemap looks
    vis.pack = d3.pack()
        .size([vis.width - 2, vis.height - 2])
        .padding(3);

    
    vis.initPizzas();
    //console.log($(vis.parentElement).width());
    vis.update();
}


PackChart.prototype.initPizzas = function()
{
    var vis = this;
    vis.pie = d3.pie()
        .sort(null)
        .value(function(d) { return d; });
}

PackChart.prototype.update = function()
{
    var vis = this;
    vis.valueName = " Nº de municípios";
    vis.valueLegend = " municípios";
    // Adds an x, y, and r value to each node
    vis.root = vis.pack(vis.data);
    //console.log(vis.root);

    // Add a group for all the descendents of the root node
    /// vis.node represents all groups since we call selectAll and enter() method
    vis.node = vis.svg.select("g")
    .selectAll("g")
    .data(vis.root.descendants())
    .enter().append("g")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .attr("class", function(d) { return "node" + (!d.children ? " node--leaf" : d.depth ? "" : " node--root"); })
        .each(function(d) { /*console.log(this);*/d.node = this; })
        .on("mouseover", vis.hovered(true))
        .on("mouseout", vis.hovered(false));
    console.log("svg", vis.svg);
    console.log("node", vis.node);
    // Append a circle to each node.
    vis.node.append("circle")
        .attr("id", function(d) { return "node-" + d.id; })
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return d.data.color ? d.data.color : "none"; });
        // .style("stroke-width", function(d) { return d.data.color ? "1px" : "1px"; })
        // .style("stroke", function(d) { return d.data.color ? d.data.color : "black"; });

    // Add labels for only the leaf nodes
    vis.leaf = vis.node.filter(function(d) { return !d.children; });

    vis.leaf.append("clipPath")
        .attr("id", function(d) { return "clip-" + d.id; })
        .append("use")
            .attr("xlink:href", function(d) { return "#node-" + d.id + ""; });

    vis.leaf.append("text")
        .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
        .selectAll("tspan")
        .data(function(d) { return d.data.sigla; })
        .enter().append("tspan")
            .attr("x", function(d, i, nodes) { return 5 + (i - nodes.length / 2 - 0.5) * 10; })
            .attr("y", 5)
            .text(function(d) { return d; });

    // Simple tooltip
    vis.node.append("title")
        .text(function(d) { return d.data.sigla + "\n" + formatNum(d.value) + vis.valueLegend; });
    
        // vis.Pizzas = [];
    // vis.leaf
    //     .each((d)=>{
    //         //console.log("parent inside here", vis.parentElement)
    //         vis.Pizzas.push(new PizzaChart(vis.parentElement.toString(), d));})
    
}

PackChart.prototype.hovered = function(hover){
    return function(d) {
        hoveredNumMun = d.ancestors();
        lineNumMunChart.update();
        //console.log(hoveredNumMun);
        d3.selectAll(d.ancestors().map(function(d) { return d.node; })).classed("node--hover", hover);
    };
}