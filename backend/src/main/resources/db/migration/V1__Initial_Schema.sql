-- Envers Revision Info
CREATE SEQUENCE revinfo_seq START WITH 1 INCREMENT BY 50;

CREATE TABLE revinfo (
    rev INTEGER NOT NULL,
    revtstmp BIGINT,
    PRIMARY KEY (rev)
);

-- Entity Tables
CREATE TABLE empleado (
    id VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    sync_status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    nombre VARCHAR(255),
    puesto VARCHAR(255),
    rfc VARCHAR(255),
    sueldo_diario FLOAT(53),
    telefono VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE huerta (
    id VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    sync_status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    hectareas FLOAT(53),
    nombre VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE proveedor (
    id VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    sync_status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    nombre VARCHAR(255),
    rfc VARCHAR(255),
    telefono VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE cabo (
    id VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    sync_status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    nombre VARCHAR(255),
    telefono VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE folio_venta (
    id VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    sync_status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    destino VARCHAR(255),
    fecha VARCHAR(255),
    folio VARCHAR(255),
    monto_total FLOAT(53),
    peso VARCHAR(255),
    placas VARCHAR(255),
    status VARCHAR(255),
    variedad VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE abono (
    id VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    sync_status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    fecha VARCHAR(255),
    metodo VARCHAR(255),
    monto FLOAT(53),
    folio_venta_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_abono_folio_venta FOREIGN KEY (folio_venta_id) REFERENCES folio_venta(id)
);

CREATE TABLE gasto (
    id VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    sync_status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    concepto VARCHAR(255),
    fecha VARCHAR(255),
    folio VARCHAR(255),
    monto FLOAT(53),
    proveedor VARCHAR(255),
    tiene_comprobante BOOLEAN,
    PRIMARY KEY (id)
);

CREATE TABLE nomina_cuadrilla (
    id VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    sync_status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    cabo VARCHAR(255),
    comida FLOAT(53),
    fecha VARCHAR(255),
    flete FLOAT(53),
    huerta VARCHAR(255),
    otros_gastos FLOAT(53),
    otros_gastos_desc VARCHAR(255),
    personas INTEGER,
    tarifa FLOAT(53),
    PRIMARY KEY (id)
);

CREATE TABLE raya_semanal (
    id VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    sync_status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    cerrada BOOLEAN,
    empleado_id VARCHAR(255),
    empleado_nombre VARCHAR(255),
    puesto VARCHAR(255),
    semana VARCHAR(255),
    sueldo_diario FLOAT(53),
    PRIMARY KEY (id)
);

CREATE TABLE dia_asistencia (
    id VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    sync_status VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    asistio BOOLEAN,
    bono_extra FLOAT(53),
    dia_semana VARCHAR(255),
    horas_extra INTEGER,
    raya_semanal_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_dia_asistencia_raya_semanal FOREIGN KEY (raya_semanal_id) REFERENCES raya_semanal(id)
);

-- Audit Tables (Envers)
CREATE TABLE empleado_auditoria (
    id VARCHAR(255) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    activo BOOLEAN,
    created_at TIMESTAMP(6),
    sync_status VARCHAR(255),
    updated_at TIMESTAMP(6),
    nombre VARCHAR(255),
    puesto VARCHAR(255),
    rfc VARCHAR(255),
    sueldo_diario FLOAT(53),
    telefono VARCHAR(255),
    PRIMARY KEY (rev, id),
    CONSTRAINT fk_empleado_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE huerta_auditoria (
    id VARCHAR(255) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    activo BOOLEAN,
    created_at TIMESTAMP(6),
    sync_status VARCHAR(255),
    updated_at TIMESTAMP(6),
    hectareas FLOAT(53),
    nombre VARCHAR(255),
    PRIMARY KEY (rev, id),
    CONSTRAINT fk_huerta_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE proveedor_auditoria (
    id VARCHAR(255) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    activo BOOLEAN,
    created_at TIMESTAMP(6),
    sync_status VARCHAR(255),
    updated_at TIMESTAMP(6),
    nombre VARCHAR(255),
    rfc VARCHAR(255),
    telefono VARCHAR(255),
    PRIMARY KEY (rev, id),
    CONSTRAINT fk_proveedor_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE cabo_auditoria (
    id VARCHAR(255) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    activo BOOLEAN,
    created_at TIMESTAMP(6),
    sync_status VARCHAR(255),
    updated_at TIMESTAMP(6),
    nombre VARCHAR(255),
    telefono VARCHAR(255),
    PRIMARY KEY (rev, id),
    CONSTRAINT fk_cabo_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE folio_venta_auditoria (
    id VARCHAR(255) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    activo BOOLEAN,
    created_at TIMESTAMP(6),
    sync_status VARCHAR(255),
    updated_at TIMESTAMP(6),
    destino VARCHAR(255),
    fecha VARCHAR(255),
    folio VARCHAR(255),
    monto_total FLOAT(53),
    peso VARCHAR(255),
    placas VARCHAR(255),
    status VARCHAR(255),
    variedad VARCHAR(255),
    PRIMARY KEY (rev, id),
    CONSTRAINT fk_folio_venta_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE abono_auditoria (
    id VARCHAR(255) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    activo BOOLEAN,
    created_at TIMESTAMP(6),
    sync_status VARCHAR(255),
    updated_at TIMESTAMP(6),
    fecha VARCHAR(255),
    metodo VARCHAR(255),
    monto FLOAT(53),
    folio_venta_id VARCHAR(255),
    PRIMARY KEY (rev, id),
    CONSTRAINT fk_abono_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE gasto_auditoria (
    id VARCHAR(255) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    activo BOOLEAN,
    created_at TIMESTAMP(6),
    sync_status VARCHAR(255),
    updated_at TIMESTAMP(6),
    concepto VARCHAR(255),
    fecha VARCHAR(255),
    folio VARCHAR(255),
    monto FLOAT(53),
    proveedor VARCHAR(255),
    tiene_comprobante BOOLEAN,
    PRIMARY KEY (rev, id),
    CONSTRAINT fk_gasto_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE nomina_cuadrilla_auditoria (
    id VARCHAR(255) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    activo BOOLEAN,
    created_at TIMESTAMP(6),
    sync_status VARCHAR(255),
    updated_at TIMESTAMP(6),
    cabo VARCHAR(255),
    comida FLOAT(53),
    fecha VARCHAR(255),
    flete FLOAT(53),
    huerta VARCHAR(255),
    otros_gastos FLOAT(53),
    otros_gastos_desc VARCHAR(255),
    personas INTEGER,
    tarifa FLOAT(53),
    PRIMARY KEY (rev, id),
    CONSTRAINT fk_nomina_cuadrilla_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE raya_semanal_auditoria (
    id VARCHAR(255) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    activo BOOLEAN,
    created_at TIMESTAMP(6),
    sync_status VARCHAR(255),
    updated_at TIMESTAMP(6),
    cerrada BOOLEAN,
    empleado_id VARCHAR(255),
    empleado_nombre VARCHAR(255),
    puesto VARCHAR(255),
    semana VARCHAR(255),
    sueldo_diario FLOAT(53),
    PRIMARY KEY (rev, id),
    CONSTRAINT fk_raya_semanal_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE TABLE dia_asistencia_auditoria (
    id VARCHAR(255) NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    activo BOOLEAN,
    created_at TIMESTAMP(6),
    sync_status VARCHAR(255),
    updated_at TIMESTAMP(6),
    asistio BOOLEAN,
    bono_extra FLOAT(53),
    dia_semana VARCHAR(255),
    horas_extra INTEGER,
    raya_semanal_id VARCHAR(255),
    PRIMARY KEY (rev, id),
    CONSTRAINT fk_dia_asistencia_aud_revinfo FOREIGN KEY (rev) REFERENCES revinfo(rev)
);
