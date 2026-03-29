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
public class DiaAsistencia extends BaseEntity {
    
    private String diaSemana; // L, M, X, J, V, S, D
    private Boolean asistio;
    private Integer horasExtra;
    private Double bonoExtra;

    @ManyToOne
    @JoinColumn(name = "raya_semanal_id", nullable = false)
    private RayaSemanal rayaSemanal;
}
