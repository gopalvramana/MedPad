package com.medpad.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "PRESCRIPTION_MEDICINES")
public class PrescriptionMedicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    @JsonIgnore
    private Prescription prescription;

    @Column(nullable = false)
    private String medicineName;

    @Column(nullable = false)
    private String morningDosage;

    @Column(nullable = false)
    private String noonDosage;

    @Column(nullable = false)
    private String nightDosage;

    @Column(nullable = false)
    private int sortOrder;

    public PrescriptionMedicine() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Prescription getPrescription() { return prescription; }
    public void setPrescription(Prescription prescription) { this.prescription = prescription; }
    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }
    public String getMorningDosage() { return morningDosage; }
    public void setMorningDosage(String morningDosage) { this.morningDosage = morningDosage; }
    public String getNoonDosage() { return noonDosage; }
    public void setNoonDosage(String noonDosage) { this.noonDosage = noonDosage; }
    public String getNightDosage() { return nightDosage; }
    public void setNightDosage(String nightDosage) { this.nightDosage = nightDosage; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
