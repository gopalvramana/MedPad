package com.medpad.controller;

import com.medpad.config.DoctorProperties;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PrescriptionController {

    private final DoctorProperties doctorProperties;

    public PrescriptionController(DoctorProperties doctorProperties) {
        this.doctorProperties = doctorProperties;
    }

    @GetMapping("/")
    public String showHome(Model model) {
        model.addAttribute("doctor", doctorProperties);
        return "home";
    }

    @GetMapping("/prescription")
    public String showPrescriptionForm(Model model) {
        model.addAttribute("doctor", doctorProperties);
        return "prescription";
    }

    @GetMapping("/medicines")
    public String showMedicineManagement() {
        return "medicines";
    }

    @GetMapping("/symptoms")
    public String showSymptomManagement() {
        return "symptoms";
    }

    @GetMapping("/diagnosis")
    public String showDiagnosisManagement() {
        return "diagnosis";
    }

    @GetMapping("/patients")
    public String showPatientManagement() {
        return "patients";
    }

    @GetMapping("/prescription-history")
    public String showPrescriptionHistory() {
        return "prescription-history";
    }
}
