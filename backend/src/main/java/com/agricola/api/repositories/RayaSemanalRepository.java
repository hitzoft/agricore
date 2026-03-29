package com.agricola.api.repositories;

import com.agricola.api.entities.RayaSemanal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RayaSemanalRepository extends JpaRepository<RayaSemanal, String> {
    List<RayaSemanal> findBySemana(String semana);
    List<RayaSemanal> findByActivoTrue();
}
