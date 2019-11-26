PackChart = function(_parentElement, _data={}, _title = ""){
    this.parentElement = _parentElement;
    this.data = _data;
    this.title = _title;
    //console.log(_parentElement);
    this.initVis();
};

PackChart.prototype.initVis = function(){
    var vis = this;
    vis.width = $(vis.parentElement).width() - 100;
    vis.height = 800;
    //console.log(vis.parentElement)
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

    //! Legend initialization
    vis.legendX = 100;
    vis.legendY = 20;
    vis.legend = vis.svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate("+ vis.legendX +","+ vis.legendY + ")")
        .attr("width", 200)
        .attr("height", 100);

    vis.initPizzas();
    //console.log($(vis.parentElement).width());
    vis.update();
}


PackChart.prototype.initPizzas = function()
{
    var vis = this;
    vis.pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.y; });

    vis.colorPizza = function(d){return d.x === qtMunClKeys[0] ? "grey" : "white";};
    //console.log(vis.colorPizza({x:qtMunClKeys[0] , y:4000}))

    vis.arc = function(outRad){
        return d3.arc()
            .innerRadius(0)
            .outerRadius(outRad);
    }
}

PackChart.prototype.update = function()
{
    var vis = this;
    vis.valueName = " Nº de municípios";
    vis.valueLegend = " municípios";
    vis.printLegend();
    // Adds an x, y, and r value to each node
    vis.root = vis.pack(vis.data);
    console.log("root ", vis.root);
    
    vis.dataStates = vis.root.descendants().filter((d)=>{return !d.children})
    //console.log("vis.dataStates", vis.dataStates);

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
    //console.log("svg", vis.svg);
    
    // Append a circle to each node.
    vis.node.append("circle")
        .attr("id", function(d) { return "node-" + d.id; })
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return d.data.color ? d.data.color : "none"; });
        // .style("stroke-width", function(d) { return d.data.color ? "1px" : "1px"; })
        // .style("stroke", function(d) { return d.data.color ? d.data.color : "black"; });

    /// gNodeRootSelector
    vis.rootSelector = vis.node.filter(function(d) { return !d.parent; });
    // Add mini donutCharts for only the leaf nodes
    vis.leaf = vis.node.filter(function(d) { return !d.children; });
    // Add mini donutCharts for only the leaf nodes
    for (const state of vis.dataStates) {
        let gSelector = vis.leaf.filter((d)=>{return d.id === state.id});
        vis.miniPizzas(gSelector, state); 
    }
    vis.miniPizzas(vis.rootSelector, vis.root); 

    // Add labels for only the leaf nodes
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
        .text(function(d) { return d.data.sigla + "\n" + formatNum(d.data.qtMun["2010"]) + vis.valueLegend; });
        
}
PackChart.prototype.miniPizzas = function(gSelector, nodeData)
{
    let vis = this;
        let pieDt = getXYArray(nodeData.data.qtMunClCount,qtMunClKeys);
        let arcsSelector = gSelector.selectAll(".arc-" + nodeData.id)
            .data(vis.pie( pieDt ))
            .enter().append("g")
            .attr("class", "arc-" + nodeData.id);
        arcsSelector.append("path")
            .attr("d", vis.arc(nodeData.r))
            .style("fill", function(d) { //console.log(d.data);console.log(vis.colorPizza(d.data));
                return vis.colorPizza(d.data); });
        
}

PackChart.prototype.hovered = function(hover){
    return function(d) {
        hoveredNumMun = d.ancestors();
        lineNumMunChart.update();
        //console.log(hoveredNumMun);
        d3.selectAll(d.ancestors().map(function(d) { return d.node; })).classed("node--hover", hover);
    };
}

PackChart.prototype.printLegend = function(){
    var vis = this;
    vis.legend.selectAll("g").remove();
    qtMunClKeys.forEach((label, i)=>{
		vis.legendRow = vis.legend.append("g")
			.attr("transform", "translate(0," + (i * 30) + ")");

			vis.legendRow.append("rect")
				.attr("width", 20)
				.attr("height", 20)
                .style("fill", vis.colorPizza({x:label}))
                .style("stroke", "black");

			vis.legendRow.append("text")
				.attr("x", -20)
				.attr("y", 20)
				.attr("text-anchor", "end")
                .style("text-transform", "capitalize")
                .attr("font-size", "20px")
                .text(label);
	});
}