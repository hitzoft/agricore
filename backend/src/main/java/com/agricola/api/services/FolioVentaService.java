package com.agricola.api.services;

import com.agricola.api.entities.FolioVenta;
import com.agricola.api.entities.Abono;
import com.agricola.api.repositories.FolioVentaRepository;
import com.agricola.api.repositories.AbonoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FolioVentaService {
    @Autowired
    private FolioVentaRepository repository;
    @Autowired
    private AbonoRepository abonoRepository;

    public List<FolioVenta> findAll() {
        return repository.findAll();
    }

    public FolioVenta save(FolioVenta entity) {
        if (entity.getAbonos() != null) {
            entity.getAbonos().forEach(a -> a.setFolioVenta(entity));
        }
        return repository.save(entity);
    }

    public FolioVenta findById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(String id) {
        repository.findById(id).ifPresent(e -> {
            e.setActivo(false);
            repository.save(e);
        });
    }

    public Abono addAbono(String ventaId, Abono abono) {
        return repository.findById(ventaId).map(venta -> {
            abono.setFolioVenta(venta);
            return abonoRepository.save(abono);
        }).orElse(null);
    }
}
