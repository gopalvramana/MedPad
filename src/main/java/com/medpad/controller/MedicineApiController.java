package com.medpad.controller;

import com.medpad.entity.Medicine;
import com.medpad.repository.MedicineRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineApiController {

    private final MedicineRepository medicineRepository;

    public MedicineApiController(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> searchMedicines(@RequestParam("q") String query) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        List<Medicine> results = medicineRepository.searchByName(query.trim());
        return ResponseEntity.ok(results);
    }

    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {
        List<Medicine> medicines = medicineRepository.findAllByOrderByNameAsc();
        return ResponseEntity.ok(medicines);
    }

    @PostMapping
    public ResponseEntity<Medicine> addMedicine(@RequestBody Medicine medicine) {
        if (medicine.getName() == null || medicine.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        medicine.setId(null);
        medicine.setName(medicine.getName().trim());
        if (medicine.getCategory() != null) {
            medicine.setCategory(medicine.getCategory().trim());
        }
        Medicine saved = medicineRepository.save(medicine);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(@PathVariable Long id) {
        if (!medicineRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        medicineRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
