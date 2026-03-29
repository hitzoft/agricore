package com.agricola.api.entities;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

import java.util.ArrayList;
import java.util.List;

@Entity
@Audited
@Getter
@Setter
@NoArgsConstructor
public class FolioVenta extends BaseEntity {
    private String folio;
    private String placas;
    private String variedad;
    private String peso;
    private String destino;
    private String fecha;
    private String status;
    private Double montoTotal;

    @OneToMany(mappedBy = "folioVenta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Abono> abonos = new ArrayList<>();
    
    public void addAbono(Abono abono) {
        abonos.add(abono);
        abono.setFolioVenta(this);
    }
}
