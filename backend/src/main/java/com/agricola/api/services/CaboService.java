package com.agricola.api.services;

import com.agricola.api.entities.Cabo;
import com.agricola.api.repositories.CaboRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CaboService {
    @Autowired
    private CaboRepository repository;

    public List<Cabo> findAll() {
        return repository.findAll();
    }

    public Cabo save(Cabo entity) {
        return repository.save(entity);
    }

    public Cabo findById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(String id) {
        repository.findById(id).ifPresent(e -> {
            e.setActivo(false);
            repository.save(e);
        });
    }
}
