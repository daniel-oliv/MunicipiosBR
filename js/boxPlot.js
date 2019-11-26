BoxPlot = function(_parentElement, _data, _title = ""){
    let vis = this;
    vis.parentElement = _parentElement;
    vis.data = _data;
    vis.title = _title;
    //console.log(_parentElement);
    vis.initVis();
};

BoxPlot.prototype.initVis = function(){
    let vis = this;
    vis.margin = { left:60, right:50, top:200, bottom:60 };
    vis.height = 1800 - vis.margin.top - vis.margin.bottom;
    vis.width = $(vis.parentElement).width() - vis.margin.left - vis.margin.right;
    //console.log(vis.width);

    vis.svg = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

    // Show the Y scale
    vis.yMax = 0;
    vis.y = d3.scaleLog().range([vis.height, vis.yMax]);

    // Axis generators
    //vis.xAxisCall = d3.axisBottom().ticks(7);
    vis.yAxisCall = d3.axisLeft()
        .tickFormat(function(d){ return "R$ " + d; });
    

    // Axis groups
    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");

    vis.r = 2;
    vis.lineBoxHeight = vis.r*2;
    vis.boxWidth = vis.width;
    vis.x1Box = 0;
    /// using left since  y(d) will be a stream in descending order (height to 0 px)
    vis.bisector = d3.bisector(function(d) { return d }).right; 

    vis.t = function(){ return d3.transition().duration(500); }
    
    // vis.frame = vis.svg.append("circle")
    //     .attr("class", "frame")
    //     .style("fill", "black")
    //     .style("stroke", "black")
    //     .style("stroke-width", "2px")
    //     .attr("height", vis.height*0.9)
    //     .attr("width", vis.width*0.9);

    //console.log(vis.svg);
    vis.updateVis();
}

BoxPlot.prototype.updateVis = function(){
    let vis = this;

    [vis.validData,  vis.unvalidData] = rollUpValidAndUnvalid(vis.data, (d)=>{return d[selecBoxKey] > 0;});
    console.log("vis.validData", vis.validData);
    vis.y.domain([d3.min(vis.validData, function(d){ //console.log("d3.min y ", d);
                            return d[selecBoxKey]; }) / 1.005, 
            d3.max(vis.validData, function(d){ return d[selecBoxKey]; }) * 1.005]);

    vis.yAxisCall.scale(vis.y);
        vis.yAxis.transition(vis.t()).call(vis.yAxisCall);

    vis.setXData();

    vis.circles =vis.g.selectAll(".circle-box")
        .data(vis.validData, vis.validData.id);
    
    vis.circles.exit().remove();
    vis.circles = vis.circles
        .enter()
        .append("circle")
            .attr("class", "circle-box")
            .attr("r", vis.r)
            .attr("stroke", "black")
            .style("fill", "green")
        .merge(vis.circles)
        
        vis.circles
            .transition(vis.t)
            .attr("cx", function(d){return d.x;})
            .attr("cy", function(d){return vis.y(d[selecBoxKey] );})
}

BoxPlot.prototype.setXData = function(){
    let vis = this;
    let rollUpIa = 0;
    let attrArray = vis.validData.map(d=>d[selecBoxKey]);
    for (let clUpLim = vis.height - vis.lineBoxHeight; true; clUpLim -= vis.lineBoxHeight) {
        //console.log("clUpLim ", (clUpLim));
        //console.log("clUpLim ", vis.y.invert(clUpLim));
        if(clUpLim < vis.yMax)
        {
            clUpLim = vis.yMax;
        }
        let rollUpI  = vis.bisector(attrArray, vis.y.invert(clUpLim));
        let lineData = vis.validData.slice(rollUpIa, rollUpI);
        rollUpIa = rollUpI;
        let step = vis.boxWidth / lineData.length;
        let xa = vis.x1Box;
        for(d of lineData)
        {
            d.x = xa + step;
            xa = d.x;
        }
        //console.log("lineData ", lineData)
        if(clUpLim === vis.yMax)
        {
           break;
        }
    }
}