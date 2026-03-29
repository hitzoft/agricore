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
public class Proveedor extends BaseEntity {
    private String nombre;
    private String rfc;
    private String telefono;
}
