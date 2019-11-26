/*
*    main.js
*   
*/
let startTime = performance.now()

let stState = "stState", selectRegion = "stRegion";

let country;
let regionsData;
let statesData;
let hoveredNumMun;
var yearKeys = ["1950","1960","1970","1980","1991","2000","2010"];

var lineNumMunChart;
let packChart;
let boxPlot;

// Time parser for x-scale
var timeParseYear = d3.timeParse("%Y");
var timeFormatYear = d3.timeFormat("%Y");

var formatNum = d3.format(".0f");
let formatMoney = d3.format("$,.0f");

let regionColors = d3.scaleOrdinal(d3.schemeSet1);

var stratifyRegion = d3.stratify()
    .parentId(function(d) { return d.id ? (Math.floor(d.id/10)) : ""; });

var dataPromises = [d3.json("data/estados.json"), d3.json("data/regioes.json"), d3.csv("data/NumDeMunicípios.csv")];
var dataExpensePromises = [];
var expensesCSVKeys = ["id","UF","População 2016","nome","Total da Despesa por Função per capita","Legislativa per capita","Judiciária per capita","Essencial à Justiça per capita","Administração per capita","Defesa Nacional per capita","Segurança Pública per capita","Relações Exteriores per capita","Assistência Social per capita","Previdência Social per capita","Saúde per capita","Trabalho per capita","Educação per capita","Cultura per capita","Direitos da Cidadania per capita","Urbanismo per capita","Habitação per capita","Saneamento per capita","Gestão Ambiental per capita","Ciência e Tecnologia per capita","Agricultura per capita","Organização Agrária per capita","Indústria per capita","Comércio e Serviços per capita","Comunicações per capita","Energia per capita","Transporte per capita","Desporto e Lazer per capita","Encargos Especiais per capita","TOTAL DA DESPESA POR FUNÇÃO (INTRAORÇAMENTÁRIA) per capita","TOTAL GERAL DA DESPESA POR FUNÇÃO per capita"];
var selecBoxKey = "Legislativa per capita";
var expensesCSVNumKeys = ["id","População 2016","Total da Despesa por Função per capita","Legislativa per capita","Judiciária per capita","Essencial à Justiça per capita","Administração per capita","Defesa Nacional per capita","Segurança Pública per capita","Relações Exteriores per capita","Assistência Social per capita","Previdência Social per capita","Saúde per capita","Trabalho per capita","Educação per capita","Cultura per capita","Direitos da Cidadania per capita","Urbanismo per capita","Habitação per capita","Saneamento per capita","Gestão Ambiental per capita","Ciência e Tecnologia per capita","Agricultura per capita","Organização Agrária per capita","Indústria per capita","Comércio e Serviços per capita","Comunicações per capita","Energia per capita","Transporte per capita","Desporto e Lazer per capita","Encargos Especiais per capita","TOTAL DA DESPESA POR FUNÇÃO (INTRAORÇAMENTÁRIA) per capita","TOTAL GERAL DA DESPESA POR FUNÇÃO per capita"];
var attrToSelect = expensesCSVNumKeys.slice(1,expensesCSVNumKeys.length);
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
        local.qtMunClCount = {}
        for (const clKey of qtMunClKeys) {
            local.qtMunClCount[clKey] = 0;    
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
                            local.qtMunClCount[clKey]++
                            break;
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
                region.data.qtMunClCount[clKey] = sumArray(region.children.map(d=>{return d.data.qtMunClCount[clKey];}));    
            }
            region.data["qtMun"][year] = sumArray(region.children.map(d=>{return d.data.qtMun[year];}))
        }
    }
    //! and summing all the years for the country and adding color
    for (const year of yearKeys) {
        //countrydata.qtMun.color = "#ccff99";
        for (const clKey of qtMunClKeys) {
            country.data.qtMunClCount[clKey] = sumArray(country.children.map(d=>{return d.data.qtMunClCount[clKey];}));    
        }
        //console.log("sumArr ", sumArray(country.children.map(d=>{return d.data.qtMun[year];})));
        country.data["qtMun"][year] = sumArray(country.children.map(d=>{return d.data.qtMun[year];}));
    }

    /// i can't reset cause this makes a problem in root node tootip and 
    //resetValueParents(country, (d)=>{d.data.qtMun["2010"]=0});

    country
        .sum(function(d) {return d.qtMun["2010"]; })
        .sort(function(a, b) {//console.log("sort ",(b.data.nome +" " + a.data.nome));console.log("sort ",(b.data.qtMun["2010"] - a.data.qtMun["2010"]));
            return b.data.qtMun["2010"] - a.data.qtMun["2010"]; });
    console.log("country ", country);
    statesData = country.descendants().filter((d)=>{return !d.children});
    regionsData = country.children;
    console.log("regionsData ", regionsData);
    hoveredNumMun = [];
    hoveredNumMun.push(country);

    ///preparing data for boxplot
    getQuantis(citesExpensesData, selecBoxKey);

    lineNumMunChart = new LineChart("#line-chart-1", getXYArray(country.data.qtMun, yearKeys), "Número de municípios");
    packChart = new PackChart("#pack-chart-1", country, "Número de municípios");
    boxPlot = new BoxPlot("#boxplot-1", citesExpensesData, "Como os municípios gastam");
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

function rollUpValidAndUnvalid(_data, isValidFunction)
{
    let validArray = [], unvalidArray = [];

    for (const item of _data) {
        if(isValidFunction(item)) validArray.push(item);
        else unvalidArray.push(item);
    }
    return [validArray, isValidFunction];
}

function getQuantis(_data, attrKey)
{
    /// usar group antes quando puder selecionar por região - e assim extrair métricas sobre cada região e estado e verificar se o critério de junção faz sentido
    /// além de ver municípios onde idhm é alto, ou notas do ideb - esse pode ser com
    /// distribuir por população na box plot e ver onde estão as melhores notas do ideb e etc
    let sortedData = _data.sort((a,b)=>{return a[attrKey] - b[attrKey];});
    let attrArray = sortedData.map(function(c) { return c[attrKey];});
    //console.log(sortedData.concat())
    let q1 = d3.quantile(attrArray,.25);
    let median = d3.quantile(attrArray,.5);
    let q3 = d3.quantile(attrArray,.75);
    //console.log("getQuantis q1 ", q1);console.log("median ", median);console.log("q3 ", q3);

    //!bisectRight will always return the same index - the common index for a non repeated element. for repeated and non repeated element
    //! while bisectLeft will return a different index (i-1), that is, when dividing an array, the future previous group will not include the element
    //! while bisect left will include repeated elements 
    // let bisector = d3.bisector(function(d) { return d[attrKey] }).right;
    // let half1 = bisector(q1);
    // let half2 = bisector(median);
    // let q1Array = bisector(q3);

    // let bisector = d3.bisector(function(d) { return y(d) }).right;
    // console("y max ", y.range[1]);
    // let lineBoxHeight = vis.r*2;
    // let rollUpIa = 0;
    // for (let clUpLim = 0; clUpLim < y.range[1]; clUpLim+=lineBoxHeight) {
    //     let rollUpI  = bisector(vis.data, clUpLim);
    //     let lineData = vis.data.slice(rollUpIa, rollUpI);
    //     rollUpIa = rollUpI;
    //     let step = vis.boxWidth / lineData.length;
    //     let xa = vis.x1Box;
    //     for(d of lineData)
    //     {
    //         d.x = xa + step;
    //         xa = d.x;
    //     }    
    // }
    
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