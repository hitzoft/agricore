package com.agricola.api.services;

import com.agricola.api.entities.RayaSemanal;
import com.agricola.api.entities.DiaAsistencia;
import com.agricola.api.repositories.RayaSemanalRepository;
import com.agricola.api.repositories.DiaAsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RayaSemanalService {
    @Autowired
    private RayaSemanalRepository repository;
    @Autowired
    private DiaAsistenciaRepository diaAsistenciaRepository;

    public List<RayaSemanal> findAll() {
        return repository.findAll();
    }

    public RayaSemanal save(RayaSemanal entity) {
        if (entity.getAsistencias() != null) {
            entity.getAsistencias().forEach(a -> a.setRayaSemanal(entity));
        }
        return repository.save(entity);
    }

    public RayaSemanal findById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(String id) {
        repository.findById(id).ifPresent(e -> {
            e.setActivo(false);
            repository.save(e);
        });
    }

    public List<RayaSemanal> findBySemana(String semana) {
        return repository.findBySemana(semana);
    }
}
