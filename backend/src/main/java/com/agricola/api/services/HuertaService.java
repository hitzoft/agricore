package com.agricola.api.services;

import com.agricola.api.entities.Huerta;
import com.agricola.api.repositories.HuertaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class HuertaService {
    @Autowired
    private HuertaRepository repository;

    public List<Huerta> findAll() {
        return repository.findAll();
    }

    public Huerta save(Huerta entity) {
        return repository.save(entity);
    }

    public Huerta findById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(String id) {
        repository.findById(id).ifPresent(e -> {
            e.setActivo(false);
            repository.save(e);
        });
    }
}
