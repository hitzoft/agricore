package com.agricola.api.controllers;

import com.agricola.api.entities.Gasto;
import com.agricola.api.services.GastoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/gastos")
@CrossOrigin(origins = "*")
public class GastoController {
    @Autowired
    private GastoService service;

    @GetMapping
    public List<Gasto> getAll() {
        return service.findAll();
    }

    @PostMapping
    public Gasto create(@RequestBody Gasto entity) {
        return service.save(entity);
    }

    @GetMapping("/{id}")
    public Gasto getById(@PathVariable String id) {
        return service.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
