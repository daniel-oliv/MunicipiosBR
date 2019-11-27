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
    vis.margin = { left:60, right:50, top:100, bottom:60 };
    vis.height = 1800 - vis.margin.top - vis.margin.bottom;
    vis.width = $(vis.parentElement).width() - vis.margin.left - vis.margin.right;
    //console.log(vis.width);

    vis.stSelecToolDiv = d3.select("#selec-tools-div");
    //! region select
    vis.stRegion = vis.stSelecToolDiv.append("select")
        .attr("id", "region-select")
        .attr("name", "region")
        .on("change", ()=>{vis.onChangeRg()});
    
    vis.rgDefaultOp=[{data:{nome:"Região", sigla:"any"} }]; 

    vis.options = vis.stRegion.selectAll("option")
        .data(vis.rgDefaultOp.concat(regionsData), function(d){ return d.data.sigla})
        .enter()
        .append("option")
        .text(function(d) {return d.data.nome;})
        .attr("value", function(d) {return d.data.sigla;});

    //! state select
    vis.stState = vis.stSelecToolDiv.append("select")
        .attr("id", "state-select")
        .attr("name", "state")
        .on("change", ()=>{vis.onChangeSt()});

    vis.stateDefaultOp=[{data:{nome:"Estado", sigla:"any"} }]; 

    vis.options = vis.stState.selectAll("option")
        .data(vis.stateDefaultOp.concat(statesData), function(d){ return d.data.sigla})
        .enter()
        .append("option")
        .text(function(d) {return d.data.nome;})
        .attr("value", function(d) {return d.data.sigla;});

    //!Attribute select
    vis.stSelecToolDiv.append("br")
    vis.stSelecToolDiv.append("br")
    vis.stAttr = vis.stSelecToolDiv.append("select")
        .attr("id", "attr-select")
        .attr("name", "attribute")
        .attr("class", "form-control")
        .on("change", ()=>{vis.onChangeAttr()});

    vis.attrDefaultOp=["Atributo"]; 

    vis.options = vis.stAttr.selectAll("option")
        .data(vis.attrDefaultOp.concat(attrToSelect))
        .enter()
        .append("option")
        .text(function(d) {return d;})
        .attr("value", function(d) {return d;});

    vis.inInterval = vis.stSelecToolDiv.append("input")
        .attr("id", "interval-input")
        .attr("placeHolder", "Insira os intervalos no formato: 5000;5000:10000;10000")
        .attr("class", "form-control");

    d3.select("#keepBt")
        .on("onclick", vis.clKeep)

    //! svg for vizualization
    vis.svg = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);    

    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

    // Axis generators
    //vis.xAxisCall = d3.axisBottom().ticks(7);
    vis.yAxisCall = d3.axisLeft()
        .tickFormat(function(d){ return "R$ " + d; });
    

    // Axis groups
    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate("-vis.margin.left/2 + "," + vis.height + ")");

    vis.r = 2.5;
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

    
    vis.filterData = vis.data;
    //console.log(vis.svg);
    vis.updateVis();
}

BoxPlot.prototype.updateVis = function(){
    let vis = this;
    [vis.validData,  vis.unvalidData] = rollUpValidAndUnvalid(vis.filterData, (d)=>{return d[selecBoxKey] > 0;});
    console.log("vis.validData", vis.validData);

    // Show the Y scale
    vis.yMax = 0;
    vis.y = d3.scaleLog().range([vis.height, vis.yMax]);
    vis.y.domain([d3.min(vis.validData, function(d){ //console.log("d3.min y ", d);
                            return d[selecBoxKey]; }) / 1.005, 
            d3.max(vis.validData, function(d){ return d[selecBoxKey]; }) * 1.005]);
    console.log("y max ", vis.y.range[1]);
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
        .merge(vis.circles)
        
        vis.circles
            .transition(vis.t)
            .attr("r", vis.r)
            //.attr("stroke", "black")
            .style("fill", "green")
            .attr("cx", function(d){return d.x;})
            .attr("cy", function(d){return vis.y(d[selecBoxKey] );})
}

BoxPlot.prototype.filterData = function()
{
    vis = this;
    
    
    vis.previousData = vis.filteredData;
    
}

BoxPlot.prototype.clKeep = function() {
    console.log("clKeep ");
    vis = this;

    vis.previousData = vis.filterData;
    vis.validData = [];
    let selecRegion = $("#region-select").val();
    let selecState = $("#region-select").val();

    

    // let validate
    // if(selecState =! "any")
    // {}
    // else if(selecState)
    // for (const city of previousData) {
        
    //     for (const iterator of object) {
            
    //     }
    // }


};

BoxPlot.prototype.onChangeRg = function() {
    console.log("onChangeRg ");
    console.log($("#region-select").val());
    this.onChangeSt();

};

BoxPlot.prototype.onChangeSt = function() {
    let vis = this;
    let selecRegion = $("#region-select").val();
    
    console.log("onChangeSt selecRegion ", selecRegion)

    let filterStates;
    if( selecRegion === "any")
    {   
        console.log("any region")
        filterStates = statesData;
    }
    else
    {
        filterStates = statesData.filter((d)=>{ return (d.data.regiao === selecRegion);});
    }
    vis.stState.selectAll("option").remove();
    vis.stState.selectAll("option")
        .data(vis.stateDefaultOp.concat(filterStates), function(d){ return d.data.sigla})
        .enter()
        .append("option")
        .text(function(d) {return d.data.nome;})
        .attr("value", function(d) {return d.data.sigla;});    
};

BoxPlot.prototype.onChangeAttr = function() {
    console.log("onChangeAttr ", $("#attr-select").val())
    if($("#attr-select").val() != "Atributo")
    {
        selecBoxKey = $("#attr-select").val();
        this.updateVis();
    }
};

BoxPlot.prototype.initFilterFields = function(){

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
        //console.log("lineData ", lineData);
        vis.setCentralX(lineData)
        //console.log("lineData ", lineData)
        if(clUpLim === vis.yMax)
        {
           break;
        }
    }  
}

BoxPlot.prototype.setCentralX = function(lineData)
{
    //console.log("lineData ", lineData.length)
    let vis = this;
    //let step = vis.boxWidth / (lineData.length-1);
    let step = vis.r*2.5;
    let actualRange = 0;
    let centralX =  vis.x1Box + vis.boxWidth / 2;
    let i = 0;
    if(lineData.length % 2 != 0)
    {
        lineData[i].x = centralX;
        i++;
    }

    for (; i < lineData.length; i+=2) {
        //console.log("i ", i);
        actualRange+=step;
       //console.log("i ", i);
        lineData[i].x = centralX + actualRange;
        lineData[i+1].x = centralX - actualRange;     
    }
}

BoxPlot.prototype.setRandomX = function(lineData)
{
    //console.log("lineData ", lineData.length)
    let vis = this; 
    let step = vis.boxWidth / (lineData.length-1);
    //let step = vis.r*3;
    let actualRange = 0;
    let centralX =  vis.x1Box + vis.boxWidth / 2;
    let i = 0;
    if(lineData.length % 2 != 0)
    {
        //console.log("is odd length i ", i)
        lineData[i].x = centralX;
        i++;
    }

    for (; i < lineData.length; i+=2) {
        //console.log("i ", i);
        actualRange+=step;
       //console.log("i ", i);
        lineData[i].x = centralX + actualRange;
        lineData[i+1].x = centralX - actualRange;     
    }
}

BoxPlot.prototype.setMostDistantX = function(lineData)
{
    let vis = this;
    let step = vis.boxWidth / lineData.length;
    let xa = vis.x1Box;
    for(d of lineData)
    {
        d.x = xa + step;
        xa = d.x;
    }
}

///for show selects that can be added continuous
// vis.stShowDiv = d3.select(vis.parentElement).append("div");
// vis.slCount = 1;
// let slNum = vis.slCount;
// vis.st = vis.stShowDiv.append("select")
//     .attr("name", "region-"+vis.slCount)
//     .on("change", ()=>{vis.onChangeRg(slNum)});

// vis.rgDefaultOp=[{data:{nome:"Região", sigla:"any"} }]; 

// vis.options = vis.st.selectAll("option")
//     .data(vis.rgDefaultOp.concat(regionsData), function(d){console.log("d ", d); return d.data.sigla})
//     .enter()
//     .append("option");

// vis.options.text(function(d) {
//     return d.data.nome;
//         })
//         .attr("value", function(d) {
//     return d.data.sigla;
// });
// vis.slCount++;
