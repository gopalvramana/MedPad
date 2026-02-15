package com.medpad.controller;

import com.medpad.dto.PrescriptionRequest;
import com.medpad.entity.*;
import com.medpad.repository.PatientRepository;
import com.medpad.repository.PrescriptionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionApiController {

    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;

    public PrescriptionApiController(PrescriptionRepository prescriptionRepository,
                                     PatientRepository patientRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository = patientRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Prescription> savePrescription(@RequestBody PrescriptionRequest req) {
        if (req.getPatientId() == null) {
            return ResponseEntity.badRequest().build();
        }
        var patientOpt = patientRepository.findById(req.getPatientId());
        if (patientOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Prescription rx = new Prescription();
        rx.setPatient(patientOpt.get());
        rx.setPrescriptionDate(
                req.getPrescriptionDate() != null
                        ? LocalDate.parse(req.getPrescriptionDate())
                        : LocalDate.now()
        );
        rx.setInstructions(req.getInstructions());

        // Add medicines
        if (req.getMedicines() != null) {
            for (PrescriptionRequest.MedicineItem mi : req.getMedicines()) {
                PrescriptionMedicine pm = new PrescriptionMedicine();
                pm.setPrescription(rx);
                pm.setMedicineName(mi.getMedicineName());
                pm.setMorningDosage(mi.getMorningDosage());
                pm.setNoonDosage(mi.getNoonDosage());
                pm.setNightDosage(mi.getNightDosage());
                pm.setSortOrder(mi.getSortOrder());
                rx.getMedicines().add(pm);
            }
        }

        // Add symptoms
        if (req.getSymptoms() != null) {
            for (PrescriptionRequest.SymptomItem si : req.getSymptoms()) {
                PrescriptionSymptom ps = new PrescriptionSymptom();
                ps.setPrescription(rx);
                ps.setSymptomName(si.getSymptomName());
                ps.setSubSymptoms(si.getSubSymptoms());
                rx.getSymptoms().add(ps);
            }
        }

        // Add diagnoses
        if (req.getDiagnoses() != null) {
            for (PrescriptionRequest.DiagnosisItem di : req.getDiagnoses()) {
                PrescriptionDiagnosis pd = new PrescriptionDiagnosis();
                pd.setPrescription(rx);
                pd.setDiagnosisName(di.getDiagnosisName());
                rx.getDiagnoses().add(pd);
            }
        }

        Prescription saved = prescriptionRepository.save(rx);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getByPatient(@PathVariable Long patientId) {
        if (!patientRepository.existsById(patientId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(
                prescriptionRepository.findByPatientIdOrderByPrescriptionDateDescCreatedAtDesc(patientId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getById(@PathVariable Long id) {
        return prescriptionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deletePrescription(@PathVariable Long id) {
        if (!prescriptionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        prescriptionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/purge")
    @Transactional
    public ResponseEntity<Map<String, Integer>> purgeOldPrescriptions(
            @RequestParam("olderThanMonths") int months) {
        if (months < 1) {
            return ResponseEntity.badRequest().build();
        }
        LocalDate cutoff = LocalDate.now().minusMonths(months);

        // Delete children first (FK order)
        prescriptionRepository.deleteMedicinesOlderThan(cutoff);
        prescriptionRepository.deleteSymptomsOlderThan(cutoff);
        prescriptionRepository.deleteDiagnosesOlderThan(cutoff);
        int count = prescriptionRepository.deletePrescriptionsOlderThan(cutoff);

        return ResponseEntity.ok(Map.of("deleted", count));
    }
}
