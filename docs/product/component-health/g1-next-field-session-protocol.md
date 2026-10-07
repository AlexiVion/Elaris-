# G1 Component Health — Next Field Session Protocol

**Protocolo:** `CH-G1-002`  
**Estado:** `PREPARED_BLOCKED_ON_ROBOT_ACCESS`  
**Modo Elaris:** `READ_ONLY`

## Objetivo

La próxima sesión debe responder tres preguntas concretas:

1. ¿el OEM index 28 produce una señal dinámica cuando el RightWristYaw se mueve físicamente?
2. ¿los timestamps duplicados nacen antes o después del bridge/sampling?
3. ¿el collector sigue recibiendo frames hasta el fin solicitado de captura?

## Precondiciones

- acceso autorizado al Unitree G1;
- host Linux autorizado conectado por Ethernet a la red del robot;
- `unitree_sdk2_python` funcional;
- interfaz de red confirmada;
- Elaris V0.4.3 verificado localmente;
- operador humano autorizado para ejecutar movimientos normales;
- Elaris no comanda movimiento.

## Secuencia

### 0. Preflight

```bash
pnpm edge doctor-unitree --interface enp0s8
```

### 1. Inspect

```bash
pnpm edge inspect-unitree --interface enp0s8 --hz 20
```

Registrar disponibilidad de `rt/lowstate`, `mode_machine`, componentes y tipos de señal.

### 2. Idle inicial

Capturar aproximadamente 30 s sin movimiento deliberado del wrist. Esto sirve como referencia de secuencia, ticks y canales.

### 3. Probe RightWristYaw

```bash
pnpm edge probe-unitree-component \
  --interface enp0s8 \
  --component right-wrist-yaw \
  --duration 30 \
  --hz 20
```

Durante la ventana, un operador autorizado ejecuta únicamente movimiento normal ya soportado por el robot. Elaris permanece read-only.

### 4. Repetición

Repetir el probe una segunda vez para reducir el riesgo de interpretar un resultado aislado.

### 5. Captura instrumentada

Ejecutar una captura formal V0.4.3 incluyendo idle, movimiento wrist, retorno a idle y terminación controlada.

### 6. Finalización controlada

No apagar ni desconectar inmediatamente después del movimiento. Mantener una ventana idle corta antes de finalizar para separar fin de movimiento, fin de frames, unsubscribe y finalize.

### 7. Diagnostics offline

```bash
pnpm edge diagnose-capture <capture-dir>
```

Revisar duplicate capture timestamps, duplicate source ticks, emitted sequence gaps, callback/emitted regressions y last-frame-to-requested-end gap.

## Matriz de interpretación

### Wrist dinámico observado

`DYNAMIC_SIGNAL_OBSERVED`

Conclusión permitida: el slot produjo telemetría física dinámica en esa sesión. No permite concluir HEALTHY.

### Wrist físicamente movido pero señal estática

`STATIC_OR_ZERO_SIGNAL`

Es evidencia para investigar mapping, configuración, transporte o firmware. No clasificar automáticamente como fallo.

### Timestamps duplicados con source tick y emitted sequence distintos

Apunta a una duplicación de representación temporal en captura o capas posteriores; no prueba que el mensaje OEM sea duplicado.

### Source tick duplicado

Requiere revisar si el mismo estado OEM fue observado múltiples veces o si el tick tiene una semántica distinta a la asumida.

### Emitted sequence gap

Indica una discontinuidad posterior a la emisión del bridge o en los datos persistidos; debe correlacionarse con callback sequence y lifecycle.

### Large last-frame/end gap

Usar lifecycle V0.4.3 para localizar el gap respecto de último frame, solicitud de fin, unsubscribe y finalización.

## Cierre

`CH-G1-002` se considera útil si reduce al menos una de las tres preguntas abiertas.

No se exige resolver salud, seguridad ni return-to-service.
