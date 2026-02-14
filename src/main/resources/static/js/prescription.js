document.addEventListener('DOMContentLoaded', function () {

    // Set today's date
    var today = new Date();
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('prescriptionDate').textContent =
        today.toLocaleDateString('en-IN', options);

    // Focus on patient name field
    document.getElementById('patientName').focus();

    // ─── Medicine Autocomplete ──────────────────────────
    setupAutocomplete({
        inputId: 'medicineInput',
        dropdownId: 'autocompleteDropdown',
        searchUrl: '/api/medicines/search?q=',
        onSelect: function (item) { addMedicineRow(item.name); },
        displayField: 'name',
        categoryField: 'category'
    });

    // ─── Symptom Autocomplete ───────────────────────────
    setupAutocomplete({
        inputId: 'symptomInput',
        dropdownId: 'symptomDropdown',
        searchUrl: '/api/symptoms/search?q=',
        onSelect: function (item) { addSymptomItem(item); },
        displayField: 'name',
        categoryField: null
    });

    // ─── Diagnosis Autocomplete ─────────────────────────
    setupAutocomplete({
        inputId: 'diagnosisInput',
        dropdownId: 'diagnosisDropdown',
        searchUrl: '/api/diagnoses/search?q=',
        onSelect: function (item) { addDiagnosisItem(item); },
        displayField: 'name',
        categoryField: 'category'
    });

    // Close all dropdowns on outside click
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.autocomplete-wrapper')) {
            document.querySelectorAll('.autocomplete-dropdown').forEach(function (dd) {
                dd.style.display = 'none';
            });
        }
    });
});

// ═══════════════════════════════════════════════════════
// Generic Autocomplete
// ═══════════════════════════════════════════════════════

function setupAutocomplete(config) {
    var input = document.getElementById(config.inputId);
    var dropdown = document.getElementById(config.dropdownId);
    var debounceTimer;

    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        var query = this.value.trim();

        if (query.length < 2) {
            dropdown.style.display = 'none';
            dropdown.innerHTML = '';
            return;
        }

        debounceTimer = setTimeout(function () {
            fetch(config.searchUrl + encodeURIComponent(query))
                .then(function (r) { return r.json(); })
                .then(function (items) {
                    dropdown.innerHTML = '';
                    if (items.length === 0) {
                        dropdown.style.display = 'none';
                        return;
                    }
                    items.forEach(function (item) {
                        var div = document.createElement('div');
                        div.className = 'autocomplete-item';
                        div.textContent = item[config.displayField];
                        if (config.categoryField && item[config.categoryField]) {
                            var cat = document.createElement('span');
                            cat.className = 'autocomplete-category';
                            cat.textContent = ' (' + item[config.categoryField] + ')';
                            div.appendChild(cat);
                        }
                        div.addEventListener('click', function () {
                            config.onSelect(item);
                            input.value = '';
                            dropdown.style.display = 'none';
                            dropdown.innerHTML = '';
                            input.focus();
                        });
                        dropdown.appendChild(div);
                    });
                    dropdown.style.display = 'block';
                })
                .catch(function (err) { console.error('Autocomplete error:', err); });
        }, 300);
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            var first = dropdown.querySelector('.autocomplete-item');
            if (first) first.click();
        }
    });
}

// ═══════════════════════════════════════════════════════
// Symptoms
// ═══════════════════════════════════════════════════════

var addedSymptoms = {}; // symptomId -> { name, subSymptoms: [{id, name, checked}] }

function addSymptomItem(symptom) {
    if (addedSymptoms[symptom.id]) {
        alert('This symptom is already added.');
        return;
    }

    // Fetch sub-symptoms
    fetch('/api/symptoms/' + symptom.id + '/subsymptoms')
        .then(function (r) { return r.json(); })
        .then(function (subs) {
            addedSymptoms[symptom.id] = {
                name: symptom.name,
                subSymptoms: subs.map(function (s) { return { id: s.id, name: s.name, checked: true }; })
            };
            renderSymptomsList();
        });
}

function removeSymptomItem(symptomId) {
    delete addedSymptoms[symptomId];
    renderSymptomsList();
}

function toggleSubSymptom(symptomId, subId) {
    var sym = addedSymptoms[symptomId];
    if (!sym) return;
    sym.subSymptoms.forEach(function (s) {
        if (s.id === subId) s.checked = !s.checked;
    });
}

function renderSymptomsList() {
    var container = document.getElementById('symptomsList');
    container.innerHTML = '';

    var ids = Object.keys(addedSymptoms);
    if (ids.length === 0) return;

    ids.forEach(function (symptomId) {
        var sym = addedSymptoms[symptomId];
        var div = document.createElement('div');
        div.className = 'clinical-item';

        var html = '<strong>' + escapeHtml(sym.name) + '</strong> ';

        if (sym.subSymptoms.length > 0) {
            sym.subSymptoms.forEach(function (sub) {
                html += '<label class="sub-checkbox no-print">' +
                    '<input type="checkbox" ' + (sub.checked ? 'checked' : '') +
                    ' onchange="toggleSubSymptom(' + symptomId + ',' + sub.id + ')">' +
                    escapeHtml(sub.name) + '</label> ';
            });
        }

        html += '<button class="clinical-remove-btn no-print" onclick="removeSymptomItem(' + symptomId + ')">&times;</button>';

        div.innerHTML = html;
        container.appendChild(div);
    });
}

// ═══════════════════════════════════════════════════════
// Diagnosis
// ═══════════════════════════════════════════════════════

var addedDiagnoses = {}; // diagId -> { name }

function addDiagnosisItem(diag) {
    if (addedDiagnoses[diag.id]) {
        alert('This diagnosis is already added.');
        return;
    }
    addedDiagnoses[diag.id] = { name: diag.name };
    renderDiagnosisList();
}

function removeDiagnosisItem(diagId) {
    delete addedDiagnoses[diagId];
    renderDiagnosisList();
}

function renderDiagnosisList() {
    var container = document.getElementById('diagnosisList');
    container.innerHTML = '';

    var ids = Object.keys(addedDiagnoses);
    if (ids.length === 0) return;

    ids.forEach(function (diagId) {
        var diag = addedDiagnoses[diagId];
        var div = document.createElement('div');
        div.className = 'clinical-item';
        div.innerHTML = '<strong>' + escapeHtml(diag.name) + '</strong> ' +
            '<button class="clinical-remove-btn no-print" onclick="removeDiagnosisItem(' + diagId + ')">&times;</button>';
        container.appendChild(div);
    });
}

// ═══════════════════════════════════════════════════════
// Medicine Table
// ═══════════════════════════════════════════════════════

var rowCounter = 0;

function addMedicineRow(medicineName) {
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

// ═══════════════════════════════════════════════════════
// Print
// ═══════════════════════════════════════════════════════

function printPrescription() {
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

    // Sync symptoms print section
    var symptomsPrint = document.getElementById('symptomsPrint');
    var symptomTexts = [];
    Object.keys(addedSymptoms).forEach(function (id) {
        var sym = addedSymptoms[id];
        var checkedSubs = sym.subSymptoms.filter(function (s) { return s.checked; });
        var text = sym.name;
        if (checkedSubs.length > 0) {
            text += ' (' + checkedSubs.map(function (s) { return s.name; }).join(', ') + ')';
        }
        symptomTexts.push(text);
    });
    symptomsPrint.innerHTML = symptomTexts.length > 0
        ? '<strong>Symptoms:</strong> ' + escapeHtml(symptomTexts.join('; '))
        : '';

    // Sync diagnosis print section
    var diagnosisPrint = document.getElementById('diagnosisPrint');
    var diagTexts = [];
    Object.keys(addedDiagnoses).forEach(function (id) {
        diagTexts.push(addedDiagnoses[id].name);
    });
    diagnosisPrint.innerHTML = diagTexts.length > 0
        ? '<strong>Diagnosis:</strong> ' + escapeHtml(diagTexts.join('; '))
        : '';

    // Sync instructions
    var textarea = document.getElementById('instructions');
    var printDiv = document.getElementById('instructionsPrint');
    printDiv.textContent = textarea.value;

    // Sync dosage displays
    document.querySelectorAll('.dosage-select').forEach(function (select) {
        updateDosageDisplay(select);
    });

    window.print();
}

// ═══════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
