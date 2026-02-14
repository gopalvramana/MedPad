package com.medpad.repository;

import com.medpad.entity.Diagnosis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagnosisRepository extends JpaRepository<Diagnosis, Long> {

    @Query("SELECT d FROM Diagnosis d WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY d.name")
    List<Diagnosis> searchByName(@Param("query") String query);

    List<Diagnosis> findAllByOrderByNameAsc();
}
