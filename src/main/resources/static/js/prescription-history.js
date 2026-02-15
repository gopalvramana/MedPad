var patientId = null;
var prescriptions = [];

document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    patientId = params.get('patientId');

    if (!patientId) {
        document.getElementById('noRxMsg').textContent = 'No patient specified.';
        document.getElementById('noRxMsg').style.display = 'block';
        return;
    }

    // Load patient info
    fetch('/api/patients/' + patientId)
        .then(function (r) {
            if (!r.ok) throw new Error('Patient not found');
            return r.json();
        })
        .then(function (patient) {
            var banner = document.getElementById('patientBanner');
            document.getElementById('bannerName').textContent = patient.name;
            var details = 'Age: ' + patient.age + ' | ' + patient.gender;
            if (patient.phone) details += ' | Phone: ' + patient.phone;
            document.getElementById('bannerDetails').textContent = details;
            banner.style.display = 'block';
        })
        .catch(function () {});

    loadPrescriptions();
});

function loadPrescriptions() {
    fetch('/api/prescriptions/patient/' + patientId)
        .then(function (r) { return r.json(); })
        .then(function (data) {
            prescriptions = data;
            renderPrescriptions();
        });
}

function renderPrescriptions() {
    var container = document.getElementById('prescriptionList');
    var noMsg = document.getElementById('noRxMsg');
    container.innerHTML = '';

    if (prescriptions.length === 0) {
        noMsg.style.display = 'block';
        return;
    }
    noMsg.style.display = 'none';

    prescriptions.forEach(function (rx) {
        var card = document.createElement('div');
        card.className = 'rx-card';
        card.id = 'rx-card-' + rx.id;

        // Header (always visible)
        var header = document.createElement('div');
        header.className = 'rx-card-header';
        header.onclick = function () { toggleCard(rx.id); };

        var dateStr = formatDate(rx.prescriptionDate);
        var medCount = rx.medicines ? rx.medicines.length : 0;
        var medNames = rx.medicines
            ? rx.medicines.map(function (m) { return m.medicineName; }).join(', ')
            : '';

        header.innerHTML =
            '<div class="rx-card-date">' + escapeHtml(dateStr) + '</div>' +
            '<div class="rx-card-summary">' + medCount + ' medicine(s)' +
                (medNames ? ' — ' + escapeHtml(truncate(medNames, 60)) : '') +
            '</div>' +
            '<div class="rx-card-toggle">&#9660;</div>';
        card.appendChild(header);

        // Detail (hidden by default)
        var detail = document.createElement('div');
        detail.className = 'rx-card-detail';
        detail.id = 'rx-detail-' + rx.id;
        detail.style.display = 'none';

        var detailHtml = '';

        // Symptoms
        if (rx.symptoms && rx.symptoms.length > 0) {
            detailHtml += '<p><strong>Symptoms:</strong> ';
            detailHtml += rx.symptoms.map(function (s) {
                var text = escapeHtml(s.symptomName);
                if (s.subSymptoms) text += ' (' + escapeHtml(s.subSymptoms) + ')';
                return text;
            }).join('; ');
            detailHtml += '</p>';
        }

        // Diagnoses
        if (rx.diagnoses && rx.diagnoses.length > 0) {
            detailHtml += '<p><strong>Diagnosis:</strong> ';
            detailHtml += rx.diagnoses.map(function (d) {
                return escapeHtml(d.diagnosisName);
            }).join('; ');
            detailHtml += '</p>';
        }

        // Medicine table
        if (rx.medicines && rx.medicines.length > 0) {
            detailHtml += '<table class="rx-detail-table">' +
                '<thead><tr><th>#</th><th>Medicine</th><th>Morning</th><th>Noon</th><th>Night</th></tr></thead><tbody>';
            rx.medicines.forEach(function (m, i) {
                detailHtml += '<tr>' +
                    '<td>' + (i + 1) + '</td>' +
                    '<td style="text-align:left;">' + escapeHtml(m.medicineName) + '</td>' +
                    '<td>' + dosageLabel(m.morningDosage) + '</td>' +
                    '<td>' + dosageLabel(m.noonDosage) + '</td>' +
                    '<td>' + dosageLabel(m.nightDosage) + '</td>' +
                    '</tr>';
            });
            detailHtml += '</tbody></table>';
        }

        // Instructions
        if (rx.instructions) {
            detailHtml += '<p class="rx-instructions"><strong>Instructions:</strong> ' +
                escapeHtml(rx.instructions) + '</p>';
        }

        // Action buttons
        detailHtml += '<div class="rx-card-actions">' +
            '<button class="rx-reprint-btn" onclick="reprintPrescription(' + rx.id + ')" title="Reprint">&#128438; Reprint</button>' +
            '<button class="rx-delete-btn" onclick="deletePrescription(' + rx.id + ')" title="Delete">&times; Delete</button>' +
            '</div>';

        detail.innerHTML = detailHtml;
        card.appendChild(detail);

        container.appendChild(card);
    });
}

function toggleCard(rxId) {
    var detail = document.getElementById('rx-detail-' + rxId);
    var card = document.getElementById('rx-card-' + rxId);
    var toggle = card.querySelector('.rx-card-toggle');

    if (detail.style.display === 'none') {
        detail.style.display = 'block';
        toggle.innerHTML = '&#9650;';
    } else {
        detail.style.display = 'none';
        toggle.innerHTML = '&#9660;';
    }
}

function reprintPrescription(rxId) {
    window.open('/prescription?reprintId=' + rxId, '_blank');
}

function deletePrescription(rxId) {
    if (!confirm('Delete this prescription? This cannot be undone.')) return;

    fetch('/api/prescriptions/' + rxId, { method: 'DELETE' })
        .then(function (r) {
            if (!r.ok) throw new Error('Failed to delete');
            loadPrescriptions();
        })
        .catch(function (err) {
            alert('Error: ' + err.message);
        });
}

function purgeOldPrescriptions() {
    var months = document.getElementById('purgeMonths').value;
    var msg = document.getElementById('purgeMsg');

    if (!confirm('Permanently delete ALL prescriptions older than ' + months + ' months? This cannot be undone.')) return;

    fetch('/api/prescriptions/purge?olderThanMonths=' + months, { method: 'DELETE' })
        .then(function (r) {
            if (!r.ok) throw new Error('Purge failed');
            return r.json();
        })
        .then(function (result) {
            msg.textContent = 'Deleted ' + result.deleted + ' prescription(s).';
            msg.className = 'msg success';
            loadPrescriptions();
        })
        .catch(function (err) {
            msg.textContent = 'Error: ' + err.message;
            msg.className = 'msg error';
        });
}

// ── Utilities ──────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function dosageLabel(val) {
    if (val === '0.5') return '\u00BD';
    if (val === '0' || val === '--') return '--';
    return val;
}

function truncate(str, max) {
    if (str.length <= max) return str;
    return str.substring(0, max) + '...';
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}
