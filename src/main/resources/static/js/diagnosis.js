var allDiagnoses = [];

document.addEventListener('DOMContentLoaded', function () {
    loadDiagnoses();

    document.getElementById('diagName').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addDiagnosis();
    });
    document.getElementById('diagCategory').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addDiagnosis();
    });
});

function loadDiagnoses() {
    fetch('/api/diagnoses')
        .then(function (r) { return r.json(); })
        .then(function (diagnoses) {
            allDiagnoses = diagnoses;
            renderDiagnoses(diagnoses);
        });
}

function renderDiagnoses(diagnoses) {
    var tbody = document.getElementById('diagListBody');
    var noResults = document.getElementById('noResultsMsg');
    var table = document.getElementById('medicineListTable');
    var countSpan = document.getElementById('diagCount');

    countSpan.textContent = diagnoses.length + ' diagnosis(es)';

    if (diagnoses.length === 0) {
        table.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    noResults.style.display = 'none';
    tbody.innerHTML = '';

    diagnoses.forEach(function (d, index) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + (index + 1) + '</td>' +
            '<td>' + escapeHtml(d.name) + '</td>' +
            '<td>' + escapeHtml(d.category || '--') + '</td>' +
            '<td><button class="remove-btn" onclick="deleteDiagnosis(' + d.id + ',\'' + escapeHtml(d.name).replace(/'/g, "\\'") + '\')">&times;</button></td>';
        tbody.appendChild(tr);
    });
}

function addDiagnosis() {
    var nameInput = document.getElementById('diagName');
    var catInput = document.getElementById('diagCategory');
    var msg = document.getElementById('addMsg');
    var name = nameInput.value.trim();
    var category = catInput.value.trim();

    if (!name) {
        msg.textContent = 'Diagnosis name is required.';
        msg.className = 'msg error';
        nameInput.focus();
        return;
    }

    fetch('/api/diagnoses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, category: category || null })
    })
        .then(function (r) {
            if (!r.ok) throw new Error('Failed');
            return r.json();
        })
        .then(function (saved) {
            msg.textContent = '"' + saved.name + '" added!';
            msg.className = 'msg success';
            nameInput.value = '';
            catInput.value = '';
            nameInput.focus();
            loadDiagnoses();
        })
        .catch(function (err) {
            msg.textContent = 'Error: ' + err.message;
            msg.className = 'msg error';
        });
}

function deleteDiagnosis(id, name) {
    if (!confirm('Remove "' + name + '"?')) return;
    fetch('/api/diagnoses/' + id, { method: 'DELETE' })
        .then(function (r) {
            if (!r.ok) throw new Error('Failed');
            loadDiagnoses();
        })
        .catch(function (err) { alert('Error: ' + err.message); });
}

function filterDiagnoses() {
    var query = document.getElementById('filterInput').value.trim().toLowerCase();
    if (!query) {
        renderDiagnoses(allDiagnoses);
        return;
    }
    var filtered = allDiagnoses.filter(function (d) {
        return d.name.toLowerCase().indexOf(query) !== -1 ||
               (d.category && d.category.toLowerCase().indexOf(query) !== -1);
    });
    renderDiagnoses(filtered);
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
