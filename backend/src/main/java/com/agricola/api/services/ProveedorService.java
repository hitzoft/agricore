package com.agricola.api.services;

import com.agricola.api.entities.Proveedor;
import com.agricola.api.repositories.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProveedorService {
    @Autowired
    private ProveedorRepository repository;

    public List<Proveedor> findAll() {
        return repository.findAll();
    }

    public Proveedor save(Proveedor entity) {
        return repository.save(entity);
    }

    public Proveedor findById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(String id) {
        repository.findById(id).ifPresent(e -> {
            e.setActivo(false);
            repository.save(e);
        });
    }
}
