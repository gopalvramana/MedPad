package com.medpad.repository;

import com.medpad.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientIdOrderByPrescriptionDateDescCreatedAtDesc(Long patientId);

    long countByPatientId(Long patientId);

    // Bulk delete children first (FK order), then prescriptions
    @Modifying
    @Query("DELETE FROM PrescriptionMedicine pm WHERE pm.prescription.id IN " +
           "(SELECT p.id FROM Prescription p WHERE p.prescriptionDate < :cutoffDate)")
    int deleteMedicinesOlderThan(@Param("cutoffDate") LocalDate cutoffDate);

    @Modifying
    @Query("DELETE FROM PrescriptionSymptom ps WHERE ps.prescription.id IN " +
           "(SELECT p.id FROM Prescription p WHERE p.prescriptionDate < :cutoffDate)")
    int deleteSymptomsOlderThan(@Param("cutoffDate") LocalDate cutoffDate);

    @Modifying
    @Query("DELETE FROM PrescriptionDiagnosis pd WHERE pd.prescription.id IN " +
           "(SELECT p.id FROM Prescription p WHERE p.prescriptionDate < :cutoffDate)")
    int deleteDiagnosesOlderThan(@Param("cutoffDate") LocalDate cutoffDate);

    @Modifying
    @Query("DELETE FROM Prescription p WHERE p.prescriptionDate < :cutoffDate")
    int deletePrescriptionsOlderThan(@Param("cutoffDate") LocalDate cutoffDate);
}
