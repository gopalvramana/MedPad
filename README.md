# MedPad - Prescription Writing Application

A simple, lightweight prescription writing application for doctors. Built with Spring Boot and Thymeleaf — runs locally in the browser with no internet required.

## Features

- **Medicine Autocomplete** — Type 2+ letters to search medicines from the database
- **Dosage Specification** — Set Morning / Noon / Night dosage as Full (1), Half (1/2), or None (--) for each medicine
- **Add/Remove Medicines** — Manage the medicine database (add new medicines, remove existing ones)
- **Instructions** — Add free-text notes and instructions to the prescription
- **Print-Ready** — Clean A4 prescription layout with doctor header, medicine table, and signature footer
- **Persistent Storage** — H2 file-based database; medicines and changes survive restarts
- **Standalone Installer** — Package as `.dmg` (macOS) or `.msi` (Windows) with embedded JRE — no Java needed on target machine

## Tech Stack

- **Backend:** Spring Boot 3.4.3, Java 21, Spring Data JPA
- **Frontend:** Thymeleaf, vanilla JavaScript, CSS
- **Database:** H2 (file-based)
- **Build:** Maven

## Quick Start

### Prerequisites (for development)

- JDK 21 or higher (any vendor — Oracle, Microsoft, Temurin, Corretto, etc.)
- Maven 3.8+

### Run

```bash
git clone https://github.com/gopalvramana/MedPad.git
cd MedPad
mvn spring-boot:run
```

Open **http://localhost:8080** in your browser.

### Default Doctor Details

Edit `src/main/resources/application.properties` to change:

```properties
doctor.name=Dr. Ramana
doctor.qualifications=MBBS, MD
doctor.clinic-name=MedPad Clinic
doctor.registration-number=MCI-123456
doctor.phone=+91-9876543210
doctor.address=123 Health Street, Medical Colony, Hyderabad
```

## Usage

1. Enter the **patient name**
2. Type a medicine name in the search box — select from the autocomplete dropdown
3. Adjust **dosage** for Morning / Noon / Night using the dropdowns
4. Add more medicines as needed; remove any with the X button
5. Type any **instructions** (e.g., "Take after food")
6. Click **Print Prescription** — a clean A4 layout opens in the browser print dialog

### Manage Medicines

Click **Manage Medicines** at the bottom of the prescription page to:

- Add new medicines (name + category)
- Search/filter the medicine list
- Remove medicines from the database

## Build Standalone Installer

Package the app as a native installer with an embedded JRE (no Java installation needed on the target machine).

### macOS (.dmg)

```bash
mvn clean package -DskipTests
./package.sh
```

Output: `target/installer/MedPad-1.0.0.dmg`

### Windows (.msi)

On a Windows machine with JDK 21+ and [WiX Toolset](https://wixtoolset.org/) installed:

```cmd
mvn clean package -DskipTests
jpackage --type msi --name MedPad --app-version 1.0.0 --vendor MedPad --input target --main-jar medpad-1.0-SNAPSHOT.jar --main-class org.springframework.boot.loader.launch.JarLauncher --dest target\installer --java-options "-Dserver.port=8080" --java-options "-Dspring.datasource.url=jdbc:h2:file:~/medpad_data/medpad_db;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE"
```

Output: `target\installer\MedPad-1.0.0.msi`

## Project Structure

```
MedPad/
├── pom.xml
├── package.sh                          # Installer build script
├── src/main/
│   ├── java/com/medpad/
│   │   ├── MedPadApplication.java      # Entry point
│   │   ├── config/
│   │   │   └── DoctorProperties.java   # Doctor details from properties
│   │   ├── entity/
│   │   │   └── Medicine.java           # JPA entity
│   │   ├── repository/
│   │   │   └── MedicineRepository.java # DB queries
│   │   └── controller/
│   │       ├── PrescriptionController.java  # Serves prescription page
│   │       └── MedicineApiController.java   # REST API for autocomplete & CRUD
│   └── resources/
│       ├── application.properties      # DB config, doctor details
│       ├── data.sql                    # 60 seed medicines
│       ├── templates/
│       │   ├── prescription.html       # Prescription form + print layout
│       │   └── medicines.html          # Medicine management page
│       └── static/
│           ├── css/
│           │   ├── prescription.css    # Screen + print styles
│           │   └── medicines.css       # Management page styles
│           └── js/
│               ├── prescription.js     # Autocomplete, dosage, print logic
│               └── medicines.js        # Add/remove/filter medicines
└── src/test/
    └── java/com/medpad/
        └── MedPadApplicationTests.java
```

## H2 Database Console

Access the H2 database console at **http://localhost:8080/h2-console**

- JDBC URL: `jdbc:h2:file:./data/medpad_db`
- Username: `sa`
- Password: *(empty)*
