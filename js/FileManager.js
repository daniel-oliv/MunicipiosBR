FileManager = function(){
}

FileManager.saveFile = function(name, type, content)
{ 
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
            content += dataRow[key] + ",";
        }
        content += dataRow[lastKey] + "\r\n"
    }
    return content;
}

