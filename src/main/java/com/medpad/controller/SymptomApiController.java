package com.medpad.controller;

import com.medpad.entity.SubSymptom;
import com.medpad.entity.Symptom;
import com.medpad.repository.SubSymptomRepository;
import com.medpad.repository.SymptomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/symptoms")
public class SymptomApiController {

    private final SymptomRepository symptomRepository;
    private final SubSymptomRepository subSymptomRepository;

    public SymptomApiController(SymptomRepository symptomRepository, SubSymptomRepository subSymptomRepository) {
        this.symptomRepository = symptomRepository;
        this.subSymptomRepository = subSymptomRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<List<Symptom>> searchSymptoms(@RequestParam("q") String query) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(symptomRepository.searchByName(query.trim()));
    }

    @GetMapping
    public ResponseEntity<List<Symptom>> getAllSymptoms() {
        return ResponseEntity.ok(symptomRepository.findAllByOrderByNameAsc());
    }

    @PostMapping
    public ResponseEntity<Symptom> addSymptom(@RequestBody Symptom symptom) {
        if (symptom.getName() == null || symptom.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        symptom.setId(null);
        symptom.setName(symptom.getName().trim());
        return ResponseEntity.ok(symptomRepository.save(symptom));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSymptom(@PathVariable Long id) {
        if (!symptomRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // Delete sub-symptoms first
        List<SubSymptom> subs = subSymptomRepository.findBySymptomIdOrderByNameAsc(id);
        subSymptomRepository.deleteAll(subs);
        symptomRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    // ─── Sub-Symptoms ────────────────────────────────────

    @GetMapping("/{symptomId}/subsymptoms")
    public ResponseEntity<List<SubSymptom>> getSubSymptoms(@PathVariable Long symptomId) {
        if (!symptomRepository.existsById(symptomId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(subSymptomRepository.findBySymptomIdOrderByNameAsc(symptomId));
    }

    @PostMapping("/{symptomId}/subsymptoms")
    public ResponseEntity<SubSymptom> addSubSymptom(@PathVariable Long symptomId, @RequestBody SubSymptom subSymptom) {
        var symptomOpt = symptomRepository.findById(symptomId);
        if (symptomOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (subSymptom.getName() == null || subSymptom.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        subSymptom.setId(null);
        subSymptom.setName(subSymptom.getName().trim());
        subSymptom.setSymptom(symptomOpt.get());
        return ResponseEntity.ok(subSymptomRepository.save(subSymptom));
    }

    @DeleteMapping("/{symptomId}/subsymptoms/{subId}")
    public ResponseEntity<Void> deleteSubSymptom(@PathVariable Long symptomId, @PathVariable Long subId) {
        if (!subSymptomRepository.existsById(subId)) {
            return ResponseEntity.notFound().build();
        }
        subSymptomRepository.deleteById(subId);
        return ResponseEntity.ok().build();
    }
}
