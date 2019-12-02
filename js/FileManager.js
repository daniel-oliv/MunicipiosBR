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
            if(dataRow[key])
                content += dataRow[key] + ",";
            else
            content += "" + ",";
        }
        content += dataRow[lastKey] + "\r\n"
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

