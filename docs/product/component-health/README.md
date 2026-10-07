# Component Health — carpeta de producto y roadmap

**Estado general:** `DRAFT` de estrategia / `V0.2 VERIFIED_LOCAL` de demo / `V0.2.1 VERIFIED_LOCAL` de cierre correctivo / `V0.3 IN_PROGRESS` en PR #17 / `DATA EXPORT NOT_APPROVED`.

Este directorio es el **punto de entrada en GitHub** para entender qué se probó, qué falta, qué se podría construir con los datos que ya existen y qué condiciones permitirían construir el producto ideal.

## Documentos canónicos

| Documento | Para qué sirve |
|---|---|
| [Auditoría completa](audit-2026-10-06.md) | Estado real de código, sesiones, pruebas, seguridad, producto, riesgos y gaps |
| [Roadmap por alcances](roadmap.md) | Secuencia V0.2.1→V1→V3, dependencias y GO/PAUSE |
| [Visión ideal](vision-ideal.md) | Arquitectura, modelo de dominio, pantallas, usuarios e inteligencia futura |
| [Registro de versiones](version-registry.md) | **Única tabla de estados**: idea, draft, implementado, verificado, aprobado, released |
| [Backlog ejecutable](execution-backlog.md) | IDs CH-xxx, criterios de aceptación y dependencias para PRs |
| [Decision log](decision-log.md) | Aprobaciones humanas y decisiones ratificadas, distintas de recomendaciones |
| [Cierre V0.2.1](v0.2.1-closeout.md) | Validación local realizada, gates de export y governance pendientes |
| [Evidence Engine V0.3](v0.3-evidence-engine.md) | Especificación en PR #17; no integrada aún a la rama de documentación, ver el PR para acceder |

## Referencias históricas (no borrar ni asumir actualizadas)

- `docs/product-systems/component-health-hypothesis.md`: hipótesis antes de la sesión física; contiene status y pantallas de demo sintética **ya superados**. Conservar como historia de producto.
- `docs/pilots/humandroid/component-health-v0.md`: la primera narrativa de mantenimiento/reemplazo ficticio, no equivalente a la evidencia Unitree/Siglo 21.
- `docs/pilots/siglo21/evidence/2026-10-06-unitree-g1-field-session.md`: registro de operación física y límites.
- `docs/product/component-health-field-evidence.md`: primer motor técnico; debe leerse con las aclaraciones de procedencia de V0.2.1.
- `docs/product/component-health-field-audit-pilot.md`: oferta piloto propuesta, aún no validada comercialmente.

## Qué está probado y qué no

**Probado localmente para V0.2:** un Unitree G1 real produjo telemetría; la cadena baseline/analyzer y la demo visual demostraron evidencia operacional descriptiva por componentes/fases, con checks puntuales y build verde.

**No probado/pendiente:** reejecución de código V0.2.1, lineage completo de baseline rekey, equivalencia independiente plaintext, autorización de export, generalización, multi-robot, retención enterprise, recomendación de reparación, diagnóstico, failure prediction, RUL, ingresos.

## Orden de trabajo

```text
Cerrar PR #15 → demostrar tests + rerun real → resolver aprobación de datos
      ↓
Revisar/ratificar auditoría y roadmap (PR de este directorio)
      ↓
Aprobar selectivamente tareas CH-030...
      ↓
Completar motor/Workbench/Delivery con datos privados autorizados
      ↓
Probar 10 conversaciones y al menos un piloto pago
      ↓
Sólo con evidencia: siguiente alcance
```

**Gestión sólo GitHub:** las filas del registro + el backlog son suficientes aunque Issues esté deshabilitado. Ningún agente debe inventar versiones «aprobadas» ni cambiar el status sin PR y persona autorizada.

**Idioma:** documento canónico de primera versión en **español**. Una futura migración a inglés debe hacerse intencionalmente en PR; no mantener documentación canónica en francés.
