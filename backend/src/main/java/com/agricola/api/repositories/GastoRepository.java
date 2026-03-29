package com.agricola.api.repositories;

import com.agricola.api.entities.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, String> {
    List<Gasto> findByActivoTrue();
}
