package com.agricola.api.repositories;

import com.agricola.api.entities.FolioVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolioVentaRepository extends JpaRepository<FolioVenta, String> {
    List<FolioVenta> findByActivoTrue();
}
