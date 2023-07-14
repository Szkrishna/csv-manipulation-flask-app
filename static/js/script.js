let selectedColumn = '';
let selectedSortOrder = '';
let originalData = [];
let displayColumns = [];

function loadTable(file) {
  const table = document.getElementById('dataTable');
  const columnSelectFilter = document.getElementById('columnSelectFilter');
  const columnSelectSort = document.getElementById('columnSelectSort');
  const checkboxContainer = document.getElementById('checkboxContainer');

  const reader = new FileReader();

  reader.onload = function(e) {
    const contents = e.target.result;
    const lines = contents.split('\n');
    const headers = lines[0].split(',');

    // Clear existing table, column select options, and search input
    table.innerHTML = '';
    columnSelectFilter.innerHTML = '';
    columnSelectSort.innerHTML = '';
    checkboxContainer.innerHTML = '';
    document.getElementById('searchInput').value = '';

    // Create table header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    headers.forEach((header, index) => {
      const th = document.createElement('th');
      th.textContent = header.trim();
      th.setAttribute('data-column', index);
      th.addEventListener('click', handleHeaderClick);
      headerRow.appendChild(th);

      // Create column select options for filter, sorting, and display
      const optionFilter = document.createElement('option');
      optionFilter.value = index.toString();
      optionFilter.textContent = header.trim();
      columnSelectFilter.appendChild(optionFilter);

      const optionSort = document.createElement('option');
      optionSort.value = index.toString();
      optionSort.textContent = header.trim();
      columnSelectSort.appendChild(optionSort);

      // Create checkboxes for column display
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = index.toString();
      checkbox.name = 'columns';
      checkbox.textContent = header.trim();
      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(document.createTextNode(header.trim()));
      checkboxContainer.appendChild(document.createElement('br'));
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table data rows
    const tbody = document.createElement('tbody');

    for (let i = 1; i < lines.length; i++) {
      const rowData = lines[i].split(',');
      const row = document.createElement('tr');

      rowData.forEach(data => {
        const cell = document.createElement('td');
        cell.textContent = data.trim();
        row.appendChild(cell);
      });

      tbody.appendChild(row);
    }

    table.appendChild(tbody);

    // Store the original data
    originalData = lines.map(line => line.split(','));
  };

  reader.readAsText(file);
}

document.getElementById('uploadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const file = document.getElementById('csvFileInput').files[0];
  if (file) {
    loadTable(file);
  }
});

function handleHeaderClick(event) {
  const column = event.target.getAttribute('data-column');

  if (column === selectedColumn) {
    selectedSortOrder = selectedSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    selectedColumn = column;
    selectedSortOrder = 'asc';
  }

  applySorting();
}

function applySorting() {
  const columnSelect = document.getElementById('columnSelectSort');
  selectedColumn = columnSelect.value;

  const sortOrderSelect = document.getElementById('sortOrderSelect');
  selectedSortOrder = sortOrderSelect.value;

  if (selectedColumn === '' || selectedSortOrder === '') {
    return;
  }

  sortTable();
}

function sortTable() {
  const table = document.getElementById('dataTable');
  const tbody = table.getElementsByTagName('tbody')[0];
  const rows = Array.from(table.getElementsByTagName('tr'));
  const headerRow = rows.shift();

  rows.sort((a, b) => {
    const cellA = a.cells[selectedColumn] ? a.cells[selectedColumn].textContent.toLowerCase() : '';
    const cellB = b.cells[selectedColumn] ? b.cells[selectedColumn].textContent.toLowerCase() : '';

    if (cellA < cellB) {
      return selectedSortOrder === 'asc' ? -1 : 1;
    } else if (cellA > cellB) {
      return selectedSortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });

  rows.unshift(headerRow);

  table.tBodies[0].innerHTML = '';

  rows.forEach(row => table.tBodies[0].appendChild(row));
}

function applyFilter() {
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  const columnSelectFilter = document.getElementById('columnSelectFilter');
  const selectedColumn = columnSelectFilter.value;

  const table = document.getElementById('dataTable');
  const tbody = table.getElementsByTagName('tbody')[0];
  const rows = Array.from(tbody.getElementsByTagName('tr'));

  rows.forEach(row => {
    const cells = Array.from(row.getElementsByTagName('td'));
    let rowVisible = false;

    if (selectedColumn === '') {
      cells.forEach(cell => {
        const cellValue = cell.textContent.toLowerCase();

        if (cellValue.includes(searchValue)) {
          rowVisible = true;
        }
      });
    } else {
      const cell = cells[selectedColumn];

      if (cell) {
        const cellValue = cell.textContent.toLowerCase();

        if (cellValue.includes(searchValue)) {
          rowVisible = true;
        }
      }
    }

    row.style.display = rowVisible ? '' : 'none';
  });
}

function resetData() {
  const table = document.getElementById('dataTable');
  const tbody = table.getElementsByTagName('tbody')[0];

  document.getElementById('searchInput').value = '';
  document.getElementById('columnSelectFilter').value = '';
  document.getElementById('columnSelectSort').value = '';
  document.getElementById('sortOrderSelect').value = '';

  const rows = Array.from(tbody.getElementsByTagName('tr'));
  rows.forEach(row => row.style.display = '');

  tbody.innerHTML = '';
  originalData.forEach(rowData => {
    const row = document.createElement('tr');
    rowData.forEach(data => {
      const cell = document.createElement('td');
      cell.textContent = data.trim();
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });
}

function applyColumnDisplay() {
  const table = document.getElementById('dataTable');
  const thead = table.getElementsByTagName('thead')[0];
  const tbody = table.getElementsByTagName('tbody')[0];
  const checkboxes = document.querySelectorAll('input[name="columns"]:checked');

  // Clear existing columns
  thead.innerHTML = '';
  tbody.innerHTML = '';

  // Get the selected column indices
  displayColumns = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));

  // Create new header row with selected columns
  const headerRow = document.createElement('tr');
  displayColumns.forEach(columnIndex => {
    const th = document.createElement('th');
    th.textContent = originalData[0][columnIndex] ? originalData[0][columnIndex].trim() : ''; // Check for undefined values
    th.setAttribute('data-column', columnIndex);
    th.addEventListener('click', handleHeaderClick);
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Create table data rows with selected columns
  for (let i = 1; i < originalData.length; i++) {
    const rowData = originalData[i];
    const row = document.createElement('tr');
    displayColumns.forEach(columnIndex => {
      const cell = document.createElement('td');
      cell.textContent = rowData[columnIndex] ? rowData[columnIndex].trim() : ''; // Check for undefined values
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  }
}