document.addEventListener('DOMContentLoaded', function () {

    // Set today's date
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('prescriptionDate').textContent =
        today.toLocaleDateString('en-IN', options);

    // Focus on patient name field
    document.getElementById('patientName').focus();

    // Autocomplete setup
    const medicineInput = document.getElementById('medicineInput');
    const dropdown = document.getElementById('autocompleteDropdown');
    let debounceTimer;

    medicineInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        const query = this.value.trim();

        if (query.length < 2) {
            dropdown.style.display = 'none';
            dropdown.innerHTML = '';
            return;
        }

        debounceTimer = setTimeout(function () {
            fetch('/api/medicines/search?q=' + encodeURIComponent(query))
                .then(function (response) { return response.json(); })
                .then(function (medicines) {
                    dropdown.innerHTML = '';
                    if (medicines.length === 0) {
                        dropdown.style.display = 'none';
                        return;
                    }
                    medicines.forEach(function (med) {
                        var item = document.createElement('div');
                        item.className = 'autocomplete-item';
                        item.textContent = med.name;
                        if (med.category) {
                            var cat = document.createElement('span');
                            cat.className = 'autocomplete-category';
                            cat.textContent = ' (' + med.category + ')';
                            item.appendChild(cat);
                        }
                        item.addEventListener('click', function () {
                            addMedicineRow(med.name);
                            medicineInput.value = '';
                            dropdown.style.display = 'none';
                            dropdown.innerHTML = '';
                            medicineInput.focus();
                        });
                        dropdown.appendChild(item);
                    });
                    dropdown.style.display = 'block';
                })
                .catch(function (err) {
                    console.error('Autocomplete error:', err);
                });
        }, 300);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.autocomplete-wrapper')) {
            dropdown.style.display = 'none';
        }
    });

    // Allow Enter key to select first item in dropdown
    medicineInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            var firstItem = dropdown.querySelector('.autocomplete-item');
            if (firstItem) {
                firstItem.click();
            }
        }
    });
});

// Row counter
var rowCounter = 0;

function addMedicineRow(medicineName) {
    // Prevent duplicate medicines
    var existingRows = document.querySelectorAll('#medicineTableBody tr');
    for (var i = 0; i < existingRows.length; i++) {
        if (existingRows[i].cells[1].textContent === medicineName) {
            alert('This medicine is already added.');
            return;
        }
    }

    rowCounter++;
    var tbody = document.getElementById('medicineTableBody');
    var tr = document.createElement('tr');

    tr.innerHTML =
        '<td>' + rowCounter + '</td>' +
        '<td>' + medicineName + '</td>' +
        '<td>' +
            '<select class="dosage-select no-print" onchange="updateDosageDisplay(this)">' +
                '<option value="0">--</option>' +
                '<option value="1" selected>1</option>' +
                '<option value="0.5">&frac12;</option>' +
            '</select>' +
            '<span class="dosage-display print-only">1</span>' +
        '</td>' +
        '<td>' +
            '<select class="dosage-select no-print" onchange="updateDosageDisplay(this)">' +
                '<option value="0" selected>--</option>' +
                '<option value="1">1</option>' +
                '<option value="0.5">&frac12;</option>' +
            '</select>' +
            '<span class="dosage-display print-only">0</span>' +
        '</td>' +
        '<td>' +
            '<select class="dosage-select no-print" onchange="updateDosageDisplay(this)">' +
                '<option value="0">--</option>' +
                '<option value="1" selected>1</option>' +
                '<option value="0.5">&frac12;</option>' +
            '</select>' +
            '<span class="dosage-display print-only">1</span>' +
        '</td>' +
        '<td class="no-print">' +
            '<button class="remove-btn" onclick="removeRow(this)" title="Remove medicine">&times;</button>' +
        '</td>';

    tbody.appendChild(tr);
    updateNoMedicinesMsg();
}

function updateDosageDisplay(selectElement) {
    var span = selectElement.nextElementSibling;
    var val = selectElement.value;
    if (val === '0') {
        span.textContent = '0';
    } else if (val === '0.5') {
        span.textContent = '\u00BD';
    } else {
        span.textContent = '1';
    }
}

function removeRow(button) {
    var row = button.closest('tr');
    row.remove();
    renumberRows();
    updateNoMedicinesMsg();
}

function renumberRows() {
    var rows = document.querySelectorAll('#medicineTableBody tr');
    rows.forEach(function (row, index) {
        row.cells[0].textContent = index + 1;
    });
    rowCounter = rows.length;
}

function updateNoMedicinesMsg() {
    var rows = document.querySelectorAll('#medicineTableBody tr');
    var msg = document.getElementById('noMedicinesMsg');
    var table = document.getElementById('medicineTable');
    if (rows.length === 0) {
        msg.style.display = 'block';
        table.style.display = 'none';
    } else {
        msg.style.display = 'none';
        table.style.display = 'table';
    }
}

function printPrescription() {
    // Validate: at least patient name and one medicine
    var patientName = document.getElementById('patientName').value.trim();
    if (!patientName) {
        alert('Please enter the patient name before printing.');
        document.getElementById('patientName').focus();
        return;
    }

    var rows = document.querySelectorAll('#medicineTableBody tr');
    if (rows.length === 0) {
        alert('Please add at least one medicine before printing.');
        return;
    }

    // Copy instructions text to the print-only div
    var textarea = document.getElementById('instructions');
    var printDiv = document.getElementById('instructionsPrint');
    printDiv.textContent = textarea.value;

    // Update all dosage display spans to match current select values
    document.querySelectorAll('.dosage-select').forEach(function (select) {
        updateDosageDisplay(select);
    });

    window.print();
}
