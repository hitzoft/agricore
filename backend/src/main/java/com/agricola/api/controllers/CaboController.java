package com.agricola.api.controllers;

import com.agricola.api.entities.Cabo;
import com.agricola.api.services.CaboService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cabos")
@CrossOrigin(origins = "*")
public class CaboController {
    @Autowired
    private CaboService service;

    @GetMapping
    public List<Cabo> getAll() {
        return service.findAll();
    }

    @PostMapping
    public Cabo create(@RequestBody Cabo entity) {
        return service.save(entity);
    }

    @GetMapping("/{id}")
    public Cabo getById(@PathVariable String id) {
        return service.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
