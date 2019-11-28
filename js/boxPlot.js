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
    vis.height = 1000 - vis.margin.top - vis.margin.bottom;
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

    //! scale log or Linear
    vis.stScale = vis.stSelecToolDiv.append("select")
        .attr("id", "scale-select")
        .attr("name", "scale")
        .attr("class", "form-control")
        .on("change", ()=>{vis.updateVis()});
    
    vis.scaleOp=["Log", "Linear"]; 
    vis.options = vis.stScale.selectAll("option")
        .data(vis.scaleOp)
        .enter()
        .append("option")
        .text(function(d) {return d;})
        .attr("value", function(d) {return d;});
    
    vis.inInterval = vis.stSelecToolDiv.append("input")
        .attr("id", "interval-input")
        .attr("placeHolder", "Insira os intervalos no formato: 5000;5000:10000;10000")
        .attr("class", "form-control")
        .attr("value", "5000;5000:10000;10000:100000;100000");

    d3.select("#keepBt")
        .on("click", ()=>vis.clKeep(vis));

    d3.select("#colorBt")
        .on("click", ()=>vis.clColor(vis))

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
        .attr("transform", "translate("+(-0) + ",0)");

    // Y-Axis label
    // vis.g.append("text")
    // .attr("id", "yLabel")
    // .attr("class", "y axisLabel")
    // .attr("transform", "rotate(-90)")
    // .attr("y", -40)
    // .attr("x", -vis.height/2)
    // .attr("font-size", "20px")
    // .style("text-anchor", "middle")
    // .text("Nº de municípios");
    vis.g.append("text")
    .attr("id", "yLabel")
    .attr("class", "y axisLabel")
    .attr("y", -40)
    .attr("x", vis.width/2)
    .attr("font-size", "20px")
    .style("text-anchor", "middle");

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

    vis.filteredData = vis.data;
   //console.log("filteredData", vis.filteredData);
    vis.updateVis();
    vis.rangeColors = d3.scaleOrdinal(d3.schemeSet1);
}

BoxPlot.prototype.updateVis = function(){
    let vis = this;
    vis.elementsShowed = 0;
    [vis.validData,  vis.unvalidData] = rollUpValidAndUnvalid(vis.filteredData, (d)=>{return d[selecBoxKey] > 0;});
   //console.log("vis.validData", vis.validData);
   //console.log("update vis.filteredData", vis.filteredData);

    vis.g.select("#yLabel")
        .text(selecBoxKey + " - " + vis.validData.length + " municípios mostrados");

    // Show the Y scale
    vis.yMax = 0;
    vis.scaleType = $("#scale-select").val()
    if( vis.scaleType === "Log")
    {
        vis.y = d3.scaleLog().range([vis.height, vis.yMax]);
    }
    else{
        vis.y = d3.scaleLinear().range([vis.height, vis.yMax]);
    }
   
    vis.y.domain([d3.min(vis.validData, function(d){ //console.log("d3.min y ", d);
                            return d[selecBoxKey]; }) / 1.005, 
            d3.max(vis.validData, function(d){ return d[selecBoxKey]; }) * 1.005]);
            
    vis.yAxisCall.scale(vis.y);
        vis.yAxis.transition(vis.t()).call(vis.yAxisCall);

    vis.dataQuantisBoxes = [];
    vis.dataQuantisBoxes.push(getQuantis(vis.validData, selecBoxKey));

    vis.boxes = vis.g.selectAll(".boxes").remove();

    vis.boxes = vis.g
    .selectAll(".boxes")
    .data(vis.dataQuantisBoxes, (d)=>{console.log("data d ", d);return (d.key+"-"+vis.scaleType);});

    //console.log(vis.boxes.exit());
    //vis.boxes.exit().remove();
    
    vis.boxes
    .enter()
    .append("rect")
        .attr("class", "boxes")
        .attr("x", function(d){return 0;})
        .merge(vis.boxes)
        .attr("y", function(d){return(vis.y(d.q3))})
        .attr("height", function(d){return(vis.y(d.q1)-vis.y(d.q3))})
        .attr("width", vis.boxWidth )
        .attr("stroke", "black")
        .attr("stroke-width", "2px")
        .style("fill", "none")
    
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
            .attr("stroke", "black")
            .style("fill", (d)=>{return d.color ?  d.color : "none"; })
            .attr("cx", function(d){return d.x;})
            .attr("cy", function(d){return vis.y(d[selecBoxKey] );});
}

BoxPlot.prototype.filterData = function()
{
    vis = this;
    
    
    vis.previousData = vis.filteredData;
    
}

BoxPlot.prototype.clColor = function(vis) {
    //console.log("clKeep ");
     let selecRegion = $("#region-select").val();
     let selecState = $("#state-select").val();
     let isRgSelected = selecRegion != "any";
     let isStSelected = selecState != "any";
     let selectedInterval = $("#interval-input").val();
     
    //console.log("vis.filteredData ", vis.filteredData);
     vis.currentFiltered = vis.filteredData.concat();
 
     /// it does not make sense use previous location-filtered data to filter action
     if(selectedInterval == "")
     if(isStSelected || isRgSelected)
     {
        //console.log("vis.previousData ", vis.previousData);
         vis.currentFiltered = [];
         for (const city of vis.data) {
             if(isStSelected)
             {
                 if(city.UF === selecState)
                 {
                     //console.log("adding ", city);
                     vis.currentFiltered.push(city);
                 }
             }
             else if(isRgSelected)
             {
                 if(city.regiao === selecRegion)
                 {
                     vis.currentFiltered.push(city);
                 }
             }
         }
     }
 
     if(selectedInterval != "")
     {
         let attrArray = vis.currentFiltered.map(d=>d[selecBoxKey]);
        //console.log("selectedInterval ", selectedInterval);
        //console.log("attrArray ", attrArray);
        //console.log("bisect ", d3.bisectLeft(attrArray,parseInt(0)));
         let intervals = selectedInterval.split(";");
         let pairIntervals = [];
         intervals.forEach(elem => {
             let range = elem.split(":");
             pairIntervals.push( range.map((d)=>parseInt(d)) );
             if(pairIntervals[0].length == 1)
             {//initial interval
                 pairIntervals[0].splice(0,0,0);
             }
         });
 
        //console.log("pairIntervals ", pairIntervals);
         let fAttrData = [];
         for (const city of vis.currentFiltered) {
            city.color = "none";
             for (let index = 0; index < pairIntervals.length; index++) 
             {
                 let range = pairIntervals[index]
                 if( city[selecBoxKey] >= range[0] && (range.length === 1 || city[selecBoxKey] < range[1]) )
                 {
                     console.log(intervals[index]);
                    city.color = vis.rangeColors(intervals[index]);
                 }
             }
         }
         vis.currentFiltered = fAttrData.concat();
     }
     

    //console.log("filteredData ", vis.filteredData);
     vis.updateVis();
 
 };

BoxPlot.prototype.clKeep = function(vis) {
   //console.log("clKeep ");
    let selecRegion = $("#region-select").val();
    let selecState = $("#state-select").val();
    let isRgSelected = selecRegion != "any";
    let isStSelected = selecState != "any";
    let selectedInterval = $("#interval-input").val();
    
   //console.log("vis.filteredData ", vis.filteredData);
    vis.previousData = vis.filteredData.concat();
    vis.currentFiltered = vis.data.concat();

    /// it does not make sense use previous location-filtered data to filter action
    if(isStSelected || isRgSelected)
    {
       //console.log("vis.previousData ", vis.previousData);
        vis.currentFiltered = [];
        for (const city of vis.data) {
            if(isStSelected)
            {
                if(city.UF === selecState)
                {
                    //console.log("adding ", city);
                    vis.currentFiltered.push(city);
                }
            }
            else if(isRgSelected)
            {
                if(city.regiao === selecRegion)
                {
                    vis.currentFiltered.push(city);
                }
            }
        }
    }

    if(selectedInterval != "")
    {
        let attrArray = vis.currentFiltered.map(d=>d[selecBoxKey]);
       //console.log("selectedInterval ", selectedInterval);
       //console.log("attrArray ", attrArray);
       //console.log("bisect ", d3.bisectLeft(attrArray,parseInt(0)));
        let intervals = selectedInterval.split(";");
        let pairIntervals = [];
        intervals.forEach(elem => {
            let range = elem.split(":");
            pairIntervals.push( range.map((d)=>parseInt(d)) );
            if(pairIntervals[0].length == 1)
            {//initial interval
                pairIntervals[0].splice(0,0,0);
            }
        });

       //console.log("pairIntervals ", pairIntervals);
        let fAttrData = [];
        for (const city of vis.currentFiltered) {
            for (const range of pairIntervals) {
                if( city[selecBoxKey] >= range[0] && (range.length === 1 || city[selecBoxKey] < range[1]) )
                {
                    fAttrData.push(city);
                }
            }
        }
        vis.currentFiltered = fAttrData.concat();

    }
    vis.filteredData = vis.currentFiltered.concat();
   //console.log("filteredData ", vis.filteredData);
    vis.updateVis();

};

BoxPlot.prototype.onChangeRg = function() {
    let vis = this;

   //console.log("onChangeRg ");
    let selecRegion = $("#region-select").val();
   //console.log($("#region-select").val());

   //console.log("onChangeSt selecRegion ", selecRegion)

    let filterStates;
    if( selecRegion === "any")
    {   
       //console.log("any region")
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

    this.onChangeSt();

};

BoxPlot.prototype.onChangeSt = function() {
    let vis = this;
    
    
    
};

BoxPlot.prototype.onChangeAttr = function() {
   //console.log("onChangeAttr ", $("#attr-select").val())
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
        vis.setRandomX(lineData)
        //console.log("lineData ", lineData)
        if(clUpLim === vis.yMax)
        {
           break;
        }
    }  
    console.log("elementsShowed ", this.elementsShowed)
}

BoxPlot.prototype.setCentralX = function(lineData)
{
    //console.log("lineData ", lineData.length)
    let vis = this;
    let step = vis.boxWidth / (lineData.length-1);
    //let step = vis.r*2.5;
    let actualRange = 0;
    let centralX = vis.margin.left + (vis.x1Box + vis.width) / 2;
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
    let wSlot = this.r * 2;

    let possibleX = d3.range((vis.x1Box + wSlot/2), vis.boxWidth + vis.x1Box, wSlot);
    //console.log("possibleX", possibleX);
    //console.log("lineData", lineData.length);
    for (let i = 0; i < lineData.length; i++) {
        this.elementsShowed++;
        let randPos = getRandomInt(possibleX.length);
        let xPos = possibleX.splice(randPos,1);
        lineData[i].x = xPos;
        if(possibleX.length === 0) possibleX = d3.range(vis.x1Box + getRandomInt(wSlot), vis.boxWidth + vis.x1Box, wSlot);             
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
