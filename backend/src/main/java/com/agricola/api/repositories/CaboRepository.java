package com.agricola.api.repositories;

import com.agricola.api.entities.Cabo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaboRepository extends JpaRepository<Cabo, String> {
    List<Cabo> findByActivoTrue();
}
