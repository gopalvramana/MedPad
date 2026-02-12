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
    public String showPrescriptionForm(Model model) {
        model.addAttribute("doctor", doctorProperties);
        return "prescription";
    }

    @GetMapping("/medicines")
    public String showMedicineManagement() {
        return "medicines";
    }
}
