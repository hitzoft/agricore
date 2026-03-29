package com.agricola.api.repositories;

import com.agricola.api.entities.Huerta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HuertaRepository extends JpaRepository<Huerta, String> {
    List<Huerta> findByActivoTrue();
}
