var allSymptoms = [];
var symptomSubMap = {}; // symptomId -> [subSymptoms]

document.addEventListener('DOMContentLoaded', function () {
    loadSymptoms();

    document.getElementById('symptomName').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addSymptom();
    });
    document.getElementById('subSymptomName').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addSubSymptom();
    });
});

function loadSymptoms() {
    fetch('/api/symptoms')
        .then(function (r) { return r.json(); })
        .then(function (symptoms) {
            allSymptoms = symptoms;
            populateParentDropdown(symptoms);
            // Load sub-symptoms for each symptom
            var promises = symptoms.map(function (s) {
                return fetch('/api/symptoms/' + s.id + '/subsymptoms')
                    .then(function (r) { return r.json(); })
                    .then(function (subs) {
                        symptomSubMap[s.id] = subs;
                    });
            });
            Promise.all(promises).then(function () {
                renderSymptoms(symptoms);
            });
        });
}

function populateParentDropdown(symptoms) {
    var select = document.getElementById('parentSymptom');
    select.innerHTML = '<option value="">-- Select Symptom --</option>';
    symptoms.forEach(function (s) {
        var opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.name;
        select.appendChild(opt);
    });
}

function renderSymptoms(symptoms) {
    var tbody = document.getElementById('symptomListBody');
    var noResults = document.getElementById('noResultsMsg');
    var table = document.getElementById('medicineListTable');
    var countSpan = document.getElementById('symptomCount');

    countSpan.textContent = symptoms.length + ' symptom(s)';

    if (symptoms.length === 0) {
        table.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    noResults.style.display = 'none';
    tbody.innerHTML = '';

    symptoms.forEach(function (s, index) {
        var subs = symptomSubMap[s.id] || [];
        var subsHtml = subs.map(function (sub) {
            return '<span class="sub-tag">' + escapeHtml(sub.name) +
                ' <button class="sub-remove-btn" onclick="deleteSubSymptom(' + s.id + ',' + sub.id + ',\'' + escapeHtml(sub.name).replace(/'/g, "\\'") + '\')">&times;</button></span>';
        }).join(' ');
        if (!subsHtml) subsHtml = '<span style="color:#999">--</span>';

        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + (index + 1) + '</td>' +
            '<td>' + escapeHtml(s.name) + '</td>' +
            '<td class="sub-symptoms-cell">' + subsHtml + '</td>' +
            '<td><button class="remove-btn" onclick="deleteSymptom(' + s.id + ',\'' + escapeHtml(s.name).replace(/'/g, "\\'") + '\')">&times;</button></td>';
        tbody.appendChild(tr);
    });
}

function addSymptom() {
    var input = document.getElementById('symptomName');
    var msg = document.getElementById('symptomMsg');
    var name = input.value.trim();

    if (!name) {
        msg.textContent = 'Symptom name is required.';
        msg.className = 'msg error';
        input.focus();
        return;
    }

    fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name })
    })
        .then(function (r) {
            if (!r.ok) throw new Error('Failed');
            return r.json();
        })
        .then(function (saved) {
            msg.textContent = '"' + saved.name + '" added!';
            msg.className = 'msg success';
            input.value = '';
            input.focus();
            loadSymptoms();
        })
        .catch(function (err) {
            msg.textContent = 'Error: ' + err.message;
            msg.className = 'msg error';
        });
}

function deleteSymptom(id, name) {
    if (!confirm('Remove "' + name + '" and all its sub-symptoms?')) return;
    fetch('/api/symptoms/' + id, { method: 'DELETE' })
        .then(function (r) {
            if (!r.ok) throw new Error('Failed');
            loadSymptoms();
        })
        .catch(function (err) { alert('Error: ' + err.message); });
}

function addSubSymptom() {
    var select = document.getElementById('parentSymptom');
    var input = document.getElementById('subSymptomName');
    var msg = document.getElementById('subSymptomMsg');
    var symptomId = select.value;
    var name = input.value.trim();

    if (!symptomId) {
        msg.textContent = 'Please select a parent symptom.';
        msg.className = 'msg error';
        select.focus();
        return;
    }
    if (!name) {
        msg.textContent = 'Sub-symptom name is required.';
        msg.className = 'msg error';
        input.focus();
        return;
    }

    fetch('/api/symptoms/' + symptomId + '/subsymptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name })
    })
        .then(function (r) {
            if (!r.ok) throw new Error('Failed');
            return r.json();
        })
        .then(function (saved) {
            msg.textContent = '"' + saved.name + '" added!';
            msg.className = 'msg success';
            input.value = '';
            input.focus();
            loadSymptoms();
        })
        .catch(function (err) {
            msg.textContent = 'Error: ' + err.message;
            msg.className = 'msg error';
        });
}

function deleteSubSymptom(symptomId, subId, name) {
    if (!confirm('Remove sub-symptom "' + name + '"?')) return;
    fetch('/api/symptoms/' + symptomId + '/subsymptoms/' + subId, { method: 'DELETE' })
        .then(function (r) {
            if (!r.ok) throw new Error('Failed');
            loadSymptoms();
        })
        .catch(function (err) { alert('Error: ' + err.message); });
}

function filterSymptoms() {
    var query = document.getElementById('filterInput').value.trim().toLowerCase();
    if (!query) {
        renderSymptoms(allSymptoms);
        return;
    }
    var filtered = allSymptoms.filter(function (s) {
        var subs = symptomSubMap[s.id] || [];
        var subsMatch = subs.some(function (sub) {
            return sub.name.toLowerCase().indexOf(query) !== -1;
        });
        return s.name.toLowerCase().indexOf(query) !== -1 || subsMatch;
    });
    renderSymptoms(filtered);
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
