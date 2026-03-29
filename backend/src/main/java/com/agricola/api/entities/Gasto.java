package com.agricola.api.entities;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;

@Entity
@Audited
@Getter
@Setter
@NoArgsConstructor
public class Gasto extends BaseEntity {
    private String proveedor;
    private String concepto;
    private Double monto;
    private String fecha;
    private String folio;
    private Boolean tieneComprobante;
}
