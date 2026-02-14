package com.medpad.repository;

import com.medpad.entity.SubSymptom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubSymptomRepository extends JpaRepository<SubSymptom, Long> {

    List<SubSymptom> findBySymptomIdOrderByNameAsc(Long symptomId);

    @Query("SELECT ss FROM SubSymptom ss WHERE LOWER(ss.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY ss.name")
    List<SubSymptom> searchByName(@Param("query") String query);
}
