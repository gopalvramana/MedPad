package com.medpad.controller;

import com.medpad.entity.Patient;
import com.medpad.repository.PatientRepository;
import com.medpad.repository.PrescriptionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
public class PatientApiController {

    private final PatientRepository patientRepository;
    private final PrescriptionRepository prescriptionRepository;

    public PatientApiController(PatientRepository patientRepository,
                                PrescriptionRepository prescriptionRepository) {
        this.patientRepository = patientRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<List<Patient>> searchPatients(@RequestParam("q") String query) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(patientRepository.searchByName(query.trim()));
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientRepository.findAllByOrderByNameAsc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatient(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Patient> addPatient(@RequestBody Patient patient) {
        if (patient.getName() == null || patient.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (patient.getAge() == null || patient.getAge() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        if (patient.getGender() == null || patient.getGender().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        patient.setId(null);
        patient.setName(patient.getName().trim());
        patient.setGender(patient.getGender().trim());
        if (patient.getPhone() != null) {
            patient.setPhone(patient.getPhone().trim());
        }
        if (patient.getAddress() != null) {
            patient.setAddress(patient.getAddress().trim());
        }
        return ResponseEntity.ok(patientRepository.save(patient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patient) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (patient.getName() == null || patient.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        if (patient.getAge() == null || patient.getAge() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        if (patient.getGender() == null || patient.getGender().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        patient.setId(id);
        patient.setName(patient.getName().trim());
        patient.setGender(patient.getGender().trim());
        if (patient.getPhone() != null) {
            patient.setPhone(patient.getPhone().trim());
        }
        if (patient.getAddress() != null) {
            patient.setAddress(patient.getAddress().trim());
        }
        return ResponseEntity.ok(patientRepository.save(patient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        if (!patientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        long rxCount = prescriptionRepository.countByPatientId(id);
        if (rxCount > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Cannot delete patient with " + rxCount + " existing prescription(s). Delete or purge prescriptions first."));
        }
        patientRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
