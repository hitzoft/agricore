package com.agricola.api.controllers;

import com.agricola.api.entities.NominaCuadrilla;
import com.agricola.api.services.NominaCuadrillaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/nomina-cuadrilla")
@CrossOrigin(origins = "*")
public class NominaCuadrillaController {
    @Autowired
    private NominaCuadrillaService service;

    @GetMapping
    public List<NominaCuadrilla> getAll() {
        return service.findAll();
    }

    @PostMapping
    public NominaCuadrilla create(@RequestBody NominaCuadrilla entity) {
        return service.save(entity);
    }

    @GetMapping("/{id}")
    public NominaCuadrilla getById(@PathVariable String id) {
        return service.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
