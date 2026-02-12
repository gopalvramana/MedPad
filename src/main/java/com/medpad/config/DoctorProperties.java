package com.medpad.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "doctor")
@Getter
@Setter
public class DoctorProperties {
    private String name;
    private String qualifications;
    private String clinicName;
    private String registrationNumber;
    private String phone;
    private String address;
}
