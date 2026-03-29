package com.agricola.api.repositories;

import com.agricola.api.entities.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, String> {
    List<Proveedor> findByActivoTrue();
}
