FileManager = function(){
}

FileManager.saveFile = function(name, type, content)
{ console.log("saveFile");
    console.log("name", name);
    console.log("type", type);
    console.log("content", content);
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/' + type + ';charset=utf-8,' + encodeURI(content);
    hiddenElement.target = '_blank';
    hiddenElement.download = name + "." + type;
    hiddenElement.click();
    ///without set the name
    // const rows = [
    //     ["name1", "city1", "some other info"],
    //     ["name2", "city2", "more info"]
    // ];
    // let csvContent = "";
    // rows.forEach(function(rowArray) {
    //     let row = rowArray.join(",");
    //     csvContent += row + "\r\n";
    // });
    // let csvContent = "data:text/csv;charset=utf-8,";
    // rows.forEach(function(rowArray) {
    //     let row = rowArray.join(",");
    //     csvContent += row + "\r\n";
    // });
    // var encodedUri = encodeURI(csvContent);
    // window.open(encodedUri);
}

FileManager.saveCSV = function(nameFile, csvMapObj)
{
    FileManager.saveFile(nameFile, "csv", FileManager.getStrCSVToSave(csvMapObj));
}

FileManager.getStrCSVToSave = function(csvMapObj)
{
    let keys = d3.keys(csvMapObj[0]);
    let lastKey = keys[keys.length-1];
    let firstKeys = keys.slice(0,keys.length-1)
    let content = keys.join(",")+"\r\n";
    for (const dataRow of csvMapObj) {
        for (const key of firstKeys) {
            if(dataRow[key]) content += dataRow[key];
            //else {console.log("key [" + key + "] not found for row: ", dataRow);}
            content += ",";
        }
        if(dataRow[lastKey]) content += dataRow[lastKey];
        //else{console.log("key [" + lastKey + "] not found for row: ", dataRow);}
        content+= "\r\n";
    }
    return content;
}

FileManager.appendColumn = function(sourceData, destinyData, keysToAdd, matchFunction)
{
    let countMatch = 0;
    console.log("FileManager.appendColumn sourceData", sourceData);
    console.log("FileManager.appendColumn destinyData", destinyData);
    console.log("FileManager.appendColumn keys", keysToAdd);
    for (const newData of sourceData) {
        for (const data of destinyData) {
            /// just two equal signs, since the data may have been parsed to number with d[key]=+d[key]
            if(matchFunction(newData, data))
            {
                //console.log("Data matched.");
                for (const key of keysToAdd) {
                    data[key] = newData[key];
                }
                /// for every data matched
                countMatch++;
                //!and go next since the current data was already found
                break;
            }
        }
    }
    console.log("FileManager: appendColumn - countMatch ", countMatch);
}

FileManager.appendFiles = function(paths, fileName)
{
    let allData = [];

    let promisses = [];

    for (const path of paths) {
        promisses.push(d3.csv(path));
    }    

    Promise.all(promisses).then(function(separateData){
        console.log("FileManager.appendFiles - data", separateData);
        for (const table of separateData) {
            for (const row of table) {
                allData.push(row);
            }
        }
        FileManager.saveCSV(fileName, allData);
        
    }).catch(error=>{
        console.log("FileManager.appendFiles - Erro ao ler os arquivos: ", error);
    });
}




////////////// funções personalizadas para os dados
FileManager.getRevenueData = function(regionsJSON)
{
    let paths = [] ;
    for (const region of regionsJSON) {
        paths.push("data/Receitas"+region.nome+'.csv');
    }
    console.log("mountRevenueFile.mountRevenueFileNames paths", paths);
    FileManager.appendFiles(paths, "Receitas");

}

////////////// funções personalizadas para os dados
FileManager.appendRevenueData = function()
{

    let expAndIDHMNameFile = "data/ExpensesAndIDHMs.csv";
    let revenuesNameFile = "data/Receitas.csv";
    let outputName = "ExpensesRevenuesAndIDHM";
    let _keys = ["Receita Total","Receitas Correntes","IPTU","ITBI","ISS","Transferências Correntes","Transferências da União","FPM","ITR","SUS Fundo a Fundo - União","FNAS","FNDE","Transferências dos Estados"] ;
    //let keys = ["Receita Total","Receitas Correntes","IPTU","ITBI","ISS","Transferências Correntes","Transferências da União","FPM","Transferências dos Estados"] ;
    //let keys = ["Receita Total","Receitas Correntes","IPTU","ITBI","ISS"] ;

    let promisses = [];
    promisses.push(d3.csv(revenuesNameFile));   
    promisses.push(d3.csv(expAndIDHMNameFile)); 

    Promise.all(promisses).then(function([revenuesData, expensesAndIDHMData]){
        console.log("FileManager.appendFiles - revenuesData", revenuesData);
        FileManager.appendColumn(revenuesData, expensesAndIDHMData, 
                                    _keys, (a,b)=>{return a.id==b.id;} );
        FileManager.saveCSV(outputName, expensesAndIDHMData);
        
    }).catch(error=>{
        console.log("FileManager.appendFiles - Erro ao ler os arquivos: ", error);
    });

    
}