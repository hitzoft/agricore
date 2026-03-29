package com.agricola.api.controllers;

import com.agricola.api.entities.RayaSemanal;
import com.agricola.api.services.RayaSemanalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rayas")
@CrossOrigin(origins = "*")
public class RayaSemanalController {
    @Autowired
    private RayaSemanalService service;

    @GetMapping
    public List<RayaSemanal> getAll() {
        return service.findAll();
    }

    @PostMapping
    public RayaSemanal create(@RequestBody RayaSemanal entity) {
        return service.save(entity);
    }

    @GetMapping("/{id}")
    public RayaSemanal getById(@PathVariable String id) {
        return service.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @GetMapping("/semana/{semana}")
    public List<RayaSemanal> getBySemana(@PathVariable String semana) {
        return service.findBySemana(semana);
    }
}
