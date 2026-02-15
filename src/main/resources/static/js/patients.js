var allPatients = [];

document.addEventListener('DOMContentLoaded', function () {
    loadPatients();
});

function loadPatients() {
    fetch('/api/patients')
        .then(function (r) { return r.json(); })
        .then(function (patients) {
            allPatients = patients;
            renderPatients(patients);
        });
}

function renderPatients(patients) {
    var tbody = document.getElementById('patientListBody');
    tbody.innerHTML = '';

    var noResults = document.getElementById('noResultsMsg');
    var countSpan = document.getElementById('patientCount');
    countSpan.textContent = patients.length + ' patient(s)';

    if (patients.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    noResults.style.display = 'none';

    patients.forEach(function (p, index) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td style="text-align:center;">' + (index + 1) + '</td>' +
            '<td>' + escapeHtml(p.name) + '</td>' +
            '<td style="text-align:center;">' + p.age + '</td>' +
            '<td style="text-align:center;">' + escapeHtml(p.gender) + '</td>' +
            '<td>' + (p.phone ? escapeHtml(p.phone) : '-') + '</td>' +
            '<td style="text-align:center;">' +
                '<button class="remove-btn" onclick="viewHistory(' + p.id + ')" title="View prescription history" style="background:#8e44ad;font-size:14px;padding:4px 8px;margin-right:4px;">&#128196;</button>' +
                '<button class="remove-btn" onclick="editPatient(' + p.id + ')" title="Edit patient" style="background:#3498db;font-size:14px;padding:4px 8px;margin-right:4px;">&#9998;</button>' +
                '<button class="remove-btn" onclick="deletePatient(' + p.id + ', \'' + escapeHtml(p.name).replace(/'/g, "\\'") + '\')" title="Remove patient">&times;</button>' +
            '</td>';
        tbody.appendChild(tr);
    });
}

function viewHistory(patientId) {
    window.location.href = '/prescription-history?patientId=' + patientId;
}

function addPatient() {
    var name = document.getElementById('patName').value.trim();
    var age = document.getElementById('patAge').value;
    var gender = document.getElementById('patGender').value;
    var phone = document.getElementById('patPhone').value.trim();
    var address = document.getElementById('patAddress').value.trim();
    var msg = document.getElementById('addMsg');

    if (!name) {
        msg.textContent = 'Patient name is required.';
        msg.className = 'msg error';
        return;
    }
    if (!age || parseInt(age) <= 0) {
        msg.textContent = 'Please enter a valid age.';
        msg.className = 'msg error';
        return;
    }
    if (!gender) {
        msg.textContent = 'Please select a gender.';
        msg.className = 'msg error';
        return;
    }

    fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            age: parseInt(age),
            gender: gender,
            phone: phone || null,
            address: address || null
        })
    })
    .then(function (r) {
        if (!r.ok) throw new Error('Failed to add patient');
        return r.json();
    })
    .then(function (saved) {
        msg.textContent = 'Patient "' + saved.name + '" added successfully.';
        msg.className = 'msg success';
        document.getElementById('patName').value = '';
        document.getElementById('patAge').value = '';
        document.getElementById('patGender').value = '';
        document.getElementById('patPhone').value = '';
        document.getElementById('patAddress').value = '';
        loadPatients();
    })
    .catch(function (err) {
        msg.textContent = 'Error: ' + err.message;
        msg.className = 'msg error';
    });
}

function deletePatient(id, name) {
    if (!confirm('Delete patient "' + name + '"?')) return;

    fetch('/api/patients/' + id, { method: 'DELETE' })
        .then(function (r) {
            if (r.status === 409) {
                return r.json().then(function (body) {
                    throw new Error(body.error || 'Cannot delete patient with existing prescriptions.');
                });
            }
            if (!r.ok) throw new Error('Failed to delete');
            loadPatients();
        })
        .catch(function (err) {
            alert('Error: ' + err.message);
        });
}

function editPatient(id) {
    var patient = allPatients.find(function (p) { return p.id === id; });
    if (!patient) return;

    document.getElementById('editSection').style.display = 'block';
    document.getElementById('editId').value = patient.id;
    document.getElementById('editName').value = patient.name;
    document.getElementById('editAge').value = patient.age;
    document.getElementById('editGender').value = patient.gender;
    document.getElementById('editPhone').value = patient.phone || '';
    document.getElementById('editAddress').value = patient.address || '';
    document.getElementById('editMsg').textContent = '';

    document.getElementById('editSection').scrollIntoView({ behavior: 'smooth' });
}

function saveEdit() {
    var id = document.getElementById('editId').value;
    var name = document.getElementById('editName').value.trim();
    var age = document.getElementById('editAge').value;
    var gender = document.getElementById('editGender').value;
    var phone = document.getElementById('editPhone').value.trim();
    var address = document.getElementById('editAddress').value.trim();
    var msg = document.getElementById('editMsg');

    if (!name) {
        msg.textContent = 'Patient name is required.';
        msg.className = 'msg error';
        return;
    }
    if (!age || parseInt(age) <= 0) {
        msg.textContent = 'Please enter a valid age.';
        msg.className = 'msg error';
        return;
    }

    fetch('/api/patients/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: name,
            age: parseInt(age),
            gender: gender,
            phone: phone || null,
            address: address || null
        })
    })
    .then(function (r) {
        if (!r.ok) throw new Error('Failed to update');
        return r.json();
    })
    .then(function () {
        document.getElementById('editSection').style.display = 'none';
        loadPatients();
    })
    .catch(function (err) {
        msg.textContent = 'Error: ' + err.message;
        msg.className = 'msg error';
    });
}

function cancelEdit() {
    document.getElementById('editSection').style.display = 'none';
}

function filterPatients() {
    var query = document.getElementById('filterInput').value.toLowerCase();
    var filtered = allPatients.filter(function (p) {
        return p.name.toLowerCase().includes(query) ||
               (p.phone && p.phone.toLowerCase().includes(query));
    });
    renderPatients(filtered);
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
