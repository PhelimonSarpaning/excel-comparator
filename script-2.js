function compareFiles() {
    const fileInput1 = document.getElementById('excel-file1');
    const fileInput2 = document.getElementById('excel-file2');
    const file1 = fileInput1.files[0];
    const file2 = fileInput2.files[0];
    const columnNamesInput = document.getElementById('column-names');
    const columnNames = columnNamesInput.value.split(',').map(name => name.trim().toLowerCase());

    const matchColumnNamesInput = document.getElementById('match-column-names');
    const matchColumnNames = matchColumnNamesInput.value.split(',').map(name => name.trim().toLowerCase());
  
    const reader1 = new FileReader();
    const reader2 = new FileReader();
  
    reader1.onload = function(e) {
      const data1 = new Uint8Array(e.target.result);
      const workbook1 = XLSX.read(data1, { type: 'array' });
  
      reader2.onload = function(e) {
        const data2 = new Uint8Array(e.target.result);
        const workbook2 = XLSX.read(data2, { type: 'array' });
  
        const worksheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
        const jsonData1 = XLSX.utils.sheet_to_json(worksheet1, { header: 1 });
  
        const worksheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
        const jsonData2 = XLSX.utils.sheet_to_json(worksheet2, { header: 1 });

          // Get the column indices based on column names
          // indices from the secons file - the comparing against
        const columnIndices = columnNames.map(name => {
            const index = jsonData2[0].findIndex(column => column.toLowerCase() === name);
            return index !== -1 ? index : null;
        });

        // indices from the first file - the master file
        const columnIndices1 = columnNames.map(name => {
            const index = jsonData1[0].findIndex(column => column.toLowerCase() === name);
            return index !== -1 ? index : null;
        });

        // this is the indices fo the fields from the master file to be used for output
        const outputIndices = matchColumnNames.map(name => {
            const index = jsonData1[0].findIndex(column => column.toLowerCase() === name);
            return index !== -1 ? index : null;
        });
  
        const matchingRows = findMatchingArrays(jsonData1,jsonData2, columnIndices,columnIndices1, outputIndices,matchColumnNames);
  
        exportToExcel(matchingRows, columnNames);
      };
  
      reader2.readAsArrayBuffer(file2);
    };
  
    reader1.readAsArrayBuffer(file1);
  }


  function findMatchingArrays(dataset1, dataset2, columnIndices, columnIndices1, outputIndices, matchColumnNames ) {
    const matchingArrays = [];

    // get column names updated
    for(let i =0; i<matchColumnNames.length; i++){
        dataset2[0].push(matchColumnNames[i]);
    }

    // Create a Map to store the rows from dataset2 based on the key
    const dataset2Values = new Map();
    for (let i = 0; i < dataset2.length; i++) {
      const row2 = dataset2[i];
      const key = columnIndices.map(index => row2[index]).join(',');
  
      if (!dataset2Values.has(key)) {
        dataset2Values.set(key, []);
      }
  
      dataset2Values.get(key).push(row2);
    }
  
// Find the matching arrays in dataset2 for each row in dataset1
for (let i = 0; i < dataset1.length; i++) {
    const row1 = dataset1[i];
    const key = columnIndices1.map(index => row1[index]).join(',');
  
    if (dataset2Values.has(key)) {
      const matchingRows = dataset2Values.get(key);
  
      // Update matchingRows in dataset2 with specific indices from dataset1
      for (let j = 0; j < matchingRows.length; j++) {
        const row2 = matchingRows[j];
        for (let k = 0; k < outputIndices.length; k++) {
          const outputIndex = outputIndices[k];
          row2.push(row1[outputIndex]);
        }
      }
    }
  }
  
  return dataset2;
  }
  
  function exportToExcel(matchingData, columnNames) {
    const workbook = XLSX.utils.book_new();

    // Create a worksheet for matching rows
    const matchingWorksheet = XLSX.utils.aoa_to_sheet(matchingData);
    XLSX.utils.book_append_sheet(workbook, matchingWorksheet, 'Matching Rows');
  
    const excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'matching_rows.xlsx';
    link.click();
  }