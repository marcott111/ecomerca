# Sesiones

Una sesión es un número de WhatsApp conectado. **Las sesiones se crean, compran y eliminan desde el Dashboard de Wazend** — la API gestiona sesiones existentes: configuración, ciclo de vida, autenticación y estado.

## Ciclo de vida

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/sessions` | Listar sesiones |
| `GET` | `/api/sessions/{session}` | Obtener sesión (estado incluido) |
| `PUT` | `/api/sessions/{session}` | Actualizar configuración |
| `POST` | `/api/sessions/{session}/start` | Iniciar sesión |
| `POST` | `/api/sessions/{session}/stop` | Detener sesión |
| `POST` | `/api/sessions/{session}/restart` | Reiniciar sesión |
| `POST` | `/api/sessions/{session}/logout` | Cerrar sesión (desvincula WhatsApp) |

## Conectar el número

**QR** (el usuario escanea desde WhatsApp → Dispositivos vinculados):

```bash
curl -X POST "https://eu-central-1.wazend.net/api/sessions/S0001/auth/qr?format=image" \
  -H "X-Api-Key: TU_API_KEY"
```

`format=image` devuelve PNG; `format=raw` devuelve la cadena del QR.

**Código de emparejamiento** (por teléfono):

```bash
curl -X POST "https://eu-central-1.wazend.net/api/sessions/S0001/auth/request-code" \
  -H "X-Api-Key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "phoneNumber": "5215551234567" }'
```

## Estados de la sesión

| Estado | Significado |
|---|---|
| `STOPPED` | Detenida |
| `STARTING` | Iniciando |
| `SCAN_QR_CODE` | Esperando escaneo del QR |
| `WORKING` | Conectada y lista (única en la que se puede enviar) |
| `FAILED` | Error |
| `LOGGED_OUT` | Desvinculada de WhatsApp |

Consulta el estado con `GET /api/sessions/{session}` o suscríbete al evento `session.status` (ver webhooks).

## Perfil de la sesión

- `GET /api/sessions/{session}/me` — información del número conectado.

## Actualizar configuración — `PUT /api/sessions/{session}`

```json
{
  "name": "S0001",
  "config": {
    "webhooks": [{ "url": "https://tu-servidor.com/webhook", "events": ["message"] }],
    "proxy": { "server": "localhost:3128", "username": "usuario", "password": "contraseña" },
    "metadata": { "user.id": "123" },
    "ignore": { "status": true, "groups": false, "channels": true, "broadcast": true },
    "client": { "deviceName": "MyApp", "browserName": "Chrome" },
    "debug": false
  }
}
```

- `metadata`: objeto libre que se incluye en cada evento/webhook recibido.
- `ignore`: descarta tipos de chat.
- `proxy`: útil si el QR no carga (ver https://wazend.net/docs/proxy).
- Si la sesión no está en `STOPPED`, se detiene e inicia con la nueva configuración.

## Ejemplo completo (Node)

```js
const BASE_URL = process.env.WAZEND_BASE_URL;
const API_KEY = process.env.WAZEND_API_KEY;

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "X-Api-Key": API_KEY, "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) throw new Error(`Wazend ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

// 1) iniciar si está detenida, 2) esperar WORKING, 3) usar
let session = await api("/api/sessions/S0001");
if (session.status === "STOPPED") {
  await api("/api/sessions/S0001/start", { method: "POST" });
}
do {
  await new Promise((r) => setTimeout(r, 2000));
  session = await api("/api/sessions/S0001");
} while (session.status !== "WORKING");
```
