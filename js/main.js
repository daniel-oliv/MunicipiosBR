/*
*    main.js
*   
*/
let startTime = performance.now()

let country;
let hoveredNumMun;
var yearKeys = ["1950","1960","1970","1980","1991","2000","2010"];

var lineNumMunChart;
let packChart;
let boxPlot;

// Time parser for x-scale
var timeParseYear = d3.timeParse("%Y");
var timeFormatYear = d3.timeFormat("%Y");

var formatNum = d3.format(".0f");

let regionColors = d3.scaleOrdinal(d3.schemeSet1);

var stratifyRegion = d3.stratify()
    .parentId(function(d) { return d.id ? (Math.floor(d.id/10)) : ""; });

var dataPromises = [d3.json("data/estados.json"), d3.json("data/regioes.json"), d3.csv("data/NumDeMunicípios.csv")];
var dataExpensePromises = [];
var expensesCSVKeys = ["id","UF","População 2016","nome","Total da Despesa por Função per capita","Legislativa per capita","Judiciária per capita","Essencial à Justiça per capita","Administração per capita","Defesa Nacional per capita","Segurança Pública per capita","Relações Exteriores per capita","Assistência Social per capita","Previdência Social per capita","Saúde per capita","Trabalho per capita","Educação per capita","Cultura per capita","Direitos da Cidadania per capita","Urbanismo per capita","Habitação per capita","Saneamento per capita","Gestão Ambiental per capita","Ciência e Tecnologia per capita","Agricultura per capita","Organização Agrária per capita","Indústria per capita","Comércio e Serviços per capita","Comunicações per capita","Energia per capita","Transporte per capita","Desporto e Lazer per capita","Encargos Especiais per capita","TOTAL DA DESPESA POR FUNÇÃO (INTRAORÇAMENTÁRIA) per capita","TOTAL GERAL DA DESPESA POR FUNÇÃO per capita"];
var expensesCSVNumKeys = ["id","População 2016","Total da Despesa por Função per capita","Legislativa per capita","Judiciária per capita","Essencial à Justiça per capita","Administração per capita","Defesa Nacional per capita","Segurança Pública per capita","Relações Exteriores per capita","Assistência Social per capita","Previdência Social per capita","Saúde per capita","Trabalho per capita","Educação per capita","Cultura per capita","Direitos da Cidadania per capita","Urbanismo per capita","Habitação per capita","Saneamento per capita","Gestão Ambiental per capita","Ciência e Tecnologia per capita","Agricultura per capita","Organização Agrária per capita","Indústria per capita","Comércio e Serviços per capita","Comunicações per capita","Energia per capita","Transporte per capita","Desporto e Lazer per capita","Encargos Especiais per capita","TOTAL DA DESPESA POR FUNÇÃO (INTRAORÇAMENTÁRIA) per capita","TOTAL GERAL DA DESPESA POR FUNÇÃO per capita"];
var popKey = "População 2016";
var qtMunClKeys = ["< 5000",">= 5000"];

Promise.all(dataPromises).then(function([estadosJSON, regionsJSON, numMunCSV]){
    for (const region of regionsJSON) {
        dataExpensePromises.push(d3.csv("data/DespesaPorFuncao-PerCapita-"+region.nome+'.csv'))
    }
    Promise.all(dataExpensePromises).then(function(expensesCSVData){
    
    let citesExpensesData = [];
    for (const region of expensesCSVData) {
        for (const city of region) {
            for (const expKey of expensesCSVNumKeys) {
                city[expKey] = +city[expKey];
            }
            citesExpensesData.push(city)
        }
    }
    console.log("expensesCSVData", expensesCSVData);
   //console.log("statesExpensesData", citesExpensesData);
    //FileManager.saveCSV("teste", citesExpensesData);
    //console.log(yearKeys);
    //console.log(estadosJSON)
    let statesAndRegions = estadosJSON.concat(regionsJSON);
    //console.log(statesAndRegions)
    statesAndRegions.push({id:0, nome:"Brasil", sigla:"BR"});
    let count = 0;
    for (let local of statesAndRegions) {
        local.qtMun = {};
        local.qtMunCl = {}
        for (const clKey of qtMunClKeys) {
            local.qtMunCl[clKey] = 0;    
        }
        if(local.regiao) ///for every state
        {
            for(state of numMunCSV)
            {                
                if(state.nome == local.nome)
                {   //console.log(state.nome);
                    /// adding the number of cities in every year
                    for (const year of yearKeys) {
                        local.qtMun[year] = +state[year];
                    }
                }
                ///since the state was found, go to next
                continue;
            }
            //! adding another states data
            for (const city of citesExpensesData) {
                if(city.UF == local.sigla)
                {
                    for (const clKey of qtMunClKeys) {
                        //console.log(eval(city[popKey] + clKey));
                        if(eval(city[popKey] + clKey))
                        {
                            //console.log(city[popKey] + clKey);
                            local.qtMunCl[clKey]++
                            continue;
                        }
                    }
                }
            }
            local.regiao = null;
        }
        else
        {
        }
    }
    //console.log("before stratify",statesAndRegions);
    country = stratifyRegion(statesAndRegions);
    //console.log("after stratify", country);
    //! summing all the years for the regions and adding colors
    for (const region of country.children) {
        region.data.color = regionColors(region.data.nome);
        for (const year of yearKeys) {
            //console.log(region.data.nome);
            //console.log(region.children);
            for (const clKey of qtMunClKeys) {
                region.data.qtMunCl[clKey] = sumArray(region.children.map(d=>{return d.data.qtMunCl[clKey];}));    
            }
            region.data["qtMun"][year] = sumArray(region.children.map(d=>{return d.data.qtMun[year];}))
        }
    }
    //! and summing all the years for the country and adding color
    for (const year of yearKeys) {
        //countrydata.qtMun.color = "#ccff99";
        for (const clKey of qtMunClKeys) {
            country.data.qtMunCl[clKey] = sumArray(country.children.map(d=>{return d.data.qtMunCl[clKey];}));    
        }
        //console.log("sumArr ", sumArray(country.children.map(d=>{return d.data.qtMun[year];})));
        country.data["qtMun"][year] = sumArray(country.children.map(d=>{return d.data.qtMun[year];}));
    }

    /// i can't reset cause this makes a problem in root node tootip and 
    //resetValueParents(country, (d)=>{d.data.qtMun["2010"]=0});

    country
        .sum(function(d) {return d.qtMun["2010"]; })
        .sort(function(a, b) {//console.log("sort ",(b.data.nome +" " + a.data.nome)); console.log("sort ",(b.data.qtMun["2010"] - a.data.qtMun["2010"]));
            return b.data.qtMun["2010"] - a.data.qtMun["2010"]; });
    //console.log(country);

    hoveredNumMun = [];
    hoveredNumMun.push(country);
    lineNumMunChart = new LineChart("#line-chart-1", getXYArray(country.data.qtMun, yearKeys), "Número de municípios");
    packChart = new PackChart("#pack-chart-1", country, "Número de municípios");
    boxPlot = new BoxPlot("#boxplot-1", expensesCSVData, "Como os municípios gastam");
    //ackChart("#boxplot-1", country, "Número de municípios");
    let spentTime = performance.now() - startTime;
    console.log(spentTime + " ms");
});///expenses promisses all

});

function getXYArray(objc, xKeys)
{
    let ret = [];
    for(x of xKeys)
    {
        ret.push({x: x, y:objc[x]})
    }
    return ret;
}


function setValueDescendants(parentElem, getValue)
{
    if(parentElem.children) for (const child of parentElem.children) {
        setValueDescendants(child, getValue);
    }
    parentElem.value = getValue(parentElem);
}

function resetValueParents(parentElem, resetAttr)
{
    if(parentElem.children) for (const child of parentElem.children) {
        resetValueParents(child, resetAttr);
        resetAttr(parentElem);
    }
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