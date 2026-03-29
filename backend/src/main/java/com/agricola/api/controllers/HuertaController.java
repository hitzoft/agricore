package com.agricola.api.controllers;

import com.agricola.api.entities.Huerta;
import com.agricola.api.services.HuertaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/huertas")
@CrossOrigin(origins = "*")
public class HuertaController {
    @Autowired
    private HuertaService service;

    @GetMapping
    public List<Huerta> getAll() {
        return service.findAll();
    }

    @PostMapping
    public Huerta create(@RequestBody Huerta entity) {
        return service.save(entity);
    }

    @GetMapping("/{id}")
    public Huerta getById(@PathVariable String id) {
        return service.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
