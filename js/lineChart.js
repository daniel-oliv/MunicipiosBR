LineChart = function(_parentElement, _data, _title = ""){
    this.parentElement = _parentElement;
    this.data = _data;
    this.title = _title;
    //console.log(_parentElement);
    this.initVis();
};

LineChart.prototype.initVis = function(){
    var vis = this;
    
    vis.margin = { left:60, right:50, top:200, bottom:60 };
    vis.height = 500 - vis.margin.top - vis.margin.bottom;
    vis.width = $(vis.parentElement).width() - vis.margin.left - vis.margin.right;
    //console.log(vis.width);

    vis.svg = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

    vis.t = function(){ return d3.transition().duration(500); }

    //!
    vis.legendX = vis.width;
    vis.legendY = vis.margin.top + vis.height * 0.4;
    vis.legend = vis.svg.append("g")
        .attr("transform", "translate("+ vis.legendX +","+ vis.legendY + ")")
        .attr("width", vis.width/5)
        .attr("height", vis.height/5);

    // Scales
    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    // Axis generators
    vis.xAxisCall = d3.axisBottom()
        .ticks(7);
    vis.yAxisCall = d3.axisLeft();

    // Axis groups
    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");

    // X-Axis label
    vis.g.append("text")
        .attr("class", "x axisLabel")
        .attr("y", vis.height + 50)
        .attr("x", vis.width / 2)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Ano");
    // Y-Axis label
    vis.g.append("text")
        .attr("class", "y axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", -vis.height/2)
        .attr("font-size", "20px")
        .style("text-anchor", "middle")
        .text("Nº de municípios");

        vis.update();
}

LineChart.prototype.update = function()
{
    var vis = this;

    vis.printLegend();

    vis.yMax = d3.max(hoveredNumMun.slice(0,2).map(d=>{return d.data.qtMun["2010"];}));
    //console.log(vis.yMax);
    vis.x.domain(d3.extent(vis.data, function(d){ return timeParseYear(d.x) ; }));
    vis.y.domain([0, vis.yMax]);
    // vis.y.domain([d3.min(vis.data, function(d){ return d.y; }) / 1.005, 
    //     d3.max(vis.data, function(d){ return d[selectedAttribute]; }) * 1.005]);

    vis.xAxisCall.scale(vis.x);
    vis.xAxis.transition(vis.t()).call(vis.xAxisCall);
    vis.yAxisCall.scale(vis.y);
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall.tickFormat(formatNum));

    vis.line = d3.line()
        .x(function(d){ return vis.x(timeParseYear(d.x));    })
        .y(function(d){ return vis.y(d.y);    });

    vis.lines =vis.g.selectAll(".line")
        .data(hoveredNumMun.slice(0,2), function(d){return d.id;});
    
    vis.lines.exit().remove();
    //console.log("vis.lines ", vis.lines);
    vis.lines = vis.lines
        .enter()
        .append("path")
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", (place)=>{return place.data.color ? place.data.color : "black";})
            .attr("stroke-width", "3px")
        .merge(vis.lines)
        
        vis.lines
            .transition(vis.t)
            .attr("d", function(d){return vis.line(getXYArray(d.data.qtMun, yearKeys))});
        
    //console.log(vis.lines.length);
    
}

LineChart.prototype.printLegend = function(){
    var vis = this;
    vis.legend.selectAll("g").remove();
    hoveredNumMun.slice(0,2).forEach((place, i)=>{
		vis.legendRow = vis.legend.append("g")
			.attr("transform", "translate(0," + (i * 20) + ")");

			vis.legendRow.append("rect")
				.attr("width", 10)
				.attr("height", 10)
				.attr("fill", place.data.color ? place.data.color : "black");

			vis.legendRow.append("text")
				.attr("x", -10)
				.attr("y", 10)
				.attr("text-anchor", "end")
				.style("text-transform", "capitalize")
                .text(place.data.nome)
                    .attr("fill", place.data.color ? place.data.color : "black");
	});
}
