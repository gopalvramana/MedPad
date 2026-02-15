var selectedPatient = null; // { id, name, age, gender, phone, address }

document.addEventListener('DOMContentLoaded', function () {

    // Set today's date
    var today = new Date();
    var options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('prescriptionDate').textContent =
        today.toLocaleDateString('en-IN', options);

    // Focus on patient input field
    document.getElementById('patientInput').focus();

    // ─── Patient Autocomplete ─────────────────────────
    setupPatientAutocomplete();

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
// Patient Autocomplete
// ═══════════════════════════════════════════════════════

function setupPatientAutocomplete() {
    var input = document.getElementById('patientInput');
    var dropdown = document.getElementById('patientDropdown');
    var debounceTimer;

    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        var query = this.value.trim();

        // If user edits after selecting, clear the selection
        if (selectedPatient && input.value !== selectedPatient.name) {
            clearPatientSelection();
        }

        if (query.length < 2) {
            dropdown.style.display = 'none';
            dropdown.innerHTML = '';
            return;
        }

        debounceTimer = setTimeout(function () {
            fetch('/api/patients/search?q=' + encodeURIComponent(query))
                .then(function (r) { return r.json(); })
                .then(function (patients) {
                    dropdown.innerHTML = '';

                    patients.forEach(function (p) {
                        var div = document.createElement('div');
                        div.className = 'autocomplete-item';
                        div.textContent = p.name;
                        var detail = document.createElement('span');
                        detail.className = 'autocomplete-category';
                        detail.textContent = ' (' + p.age + '/' + p.gender + ')';
                        div.appendChild(detail);
                        div.addEventListener('click', function () {
                            selectPatient(p);
                            dropdown.style.display = 'none';
                            dropdown.innerHTML = '';
                        });
                        dropdown.appendChild(div);
                    });

                    // Add "New Patient" option
                    var addNew = document.createElement('div');
                    addNew.className = 'autocomplete-item autocomplete-add-new';
                    addNew.textContent = '+ Add New Patient';
                    addNew.addEventListener('click', function () {
                        dropdown.style.display = 'none';
                        dropdown.innerHTML = '';
                        showNewPatientForm(input.value.trim());
                    });
                    dropdown.appendChild(addNew);

                    dropdown.style.display = 'block';
                })
                .catch(function (err) { console.error('Patient search error:', err); });
        }, 300);
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            var first = dropdown.querySelector('.autocomplete-item');
            if (first) first.click();
        }
    });
}

function selectPatient(patient) {
    selectedPatient = patient;
    var input = document.getElementById('patientInput');
    input.value = patient.name;

    var details = document.getElementById('patientDetails');
    document.getElementById('patientNameDisplay').textContent = patient.name;
    document.getElementById('patientAgeDisplay').textContent = 'Age: ' + patient.age;
    document.getElementById('patientGenderDisplay').textContent = patient.gender;
    details.style.display = 'block';
}

function clearPatientSelection() {
    selectedPatient = null;
    document.getElementById('patientDetails').style.display = 'none';
}

function showNewPatientForm(prefillName) {
    document.getElementById('newPatientForm').style.display = 'block';
    document.getElementById('npName').value = prefillName || '';
    document.getElementById('npAge').value = '';
    document.getElementById('npGender').value = '';
    document.getElementById('npMsg').textContent = '';
    document.getElementById('npName').focus();
}

function cancelNewPatient() {
    document.getElementById('newPatientForm').style.display = 'none';
}

function saveNewPatient() {
    var name = document.getElementById('npName').value.trim();
    var age = document.getElementById('npAge').value;
    var gender = document.getElementById('npGender').value;
    var msg = document.getElementById('npMsg');

    if (!name) { msg.textContent = 'Name is required.'; msg.className = 'msg error'; return; }
    if (!age || parseInt(age) <= 0) { msg.textContent = 'Valid age is required.'; msg.className = 'msg error'; return; }
    if (!gender) { msg.textContent = 'Gender is required.'; msg.className = 'msg error'; return; }

    fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, age: parseInt(age), gender: gender })
    })
    .then(function (r) {
        if (!r.ok) throw new Error('Failed to add');
        return r.json();
    })
    .then(function (saved) {
        document.getElementById('newPatientForm').style.display = 'none';
        selectPatient(saved);
    })
    .catch(function (err) {
        msg.textContent = 'Error: ' + err.message;
        msg.className = 'msg error';
    });
}

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
    var patientInput = document.getElementById('patientInput');
    if (!selectedPatient) {
        alert('Please select a patient before printing.');
        patientInput.focus();
        return;
    }

    var rows = document.querySelectorAll('#medicineTableBody tr');
    if (rows.length === 0) {
        alert('Please add at least one medicine before printing.');
        return;
    }

    // Sync patient print section
    var patientPrint = document.getElementById('patientPrint');
    patientPrint.innerHTML = '<strong>' + escapeHtml(selectedPatient.name) + '</strong>' +
        ' &nbsp; Age: ' + selectedPatient.age +
        ' &nbsp; ' + escapeHtml(selectedPatient.gender);

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
