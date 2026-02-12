var allMedicines = [];

document.addEventListener('DOMContentLoaded', function () {
    loadMedicines();

    // Allow Enter key to submit the add form
    document.getElementById('medName').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addMedicine();
    });
    document.getElementById('medCategory').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addMedicine();
    });
});

function loadMedicines() {
    fetch('/api/medicines')
        .then(function (response) { return response.json(); })
        .then(function (medicines) {
            allMedicines = medicines;
            renderMedicines(medicines);
        })
        .catch(function (err) {
            console.error('Failed to load medicines:', err);
        });
}

function renderMedicines(medicines) {
    var tbody = document.getElementById('medicineListBody');
    var noResults = document.getElementById('noResultsMsg');
    var table = document.getElementById('medicineListTable');
    var countSpan = document.getElementById('medicineCount');

    countSpan.textContent = medicines.length + ' medicine(s)';

    if (medicines.length === 0) {
        table.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    noResults.style.display = 'none';
    tbody.innerHTML = '';

    medicines.forEach(function (med, index) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + (index + 1) + '</td>' +
            '<td>' + escapeHtml(med.name) + '</td>' +
            '<td>' + escapeHtml(med.category || '--') + '</td>' +
            '<td><button class="remove-btn" onclick="deleteMedicine(' + med.id + ', \'' + escapeHtml(med.name).replace(/'/g, "\\'") + '\')">&times;</button></td>';
        tbody.appendChild(tr);
    });
}

function addMedicine() {
    var nameInput = document.getElementById('medName');
    var categoryInput = document.getElementById('medCategory');
    var msg = document.getElementById('addMsg');
    var name = nameInput.value.trim();
    var category = categoryInput.value.trim();

    if (!name) {
        msg.textContent = 'Medicine name is required.';
        msg.className = 'msg error';
        nameInput.focus();
        return;
    }

    fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, category: category || null })
    })
        .then(function (response) {
            if (!response.ok) throw new Error('Failed to add medicine');
            return response.json();
        })
        .then(function (saved) {
            msg.textContent = '"' + saved.name + '" added successfully!';
            msg.className = 'msg success';
            nameInput.value = '';
            categoryInput.value = '';
            nameInput.focus();
            loadMedicines();
        })
        .catch(function (err) {
            msg.textContent = 'Error: ' + err.message;
            msg.className = 'msg error';
        });
}

function deleteMedicine(id, name) {
    if (!confirm('Remove "' + name + '" from the medicine list?')) {
        return;
    }

    fetch('/api/medicines/' + id, { method: 'DELETE' })
        .then(function (response) {
            if (!response.ok) throw new Error('Failed to delete');
            loadMedicines();
        })
        .catch(function (err) {
            alert('Error deleting medicine: ' + err.message);
        });
}

function filterMedicines() {
    var query = document.getElementById('filterInput').value.trim().toLowerCase();
    if (!query) {
        renderMedicines(allMedicines);
        return;
    }
    var filtered = allMedicines.filter(function (med) {
        return med.name.toLowerCase().indexOf(query) !== -1 ||
               (med.category && med.category.toLowerCase().indexOf(query) !== -1);
    });
    renderMedicines(filtered);
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
