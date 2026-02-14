package com.medpad.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "SUB_SYMPTOMS")
public class SubSymptom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "symptom_id", nullable = false)
    @JsonIgnore
    private Symptom symptom;

    public SubSymptom() {}

    public SubSymptom(Long id, String name, Symptom symptom) {
        this.id = id;
        this.name = name;
        this.symptom = symptom;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Symptom getSymptom() { return symptom; }
    public void setSymptom(Symptom symptom) { this.symptom = symptom; }
}
