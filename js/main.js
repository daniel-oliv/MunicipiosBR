/*
*    main.js
*   
*/


let country;
let hoveredNumMun;
var yearKeys;

var lineNumMunChart;
let packChart;

// Time parser for x-scale
var timeParseYear = d3.timeParse("%Y");
var timeFormatYear = d3.timeFormat("%Y");

var formatNum = d3.format(".0f");

let regionColors = d3.scaleOrdinal(d3.schemeSet1);

var stratifyRegion = d3.stratify()
    .parentId(function(d) { return d.id ? (Math.floor(d.id/10)) : ""; });

var dataPromises = [d3.json("data/estados.json"), d3.json("data/regioes.json"), d3.csv("data/NumDeMunicípios.csv")];

Promise.all(dataPromises).then(function([estadosJSON, regionsJSON, numMunCSV]){    
    //console.log(estadosJSON);
    //console.log(numMunCSV);
    yearKeys = d3.keys(numMunCSV[0]).filter((d)=>{return d != "nome";});
    //console.log(yearKeys);

    let statesAndRegions = estadosJSON.concat(regionsJSON);
    statesAndRegions.push({id:0, nome:"Brasil", sigla:"BR"});
    let count = 0;
    for (let local of statesAndRegions) {
        if(local.regiao) ///for every state
        {
            for(state of numMunCSV)
            {
                if(state.nome == local.nome)
                {   //console.log(state.nome);
                    for (const year of yearKeys) {
                        local[year] = +state[year];
                    }
                }
                ///since the state was found, go to next
                continue;
            }
            local.regiao = null;
        }
    }


    country = stratifyRegion(statesAndRegions)
        .sum(function(d) { return d["2000"]; })
        .sum(function(d) { return d["2010"]; })
        .sort(function(a, b) { return b["2010"] - a["2010"]; });

    //! summing all the years for the regions and adding colors
    for (const region of country.children) {
        region.data.color = regionColors(region.data.nome);
        console.log("region da ", region.data);
        for (const year of yearKeys) {
            // console.log(region.data.nome);
            // console.log(region.children);
            region.data[year] = sumArray(region.children.map(d=>{return d.data[year];}))
        }
    }
    //! and summing all the years for the country and adding color
    for (const year of yearKeys) {
        //country.data.color = "#ccff99";
        country.data[year] = sumArray(country.children.map(d=>{return d.data[year];}));
    }
    //console.log(country);

    hoveredNumMun = [];
    hoveredNumMun.push(country);
    lineNumMunChart = new LineChart("#line-chart-1", getXYArray(country.data, yearKeys), "Número de municípios");
    packChart = new PackChart("#pack-chart-1", country, "Número de municípios");
})

function getXYArray(objc, xKeys)
{
    let ret = [];
    for(x of xKeys)
    {
        ret.push({x: x, y:objc[x]})
    }
    return ret;
}

function sumArray(array)
{
    let sum = 0;
    for (const num of array) {
        sum+=num;
    }
    return sum;
}

function isCountry(node)
{

}

function isCity(node)
{

}

function isRegion(node)
{

}