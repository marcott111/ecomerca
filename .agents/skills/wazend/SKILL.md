---
name: wazend
description: Integra la API de Wazend (API HTTP de WhatsApp). Úsalo cuando el usuario quiera enviar o recibir mensajes de WhatsApp, gestionar sesiones, configurar webhooks, o automatizar WhatsApp desde código (Wazend es un wrapper de WAHA). Envío de texto, imágenes, audio, documentos, encuestas, ubicaciones, contactos, grupos, canales, estados y más vía HTTP con header X-Api-Key.
---

# Wazend API — Skill de integración

Wazend API es la API HTTP de WhatsApp que consume este proyecto. Se controla con peticiones HTTP: cada usuario tiene su **servidor** (Base URL) y una **API Key** por sesión.

## Requisitos (pedir al usuario si faltan)

1. **Base URL**: la URL del servidor del usuario, ejemplo `https://eu-central-1.wazend.net`. Se obtiene del Dashboard de Wazend.
2. **API Key**: se crea en el Dashboard con alcance limitado a una sesión. Se envía en el header `X-Api-Key`.
3. **Nombre de la sesión** (ej. `S0001`): la sesión a la que da acceso la API Key.

Las sesiones de WhatsApp **se crean y eliminan desde el Dashboard de Wazend**, no por API: la API opera sobre sesiones existentes. Nunca escribas la API Key en código versionado; usa variables de entorno (`WAZEND_BASE_URL`, `WAZEND_API_KEY`).

## Formato de chatId

| Tipo | Formato | Ejemplo |
|---|---|---|
| Usuario | número internacional sin `+` | `5215551234567@c.us` |
| Grupo | id del grupo | `123456789012345678@g.us` |
| Canal | id del canal | `123456789012345678@newsletter` |
| Estado (stories) | fijo | `status@broadcast` |

## Inicio rápido (flujo estándar)

1. **Verificar la sesión** y su estado:

```bash
curl "https://eu-central-1.wazend.net/api/sessions/S0001" \
  -H "X-Api-Key: $WAZEND_API_KEY"
```

2. **Iniciar y obtener QR** si el estado es `STOPPED` o `SCAN_QR_CODE` (el usuario escanea el QR con WhatsApp):

```bash
curl -X POST "https://eu-central-1.wazend.net/api/sessions/S0001/start" \
  -H "X-Api-Key: $WAZEND_API_KEY"

curl -X POST "https://eu-central-1.wazend.net/api/sessions/S0001/auth/qr?format=image" \
  -H "X-Api-Key: $WAZEND_API_KEY"
```

3. **Enviar un mensaje de texto** una vez que la sesión esté en `WORKING`:

```bash
curl -X POST "https://eu-central-1.wazend.net/api/sendText" \
  -H "X-Api-Key: $WAZEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "session": "S0001",
    "chatId": "5215551234567@c.us",
    "text": "¡Hola! ¿Cómo estás?"
  }'
```

Respuesta HTTP `201` con el `id` del mensaje. `401` = API Key inválida, `404` = sesión o endpoint inexistente.

## Ejemplo en JavaScript (fetch)

```js
const BASE_URL = process.env.WAZEND_BASE_URL;
const API_KEY = process.env.WAZEND_API_KEY;

async function sendText(chatId, text) {
  const res = await fetch(`${BASE_URL}/api/sendText`, {
    method: "POST",
    headers: { "X-Api-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ session: "S0001", chatId, text }),
  });
  if (!res.ok) throw new Error(`Wazend ${res.status}: ${await res.text()}`);
  return res.json();
}
```

## Recibir mensajes

Configura webhooks en la sesión y escucha el evento `message`:

```bash
curl -X PUT "https://eu-central-1.wazend.net/api/sessions/S0001" \
  -H "X-Api-Key: $WAZEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "webhooks": [{ "url": "https://tu-servidor.com/webhook", "events": ["message"] }]
    }
  }'
```

Valida siempre la firma con el header `X-Webhook-Hmac` (HMAC sha512) si configuraste `hmac.key`.

## Reglas importantes

- Las sesiones se crean, compran y eliminan desde el Dashboard. No intentes crearlas con la API: tu API Key solo controla la sesión a la que está asociada.
- Antes de enviar mensajes, confirma que la sesión está en estado `WORKING`.
- Los números van en formato internacional sin `+`, espacios ni guiones, con sufijo `@c.us`.
- No envíes mensajes masivos no solicitados: provoca bloqueo (ver https://wazend.net/docs/como-evitar-bloqueo).
- Protege la API Key; si el usuario la pega en el chat, sugiérele rotarla desde el Dashboard.

## Referencias detalladas (cárgalas según la tarea)

| Archivo | Contenido |
|---|---|
| [references/authentication.md](references/authentication.md) | Base URL, X-Api-Key, errores HTTP, chatIds |
| [references/sessions.md](references/sessions.md) | Ciclo de vida de sesiones, QR, request-code, estados, configuración completa |
| [references/sending-messages.md](references/sending-messages.md) | Todos los endpoints de envío con bodies de ejemplo |
| [references/receiving-messages.md](references/receiving-messages.md) | Historial, chats, mensajes, contactos |
| [references/webhooks-events.md](references/webhooks-events.md) | Webhooks, eventos, HMAC, WebSockets |

Documentación online: https://wazend.net/docs · Referencia completa para LLMs: https://wazend.net/llms.txt
