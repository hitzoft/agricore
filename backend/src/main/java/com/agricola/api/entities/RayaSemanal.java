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
public class RayaSemanal extends BaseEntity {
    
    private String empleadoId;
    private String empleadoNombre;
    private String puesto;
    private Double sueldoDiario;
    private String semana;
    private Boolean cerrada;

    @OneToMany(mappedBy = "rayaSemanal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiaAsistencia> asistencias = new ArrayList<>();

    public void addDiaAsistencia(DiaAsistencia dia) {
        asistencias.add(dia);
        dia.setRayaSemanal(this);
    }
}
