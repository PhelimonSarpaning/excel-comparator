function compareFiles() {
    const fileInput1 = document.getElementById('excel-file1');
    const fileInput2 = document.getElementById('excel-file2');
    const file1 = fileInput1.files[0];
    const file2 = fileInput2.files[0];
    const columnNamesInput = document.getElementById('column-names');
    const columnNames = columnNamesInput.value.split(',').map(name => name.trim());

    const matchColumnNamesInput = document.getElementById('match-column-names');
    const matchColumnNames = matchColumnNamesInput.value.split(',').map(name => name.trim());
  
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
  
        const matchingRows = compareData(jsonData1, jsonData2, columnNames);
  
        const matchingColumns = getMatchingColumns(jsonData2[0], matchingRows[0], columnNames);
        const updatedWorksheet2 = addColumnsToWorksheet(worksheet2, matchingColumns);
  
        const updatedWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(updatedWorkbook, updatedWorksheet2, 'Updated Sheet');
        const excelData = XLSX.write(updatedWorkbook, { bookType: 'xlsx', type: 'array' });
  
        const blob = new Blob([excelData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'updated_file.xlsx';
        link.click();
      };
  
      reader2.readAsArrayBuffer(file2);
    };
  
    reader1.readAsArrayBuffer(file1);
  }
  
  function compareData(data1, data2, columnNames) {
    const matchingRows = [];
  
    for (const rowFile1 of data1) {
      const matchingRow = data2.find(rowFile2 =>
        rowFile1[columnNames[0]] === rowFile2[columnNames[0]] &&
        rowFile1[columnNames[1]] === rowFile2[columnNames[1]] &&
        rowFile1[columnNames[2]] === rowFile2[columnNames[2]]
      );
  
      if (matchingRow) {
        console.log(rowFile1);
        matchingRows.push(rowFile1);
      }
    }
  
    return matchingRows;
  }
  
  function getMatchingColumns(columns1, matchingRow, columnNames) {
    const matchingColumns = {};
  
    for (const columnName of columnNames) {
      matchingColumns[columnName] = matchingRow[columnName];
    }
  
    const updatedColumns = { ...columns1, ...matchingColumns };
    return updatedColumns;
  }
  
  function addColumnsToWorksheet(worksheet, columns) {
    const updatedWorksheet = { ...worksheet };
  
    for (const column in columns) {
      updatedWorksheet[column] = { v: columns[column] };
    }
  
    return updatedWorksheet;
  }
  