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
public class NominaCuadrilla extends BaseEntity {
    private String cabo;
    private Integer personas;
    private Double tarifa;
    private Double flete;
    private Double comida;
    private Double otrosGastos;
    private String otrosGastosDesc;
    private String huerta;
    private String fecha;
}
