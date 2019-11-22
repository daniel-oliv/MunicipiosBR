LineChart = function(_parentElement, _data, _title = ""){
    this.parentElement = _parentElement;
    this.data = _data;
    this.title = _title;
    console.log(_parentElement);
    this.initVis();
};

LineChart.prototype.initVis = function(){
    var vis = this;
    
    vis.margin = { left:60, right:50, top:30, bottom:60 };
    vis.height = 350 - vis.margin.top - vis.margin.bottom;
    vis.width = 470 - vis.margin.left - vis.margin.right;

    vis.svg = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

    vis.t = function(){ return d3.transition().duration(500); }

    // Add line to chart
    vis.g.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", "3px");

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

    vis.x.domain(d3.extent(vis.data, function(d){ return timeParseYear(d.x) ; }));
    vis.y.domain(d3.extent(vis.data, function(d){ return d.y; }));
    // vis.y.domain([d3.min(vis.data, function(d){ return d.y; }) / 1.005, 
    //     d3.max(vis.data, function(d){ return d[selectedAttribute]; }) * 1.005]);

    vis.xAxisCall.scale(vis.x);
    vis.xAxis.transition(vis.t()).call(vis.xAxisCall);
    vis.yAxisCall.scale(vis.y);
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall.tickFormat(formatNum));

    vis.line = d3.line()
        .x(function(d){ return vis.x(timeParseYear(d.x));    })
        .y(function(d){ return vis.y(d.y);    });

    vis.g.select(".line")
        .transition(vis.t)
        .attr("d", vis.line(vis.data));
}


