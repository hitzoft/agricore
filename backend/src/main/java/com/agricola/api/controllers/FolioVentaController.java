package com.agricola.api.controllers;

import com.agricola.api.entities.FolioVenta;
import com.agricola.api.entities.Abono;
import com.agricola.api.services.FolioVentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class FolioVentaController {
    @Autowired
    private FolioVentaService service;

    @GetMapping
    public List<FolioVenta> getAll() {
        return service.findAll();
    }

    @PostMapping
    public FolioVenta create(@RequestBody FolioVenta entity) {
        return service.save(entity);
    }

    @GetMapping("/{id}")
    public FolioVenta getById(@PathVariable String id) {
        return service.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @PostMapping("/{id}/abonos")
    public Abono addAbono(@PathVariable String id, @RequestBody Abono abono) {
        return service.addAbono(id, abono);
    }
}
