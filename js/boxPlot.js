
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
    vis.height = 700 - vis.margin.top - vis.margin.bottom;
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

    //! city select
    vis.stCity = vis.stSelecToolDiv.append("select")
        .attr("id", "city-select")
        .attr("name", "city")
        .on("change", ()=>{vis.onChangeCity()});

    vis.cityDefaultOp=[{nome:"Cidade", id:"any"} ]; 

    vis.options = vis.stCity.selectAll("option")
        .data(vis.cityDefaultOp.concat(vis.data), function(d){ return d.id;})
        .enter()
        .append("option")
        .text(function(d) {return d.nome;})
        .attr("value", function(d) {return d.id;});


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
        .on("click", ()=>vis.clColor(vis));

    d3.select("#focusBt")
        .on("click", ()=>vis.clFocus(vis));

    //! svg for vizualization
    vis.svg = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom);    

    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + ", " + vis.margin.top + ")");

    // Axis generators
    //vis.xAxisCall = d3.axisBottom().ticks(7);
    vis.yAxisCall = d3.axisLeft();
    

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
    console.log("vis.validData", vis.validData);
   //console.log("update vis.filteredData", vis.filteredData);

    vis.g.select("#yLabel")
        .text(selecBoxKey + " - " + vis.validData.length + " municípios mostrados");

    // Show the Y scale
    vis.yMax = 0;
    vis.scaleType = $("#scale-select").val()
    if( vis.scaleType === "Log")
    {
        vis.y = d3.scaleLog().range([vis.height, vis.yMax]);
        vis.yAxisCall.ticks(3);
    }
    else{
        vis.y = d3.scaleLinear().range([vis.height, vis.yMax]);
        vis.yAxisCall.ticks(8);
    }
   
    vis.y.domain([d3.min(vis.validData, function(d){ //console.log("d3.min y ", d);
                            return d[selecBoxKey]; }) / 1.005, 
            d3.max(vis.validData, function(d){ return d[selecBoxKey]; }) * 1.005]);
            
    vis.yAxisCall.scale(vis.y)
        
        .tickFormat(getTickFormat(selecBoxKey));
    
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall);
    /// for color classes metrics
    if(vis.legendColor)
    {
        vis.colorMetrics = {};
        for (const interval of vis.intervals) {
            vis.colorMetrics[interval] = {count:0, total:0};
        }
        //! Legend initialization
        vis.svg.select("#legend-color").remove();
        vis.legendX = vis.width + 100;
        vis.legendY = 30;
        vis.legendColor = vis.svg.append("g")
            .attr("class", "legend")
            .attr("id", "legend-color")
            .attr("transform", "translate("+ vis.legendX +","+ vis.legendY + ")");
        
        
        for (const city of vis.validData) {
            vis.colorMetrics[city.clColor].count++;
            if(selecBoxKey.includes("per capita"))
            {
                vis.colorMetrics[city.clColor].total += city[selecBoxKey] * city[popKey];
            }
            else{
                vis.colorMetrics[city.clColor].total += city[selecBoxKey];
            }
        }
        vis.printTextLegend(vis.legendColor, [selecBoxKey],d=>d)
        vis.printColorLegend(vis.legendColor, vis.intervals, vis.rangeColors, (d)=>{return (d+ " Total de:" + getTickFormat(selecBoxKey)(vis.colorMetrics[d].total) );}, 20);

   //console.log("colorMetrics ", vis.colorMetrics);
    let sumAttr1 = 0;
    let countT1 = 0;
    for (const interval of vis.intervals) {
        sumAttr1 += vis.colorMetrics[interval].total;
        countT1 += vis.colorMetrics[interval].count;
    }
    console.log("sumAttr1", sumAttr1);
    console.log("countT1", countT1);
    }

    vis.dataQuantisBoxes = [];
    vis.dataQuantisBoxes.push(getQuantis(vis.validData, selecBoxKey));

    vis.boxes = vis.g.selectAll(".boxes").remove();

    vis.boxes = vis.g
    .selectAll(".boxes")
    .data(vis.dataQuantisBoxes, (d)=>{return (d.key+"-"+vis.scaleType);});

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
// DATA
    vis.circles = vis.g.selectAll(".circle-box")
      .data(vis.validData, (d)=>{return d.id;});
   //console.log("after data ", vis.circles);
// UPDATE old elements that are in both old and new list before use enter
    vis.circles
        .attr("class", "circle-box")
        .selectAll("title").remove();
// EXIT  
    vis.circles.exit().remove();
   //console.log("after exit remove ", vis.circles);
// ENTER
    vis.circles.enter().append("circle")
        .attr("class", "circle-box");
// ENTER + UPDATE
    // .merge(vis.circle) 
vis.circles = vis.g.selectAll(".circle-box")
    //     .transition(vis.t)
        .attr("r", d=>d.focus ? vis.r*1.2 : vis.r)
        .attr("stroke", "black")
        .attr("stroke-width", d=>{return d.focus ? "2.5px": "0.1px"})
        .attr("fill-opacity", d=>{return !vis.focusApplied ? 1 : (d.focus ? "1": "0.2") })
        .style("fill", (d)=>{return d.color ?  d.color : "none"; })
        .attr("cx", function(d){return d.x;})
        .attr("cy", function(d){return vis.y(d[selecBoxKey] );})
        .append("title")
            .text(function(d) { return d["nome"] + ", " + d["UF"]+ "\n" + selecBoxKey + ": "+ d[selecBoxKey] + "\n"; });
}

BoxPlot.prototype.filterData = function()
{
    vis = this;
    
    
    vis.previousData = vis.filteredData;
    
}

BoxPlot.prototype.clFocus = function(vis) {
    //console.log("clKeep ");
    //! for class color metrics
    vis.focusApplied = false;
     
     let selecRegion = $("#region-select").val();
     let selecState = $("#state-select").val();
     let selecCity= $("#city-select").val();
    console.log("selecCity ", selecCity);
     let isRgSelected = selecRegion != "any";
     let isStSelected = selecState != "any";
     let isCitySelected = selecCity != "any";

     let selectedInterval = $("#interval-input").val();
     
    //console.log("vis.filteredData ", vis.filteredData);
     vis.currentFiltered = vis.filteredData.concat();
 
     /// it does not make sense use previous location-filtered data to filter action
     //if(selectedInterval == "")
     if(isCitySelected || isStSelected || isRgSelected)
     {
       //console.log("isStSelected ", isStSelected);
         vis.currentFiltered = [];
         for (const city of vis.data) {
            if(isCitySelected)
            {
                //console.log("isCitySelected", isCitySelected);
                console.log("city.id" , city.id);
                if(city.id == selecCity)
                {
                    console.log("adding ", city);
                    vis.currentFiltered.push(city);
                    break;
                }
            }
             else if(isStSelected)
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
     let pairIntervals = [];
     if(selectedInterval != "")
     {
         vis.intervals = selectedInterval.split(";");   
         vis.intervals.forEach(elem => {
             let limit = elem.split(":");
             pairIntervals.push( limit.map((d)=>parseInt(d)) );
             if(pairIntervals.length > 1 && pairIntervals[0].length == 1)
             {//initial interval
                 pairIntervals[0].splice(0,0,0);
             }
         });
         
        for (const city of vis.currentFiltered) {
            city.focus = false;
            for (let index = 0; index < pairIntervals.length; index++) 
            {
                let range = pairIntervals[index]
                if( city[selecBoxKey] >= range[0] && (range.length === 1 || city[selecBoxKey] < range[1]) ) 
                {
                    //console.log("focus applied.");
                    vis.focusApplied = true;
                    city.focus = true;
                    /// go to next city
                    break;
                }
            }
        }
    }
    else{
        if(vis.currentFiltered.length > 0) vis.focusApplied = true;
        for (const city of vis.currentFiltered) {city.focus = true};
    }
     vis.updateVis();
 };

BoxPlot.prototype.clColor = function(vis) {
    //console.log("clKeep ");
    //! for class color metrics
    /// legend
    vis.legendColor = vis.svg.append("g")
        .attr("class", "legend")
        .attr("id", "legend-color")
        .attr("transform", "translate("+ vis.legendX +","+ vis.legendY + ")");
     
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
         vis.intervals = selectedInterval.split(";");
         //console.log(vis.legendColor);

         let pairIntervals = [];
         vis.intervals.forEach(elem => {
             let limit = elem.split(":");
             pairIntervals.push( limit.map((d)=>parseInt(d)) );
             if(pairIntervals.length > 1 && pairIntervals[0].length == 1)
             {//initial interval
                 pairIntervals[0].splice(0,0,0);
             }
         });
 
         /// for color classes metrics
         
        //console.log("pairIntervals ", pairIntervals);
         let fAttrData = [];
         for (const city of vis.currentFiltered) {
            city.color = "none";
             for (let index = 0; index < pairIntervals.length; index++) 
             {
                 let range = pairIntervals[index]
                 if( city[selecBoxKey] >= range[0] && (range.length === 1 || city[selecBoxKey] < range[1]) )
                 {
                    city.clColor = vis.intervals[index];
                    city.color = vis.rangeColors(vis.intervals[index]);
                 }
             }
         }
         //console.log("vis.colorMetrics ", vis.colorMetrics)
         vis.currentFiltered = fAttrData.concat();
     }
     

    //console.log("filteredData ", vis.filteredData);
     vis.updateVis();
 
 };

 BoxPlot.prototype.setClassColorElemsMetrics = function(_data, intervalsKeys)
 {
    [vis.validData,  vis.unvalidData] = rollUpValidAndUnvalid(vis.filteredData, (d)=>{return d[selecBoxKey] > 0;});
    for (const city of vis.validData) {
        for (const interval of intervals) {
            
        }
    }
 };

 BoxPlot.prototype.printTextLegend = function(legendSelector, textElems, getText)
{  //console.log("printTextLegend ");
    textElems.forEach((item, i)=>{
        let legendRow = legendSelector.append("g")
            .attr("transform", "translate(0," + (i * 20) + ")");

            legendRow.append("text")
                .attr("x", 0)
                .attr("y", 10)
                .attr("text-anchor", "end")
                .style("text-transform", "capitalize")
                .text(getText(item))
                    .attr("fill",  getText(item));
    });
 
};

BoxPlot.prototype.printColorLegend = function(legendSelector, coloredElems, getColor, getText, yOffset = 0)
{
    coloredElems.forEach((item, i)=>{
        let legendRow = legendSelector.append("g")
            .attr("transform", "translate(0," + (yOffset + i * 20) + ")");

            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", getColor(item));

            legendRow.append("text")
                .attr("x", -10)
                .attr("y", 10)
                .attr("text-anchor", "end")
                .style("text-transform", "capitalize")
                .text(getText(item))
                    .attr("fill",  getColor(item));
    });
 
}

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
   //console.log("vis.currentFiltered", vis.currentFiltered);
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
            if(pairIntervals.length > 1 && pairIntervals[0].length == 1)
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
    let selecState = $("#state-select").val();
   //console.log($("#region-select").val());
   //console.log("onChangeSt selecRegion ", selecRegion)

    let filterCities;
    let stSigla;
    if( selecState === "any")
    {   
       //console.log("any region")
       filterCities = vis.data;
    }
    else
    {
        //console.log("selecState ", selecState);
        filterCities = vis.data.filter((d)=>{ return (d.UF === selecState);});
    }
    vis.stCity.selectAll("option").remove();
    vis.stCity.selectAll("option")
        .data(vis.cityDefaultOp.concat(filterCities), function(d){ return d.nome})
        .enter()
        .append("option")
        .text(function(d) {return d.nome;})
        .attr("value", function(d) {return d.id;});    

    this.onChangeCity();

    
};

BoxPlot.prototype.onChangeCity = function() {

}

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
