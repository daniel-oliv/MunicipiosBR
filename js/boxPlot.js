BoxPlot = function(_parentElement, _data, _title = ""){
    this.parentElement = _parentElement;
    this.data = _data;
    this.title = _title;
    //console.log(_parentElement);
    this.initVis();
};

BoxPlot.prototype.initVis = function(){
    var vis = this;
    vis.margin = { left:60, right:50, top:200, bottom:60 };
    vis.height = 700 - vis.margin.top - vis.margin.bottom;
    vis.width = $(vis.parentElement).width() - vis.margin.left - vis.margin.right;
    //console.log(vis.width);

    vis.svg = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

    // Show the Y scale
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    // Axis generators
    //vis.xAxisCall = d3.axisBottom().ticks(7);
    vis.yAxisCall = d3.axisLeft();

    // Axis groups
    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");
    
    // vis.frame = vis.svg.append("circle")
    //     .attr("class", "frame")
    //     .style("fill", "black")
    //     .style("stroke", "black")
    //     .style("stroke-width", "2px")
    //     .attr("height", vis.height*0.9)
    //     .attr("width", vis.width*0.9);

    console.log(vis.svg);
}