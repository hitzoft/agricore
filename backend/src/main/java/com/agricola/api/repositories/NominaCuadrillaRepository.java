package com.agricola.api.repositories;

import com.agricola.api.entities.NominaCuadrilla;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NominaCuadrillaRepository extends JpaRepository<NominaCuadrilla, String> {
    List<NominaCuadrilla> findByActivoTrue();
}
