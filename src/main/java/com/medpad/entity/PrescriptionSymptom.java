package com.medpad.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "PRESCRIPTION_SYMPTOMS")
public class PrescriptionSymptom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    @JsonIgnore
    private Prescription prescription;

    @Column(nullable = false)
    private String symptomName;

    @Column
    private String subSymptoms; // comma-separated

    public PrescriptionSymptom() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Prescription getPrescription() { return prescription; }
    public void setPrescription(Prescription prescription) { this.prescription = prescription; }
    public String getSymptomName() { return symptomName; }
    public void setSymptomName(String symptomName) { this.symptomName = symptomName; }
    public String getSubSymptoms() { return subSymptoms; }
    public void setSubSymptoms(String subSymptoms) { this.subSymptoms = subSymptoms; }
}
