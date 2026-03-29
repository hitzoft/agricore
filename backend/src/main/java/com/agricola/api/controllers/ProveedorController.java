package com.agricola.api.controllers;

import com.agricola.api.entities.Proveedor;
import com.agricola.api.services.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@CrossOrigin(origins = "*")
public class ProveedorController {
    @Autowired
    private ProveedorService service;

    @GetMapping
    public List<Proveedor> getAll() {
        return service.findAll();
    }

    @PostMapping
    public Proveedor create(@RequestBody Proveedor entity) {
        return service.save(entity);
    }

    @GetMapping("/{id}")
    public Proveedor getById(@PathVariable String id) {
        return service.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
