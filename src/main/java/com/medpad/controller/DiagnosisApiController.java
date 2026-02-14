package com.medpad.controller;

import com.medpad.entity.Diagnosis;
import com.medpad.repository.DiagnosisRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnoses")
public class DiagnosisApiController {

    private final DiagnosisRepository diagnosisRepository;

    public DiagnosisApiController(DiagnosisRepository diagnosisRepository) {
        this.diagnosisRepository = diagnosisRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<List<Diagnosis>> searchDiagnoses(@RequestParam("q") String query) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(diagnosisRepository.searchByName(query.trim()));
    }

    @GetMapping
    public ResponseEntity<List<Diagnosis>> getAllDiagnoses() {
        return ResponseEntity.ok(diagnosisRepository.findAllByOrderByNameAsc());
    }

    @PostMapping
    public ResponseEntity<Diagnosis> addDiagnosis(@RequestBody Diagnosis diagnosis) {
        if (diagnosis.getName() == null || diagnosis.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        diagnosis.setId(null);
        diagnosis.setName(diagnosis.getName().trim());
        if (diagnosis.getCategory() != null) {
            diagnosis.setCategory(diagnosis.getCategory().trim());
        }
        return ResponseEntity.ok(diagnosisRepository.save(diagnosis));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiagnosis(@PathVariable Long id) {
        if (!diagnosisRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        diagnosisRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
