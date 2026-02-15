package com.medpad.dto;

import java.util.List;

public class PrescriptionRequest {

    private Long patientId;
    private String prescriptionDate; // yyyy-MM-dd
    private String instructions;
    private List<MedicineItem> medicines;
    private List<SymptomItem> symptoms;
    private List<DiagnosisItem> diagnoses;

    public PrescriptionRequest() {}

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public String getPrescriptionDate() { return prescriptionDate; }
    public void setPrescriptionDate(String prescriptionDate) { this.prescriptionDate = prescriptionDate; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public List<MedicineItem> getMedicines() { return medicines; }
    public void setMedicines(List<MedicineItem> medicines) { this.medicines = medicines; }
    public List<SymptomItem> getSymptoms() { return symptoms; }
    public void setSymptoms(List<SymptomItem> symptoms) { this.symptoms = symptoms; }
    public List<DiagnosisItem> getDiagnoses() { return diagnoses; }
    public void setDiagnoses(List<DiagnosisItem> diagnoses) { this.diagnoses = diagnoses; }

    public static class MedicineItem {
        private String medicineName;
        private String morningDosage;
        private String noonDosage;
        private String nightDosage;
        private int sortOrder;

        public MedicineItem() {}

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

    public static class SymptomItem {
        private String symptomName;
        private String subSymptoms; // comma-separated

        public SymptomItem() {}

        public String getSymptomName() { return symptomName; }
        public void setSymptomName(String symptomName) { this.symptomName = symptomName; }
        public String getSubSymptoms() { return subSymptoms; }
        public void setSubSymptoms(String subSymptoms) { this.subSymptoms = subSymptoms; }
    }

    public static class DiagnosisItem {
        private String diagnosisName;

        public DiagnosisItem() {}

        public String getDiagnosisName() { return diagnosisName; }
        public void setDiagnosisName(String diagnosisName) { this.diagnosisName = diagnosisName; }
    }
}
