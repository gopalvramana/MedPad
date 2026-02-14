package com.medpad.repository;

import com.medpad.entity.Symptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SymptomRepository extends JpaRepository<Symptom, Long> {

    @Query("SELECT s FROM Symptom s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY s.name")
    List<Symptom> searchByName(@Param("query") String query);

    List<Symptom> findAllByOrderByNameAsc();
}
