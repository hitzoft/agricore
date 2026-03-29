package com.agricola.api.controllers;

import com.agricola.api.entities.Empleado;
import com.agricola.api.services.EmpleadoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/empleados")
@CrossOrigin(origins = "*")
public class EmpleadoController {
    @Autowired
    private EmpleadoService service;

    @GetMapping
    public List<Empleado> getAll() {
        return service.findAll();
    }

    @PostMapping
    public Empleado create(@RequestBody Empleado entity) {
        return service.save(entity);
    }

    @GetMapping("/{id}")
    public Empleado getById(@PathVariable String id) {
        return service.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
