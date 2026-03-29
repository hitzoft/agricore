package com.agricola.api.repositories;

import com.agricola.api.entities.DiaAsistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiaAsistenciaRepository extends JpaRepository<DiaAsistencia, String> {
}
