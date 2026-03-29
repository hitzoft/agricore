# Agricore Design System & UI Standards

Este documento establece los estándares de diseño para asegurar la consistencia visual y operativa en todo el sistema Agricore.

## 🎨 Paleta de Colores

Utilizamos una paleta basada en Tailwind CSS con dos acentos principales:

*   **Agri (Verde)**: Usado para acciones positivas, éxito, dinero entrante y elementos primarios.
    *   `agri-50`: `#f0fdf4` (Fondo sutil)
    *   `agri-100`: `#dcfce7` (Bordes/Highlights)
    *   `agri-500`: `#22c55e` (Botones/Iconos)
    *   `agri-600`: `#16a34a` (Hover/Enfasis)
    *   `agri-700`: `#15803d` (Texto oscuro)
*   **Watermelon (Rojo/Rosa)**: Usado para gastos, deudas, alertas y acciones destructivas.
    *   `watermelon-50`: `#fff1f2`
    *   `watermelon-500`: `#f43f5e`
    *   `watermelon-600`: `#e11d48`
*   **Neutrales (Gris)**:
    *   `gray-50`: Fondos de tarjetas/inputs.
    *   `gray-100/200`: Bordes finos.
    *   `gray-400`: Etiquetas secundarias (Uppercase tracking-widest).
    *   `gray-900`: Texto principal.

## 🔳 Componentes de Interfaz

### Ventanas y Modales
*   **Formato**: Glassmorphism sutil o Blanco puro con sombras suaves.
*   **Bordes**: `rounded-3xl` (24px) para contenedores principales.
*   **Scroll**: Siempre utilizar scroll interno en modales largos (`max-h-[85vh] overflow-y-auto`).
*   **Overlay**: Fondo oscuro semi-transparente (`bg-black/40`) con desenfoque (`backdrop-blur-sm`).

### Botones (Tamaños Estándar)
Utilizar utilidades de Tailwind para mantener consistencia:

| Tipo | Clase CSS / Tailwind | Uso |
| :--- | :--- | :--- |
| **Primario** | `px-6 py-3 rounded-2xl bg-agri-500 text-white font-black uppercase text-xs hover:bg-agri-600 transform active:scale-95 transition-all shadow-lg shadow-agri-500/20` | Acción principal de la vista. |
| **Secundario** | `px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-[11px] hover:bg-gray-200` | Acciones de soporte dentro de tarjetas. |
| **Acción Rápida** | `p-2 rounded-lg text-agri-600 hover:bg-agri-50` | Iconos de edición/borrado. |

## 🏗️ Patrones de Diseño

### Master-Detail (Maestro-Detalle)
Todas las secciones (Ventas, Gastos, Nómina) deben seguir este patrón:
1.  **Vista Master**: Lista de tarjetas (`Cards`) interactivas. NO usar tablas tradicionales a menos que sea estrictamente necesario para reporting masivo.
2.  **Vista Detail**: Al hacer clic en una tarjeta, se abre un `DetailModal` que muestra toda la información extendida y las acciones relacionadas (pagos, editar, etc.).
3.  **Persistencia**: El `DetailModal` debe permanecer abierto o actualizarse inmediatamente después de una acción (como registrar un abono) para no perder el contexto del usuario.

### Etiquetas de Error (Inline)
*   **NO usar `alert()` browser default.**
*   Usar un label dinámico dentro del formulario:
    *   Container: `bg-red-50 border border-red-100 rounded-xl p-3`
    *   Texto: `text-[10px] font-black text-red-600 uppercase tracking-tight`

## ⌨️ Tipografía e Inputs
*   **Inputs**: `bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 focus:ring-4 focus:ring-agri-500/10 focus:border-agri-500 transition-all text-sm font-bold`.
*   **Labels**: `text-[10px] font-black text-gray-400 uppercase tracking-widest`.
*   **Cantidades**: Usar `font-mono` para números y alineación a la derecha cuando sea posible.
