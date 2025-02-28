const spreadsheet = document.getElementById("spreadsheet");
const formulaInput = document.getElementById("formula-input");
let selectedCell = null;
let data = {};
const numRows = 20;
const numCols = 10;

function createSpreadsheet() {
  let headerRow = spreadsheet.querySelector("thead tr");
  for (let i = 0; i < numCols; i++) {
    headerRow.appendChild(document.createElement("th"));
    headerRow.lastChild.textContent = String.fromCharCode(65 + i);
  }

  let tbody = spreadsheet.querySelector("tbody");
  for (let i = 0; i < numRows; i++) {
    let row = document.createElement("tr");
    let rowHeader = document.createElement("th");
    rowHeader.textContent = i + 1;
    row.appendChild(rowHeader);
    for (let j = 0; j < numCols; j++) {
      let cell = document.createElement("td");
      let cellInput = document.createElement("input");
      cellInput.classList.add("cell-input");
      cell.appendChild(cellInput);
      cell.dataset.cellId = String.fromCharCode(65 + j) + (i + 1);
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }

  spreadsheet.addEventListener("click", handleCellClick);
  formulaInput.addEventListener("change", handleFormulaChange);
  let cellInputs = document.querySelectorAll(".cell-input");
  cellInputs.forEach((input) => {
    input.addEventListener("change", handleInputChange);
  });
}

function handleCellClick(event) {
  if (
    event.target.tagName === "TD" ||
    event.target.classList.contains("cell-input")
  ) {
    let cell;
    if (event.target.classList.contains("cell-input")) {
      cell = event.target.parentElement;
    } else {
      cell = event.target;
    }
    if (selectedCell) {
      selectedCell.classList.remove("selected");
    }
    selectedCell = cell;
    selectedCell.classList.add("selected");
    formulaInput.value = data[selectedCell.dataset.cellId]
      ? data[selectedCell.dataset.cellId].value
      : "";
  }
}

function handleFormulaChange() {
  if (selectedCell) {
    updateCell(selectedCell.dataset.cellId, formulaInput.value);
  }
}

function handleInputChange(event) {
  let cellId = event.target.parentElement.dataset.cellId;
  updateCell(cellId, event.target.value);
}

function updateCell(cellId, value) {
  data[cellId] = { value: value };
  if (value.startsWith("=")) {
    let result = evaluateFormula(value.substring(1), cellId);
    data[cellId].value = result;
    selectedCell.querySelector(".cell-input").value = result;
  } else {
    selectedCell.querySelector(".cell-input").value = value;
  }
  updateDependencies(cellId);
}

function updateDependencies(changedCellId) {
  let cells = document.querySelectorAll("td");
  cells.forEach((cell) => {
    if (
      cell.dataset.cellId !== changedCellId &&
      data[cell.dataset.cellId] &&
      data[cell.dataset.cellId].value.startsWith("=")
    ) {
      let formula = data[cell.dataset.cellId].value.substring(1);
      let result = evaluateFormula(formula, cell.dataset.cellId);
      data[cell.dataset.cellId].value = result;
      cell.querySelector(".cell-input").value = result;
    }
  });
}

function evaluateFormula(formula, cellId) {
  try {
    formula = formula.toUpperCase();
    let cellRefRegex = /([A-Z]+)(\d+)/g;
    formula = formula.replace(cellRefRegex, (match, colLabel, rowNum) => {
      let refCellId = colLabel + rowNum;
      if (refCellId === cellId) {
        return "0";
      }
      if (data[refCellId] && data[refCellId].value) {
        return data[refCellId].value;
      } else {
        return "0";
      }
    });

    function sumRange(rangeStr) {
      let [start, end] = rangeStr.split(":");
      let startCol = start.charCodeAt(0) - 65;
      let startRow = parseInt(start.substring(1)) - 1;
      let endCol = end.charCodeAt(0) - 65;
      let endRow = parseInt(end.substring(1)) - 1;
      let sum = 0;
      for (let i = startRow; i <= endRow; i++) {
        for (let j = startCol; j <= endCol; j++) {
          let cellId = String.fromCharCode(65 + j) + (i + 1);
          if (
            data[cellId] &&
            data[cellId].value &&
            !isNaN(parseFloat(data[cellId].value))
          ) {
            sum += parseFloat(data[cellId].value);
          }
        }
      }
      return sum;
    }

    function avgRange(rangeStr) {
      let [start, end] = rangeStr.split(":");
      let startCol = start.charCodeAt(0) - 65;
      let startRow = parseInt(start.substring(1)) - 1;
      let endCol = end.charCodeAt(0) - 65;
      let endRow = parseInt(end.substring(1)) - 1;
      let sum = 0;
      let count = 0;
      for (let i = startRow; i <= endRow; i++) {
        for (let j = startCol; j <= endCol; j++) {
          let cellId = String.fromCharCode(65 + j) + (i + 1);
          if (
            data[cellId] &&
            data[cellId].value &&
            !isNaN(parseFloat(data[cellId].value))
          ) {
            sum += parseFloat(data[cellId].value);
            count++;
          }
        }
      }
      return count > 0 ? sum / count : 0;
    }
    //Implement MAX, MIN, COUNT in a similar fashion

    formula = formula.replace(/SUM\(([^)]+)\)/g, (match, range) =>
      sumRange(range)
    );
    formula = formula.replace(/AVERAGE\(([^)]+)\)/g, (match, range) =>
      avgRange(range)
    );

    return eval(formula);
  } catch (error) {
    return "Error";
  }
}

createSpreadsheet();

function evaluateFormula(formula, cellId) {
  try {
      formula = formula.toUpperCase();
      let cellRefRegex = /([A-Z]+)(\d+)/g;
      formula = formula.replace(cellRefRegex, (match, colLabel, rowNum) => {
          let refCellId = colLabel + rowNum;
          if (refCellId === cellId) {
              return "0";
          }
          if (data[refCellId] && data[refCellId].value) {
              return data[refCellId].value;
          } else {
              return "0";
          }
      });

      // ... (Existing SUM, AVERAGE, etc. functions) ...

      function upper(cellRef) {
          if (data[cellRef] && data[cellRef].value) {
              return data[cellRef].value.toString().toUpperCase();
          }
          return "";
      }

      function lower(cellRef) {
          if (data[cellRef] && data[cellRef].value) {
              return data[cellRef].value.toString().toLowerCase();
          }
          return "";
      }

      function trim(cellRef) {
          if (data[cellRef] && data[cellRef].value) {
              return data[cellRef].value.toString().trim();
          }
          return "";
      }
      function findAndReplace(rangeStr, findStr, replaceStr) {
          const [startCell, endCell] = rangeStr.split(':');
          const startCol = startCell.charCodeAt(0) - 65;
          const startRow = parseInt(startCell.substring(1)) - 1;
          const endCol = endCell.charCodeAt(0) - 65;
          const endRow = parseInt(endCell.substring(1)) - 1;

          for (let row = startRow; row <= endRow; row++) {
              for (let col = startCol; col <= endCol; col++) {
                  const cellId = String.fromCharCode(65 + col) + (row + 1);
                  if (data[cellId] && data[cellId].value) {
                      data[cellId].value = data[cellId].value.toString().replaceAll(findStr, replaceStr);
                      let cellElement = document.querySelector(`[data-cell-id="${cellId}"] .cell-input`);
                      if (cellElement) {
                          cellElement.value = data[cellId].value;
                      }
                  }
              }
          }
          return `Find and Replace completed in range ${rangeStr}`;
      }

      function removeDuplicates(rangeStr) {
          const [startCell, endCell] = rangeStr.split(':');
          const startCol = startCell.charCodeAt(0) - 65;
          const startRow = parseInt(startCell.substring(1)) - 1;
          const endCol = endCell.charCodeAt(0) - 65;
          const endRow = parseInt(endCell.substring(1)) - 1;

          const rows = [];
          const seen = new Set();

          for (let row = startRow; row <= endRow; row++) {
              let rowData = "";
              for (let col = startCol; col <= endCol; col++) {
                  const cellId = String.fromCharCode(65 + col) + (row + 1);
                  if (data[cellId] && data[cellId].value) {
                      rowData += data[cellId].value + ",";
                  } else {
                      rowData += ",";
                  }
              }
              rows.push({ row: row, data: rowData });
          }
          const uniqueRows = rows.filter(row => {
              if (seen.has(row.data)) {
                  return false;
              }
              seen.add(row.data);
              return true;
          });

          // Clear the original range
          for (let row = startRow; row <= endRow; row++) {
              for (let col = startCol; col <= endCol; col++) {
                  const cellId = String.fromCharCode(65 + col) + (row + 1);
                  delete data[cellId];
                  let cellElement = document.querySelector(`[data-cell-id="${cellId}"] .cell-input`);
                  if (cellElement) {
                      cellElement.value = "";
                  }
              }
          }
          // Populate with unique rows
          uniqueRows.forEach((uniqueRow, index) => {
              const rowData = uniqueRow.data.split(",");
              for (let col = startCol; col <= endCol; col++) {
                  const cellId = String.fromCharCode(65 + col) + (startRow + index + 1);
                  if (rowData[col]) {
                      data[cellId] = {value: rowData[col]};
                      let cellElement = document.querySelector(`[data-cell-id="${cellId}"] .cell-input`);
                      if(cellElement){
                        cellElement.value = rowData[col];
                      }

                  }
              }
          });

          return `Removed Duplicates in range ${rangeStr}`;
      }

      formula = formula.replace(/SUM\(([^)]+)\)/g, (match, range) => sumRange(range));
      formula = formula.replace(/AVERAGE\(([^)]+)\)/g, (match, range) => avgRange(range));
      formula = formula.replace(/UPPER\(([^)]+)\)/g, (match, cellRef) => upper(cellRef));
      formula = formula.replace(/LOWER\(([^)]+)\)/g, (match, cellRef) => lower(cellRef));
      formula = formula.replace(/TRIM\(([^)]+)\)/g, (match, cellRef) => trim(cellRef));
      formula = formula.replace(/FIND_AND_REPLACE\(([^)]+),([^,]+),([^)]+)\)/g, (match, range, findStr, replaceStr) => findAndReplace(range, findStr.trim().replace(/^"|"$/g, ''), replaceStr.trim().replace(/^"|"$/g, '')));
      formula = formula.replace(/REMOVE_DUPLICATES\(([^)]+)\)/g, (match, range) => removeDuplicates(range));
      return eval(formula);
  } catch (error) {
      return "Error";
  }
}