package com.agricola.api.services;

import com.agricola.api.entities.Gasto;
import com.agricola.api.repositories.GastoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GastoService {
    @Autowired
    private GastoRepository repository;

    public List<Gasto> findAll() {
        return repository.findAll();
    }

    public Gasto save(Gasto entity) {
        return repository.save(entity);
    }

    public Gasto findById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(String id) {
        repository.findById(id).ifPresent(e -> {
            e.setActivo(false);
            repository.save(e);
        });
    }
}
