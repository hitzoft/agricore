package com.agricola.api.services;

import com.agricola.api.entities.NominaCuadrilla;
import com.agricola.api.repositories.NominaCuadrillaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NominaCuadrillaService {
    @Autowired
    private NominaCuadrillaRepository repository;

    public List<NominaCuadrilla> findAll() {
        return repository.findAll();
    }

    public NominaCuadrilla save(NominaCuadrilla entity) {
        return repository.save(entity);
    }

    public NominaCuadrilla findById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(String id) {
        repository.findById(id).ifPresent(e -> {
            e.setActivo(false);
            repository.save(e);
        });
    }
}
