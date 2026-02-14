# MedPad - Prescription Writing Application

A simple, lightweight prescription writing application for doctors. Built with Spring Boot and Thymeleaf — runs locally in the browser with no internet required.

## Features

- **Medicine Autocomplete** — Type 2+ letters to search medicines from the database
- **Dosage Specification** — Set Morning / Noon / Night dosage as Full (1), Half (½), or None (--) for each medicine
- **Symptoms & Sub-Symptoms** — Record symptoms with selectable sub-symptoms (e.g., Fever → High Grade, Intermittent)
- **Diagnosis** — Add diagnoses from the database with autocomplete
- **Add/Remove Medicines** — Manage the medicine database (add new medicines, remove existing ones)
- **Manage Symptoms** — Add/remove symptoms and their sub-symptoms from a dedicated management page
- **Manage Diagnoses** — Add/remove diagnoses with categories from a dedicated management page
- **Instructions** — Add free-text notes and instructions to the prescription
- **Print-Ready** — Clean A4 prescription layout with symptoms, diagnosis, medicine table, and signature footer
- **Persistent Storage** — H2 file-based database; all data survives restarts
- **Standalone Installer** — Package as `.dmg` (macOS) or `.msi` (Windows) with embedded JRE — no Java needed on target machine

## Tech Stack

- **Backend:** Spring Boot 3.4.3, Java 17, Spring Data JPA
- **Frontend:** Thymeleaf, vanilla JavaScript, CSS
- **Database:** H2 (file-based)
- **Build:** Maven

## Quick Start

### Prerequisites (for development)

- JDK 17 or higher (any vendor — Oracle, Microsoft, Temurin, Corretto, etc.)
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
2. Type a symptom name in the search box — select from autocomplete; sub-symptoms appear as checkboxes (uncheck irrelevant ones)
3. Type a diagnosis name — select from autocomplete
4. Type a medicine name — select from autocomplete
5. Adjust **dosage** for Morning / Noon / Night using the dropdowns
6. Add more medicines as needed; remove any with the × button
7. Type any **instructions** (e.g., "Take after food")
8. Click **Print Prescription** — a clean A4 layout with symptoms, diagnosis, medicines, and instructions

### Management Pages

Click the links at the bottom of the prescription page:

- **Manage Medicines** — Add/remove medicines (name + category), search/filter
- **Manage Symptoms** — Add/remove symptoms; add/remove sub-symptoms under each symptom
- **Manage Diagnoses** — Add/remove diagnoses (name + category), search/filter

## Build Standalone Installer

Package the app as a native installer with an embedded JRE (no Java installation needed on the target machine).

### macOS (.dmg)

```bash
mvn clean package -DskipTests
./package.sh
```

Output: `target/installer/MedPad-1.0.0.dmg`

### Windows (.msi)

On a Windows machine with JDK 17+ and [WiX Toolset](https://wixtoolset.org/) installed:

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
│   │   │   ├── Medicine.java           # Medicine entity
│   │   │   ├── Symptom.java            # Symptom entity
│   │   │   ├── SubSymptom.java         # Sub-symptom entity (FK to Symptom)
│   │   │   └── Diagnosis.java          # Diagnosis entity
│   │   ├── repository/
│   │   │   ├── MedicineRepository.java
│   │   │   ├── SymptomRepository.java
│   │   │   ├── SubSymptomRepository.java
│   │   │   └── DiagnosisRepository.java
│   │   └── controller/
│   │       ├── PrescriptionController.java   # Page routes
│   │       ├── MedicineApiController.java    # REST API for medicines
│   │       ├── SymptomApiController.java     # REST API for symptoms + sub-symptoms
│   │       └── DiagnosisApiController.java   # REST API for diagnoses
│   └── resources/
│       ├── application.properties      # DB config, doctor details
│       ├── data.sql                    # Seed data (medicines, symptoms, diagnoses)
│       ├── templates/
│       │   ├── prescription.html       # Prescription form + print layout
│       │   ├── medicines.html          # Medicine management page
│       │   ├── symptoms.html           # Symptom + sub-symptom management
│       │   └── diagnosis.html          # Diagnosis management page
│       └── static/
│           ├── css/
│           │   ├── prescription.css    # Screen + print styles
│           │   └── medicines.css       # Management page styles
│           └── js/
│               ├── prescription.js     # Autocomplete, symptoms, diagnosis, print
│               ├── medicines.js        # Medicine CRUD
│               ├── symptoms.js         # Symptom + sub-symptom CRUD
│               └── diagnosis.js        # Diagnosis CRUD
└── src/test/
    └── java/com/medpad/
        └── MedPadApplicationTests.java
```

## H2 Database Console

Access the H2 database console at **http://localhost:8080/h2-console**

- JDBC URL: `jdbc:h2:file:./data/medpad_db`
- Username: `sa`
- Password: *(empty)*

## Seed Data

The application ships with pre-loaded seed data (inserted only on first run):

- **60 medicines** across categories (Antibiotic, NSAID, Antidiabetic, etc.)
- **15 symptoms** with **~35 sub-symptoms** (e.g., Fever → High Grade, Low Grade, Intermittent, With Chills)
- **20 diagnoses** across categories (Infectious, Respiratory, Gastrointestinal, etc.)

You can add, modify, or remove any of these from the management pages.
