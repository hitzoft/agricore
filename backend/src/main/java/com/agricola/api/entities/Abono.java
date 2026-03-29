package com.agricola.api.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

@Entity
@Audited
@Getter
@Setter
@NoArgsConstructor
public class Abono extends BaseEntity {
    private String fecha;
    private Double monto;
    private String metodo;

    @ManyToOne
    @JoinColumn(name = "folio_venta_id", nullable = false)
    private FolioVenta folioVenta;
}
