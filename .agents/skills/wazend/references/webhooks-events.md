# Webhooks y eventos

Recibe eventos de WhatsApp en tiempo real vía **Webhooks** (HTTP POST) o **WebSockets**.

## Configurar webhooks (por sesión)

Se configuran en la sesión al crearla (`POST /api/sessions`) o después (`PUT /api/sessions/{session}`):

```json
{
  "name": "S0001",
  "config": {
    "webhooks": [
      {
        "url": "https://tu-servidor.com/webhook",
        "events": ["message"],
        "hmac": { "key": "tu-clave-secreta" },
        "retries": { "policy": "constant", "delaySeconds": 2, "attempts": 15 },
        "customHeaders": [{ "name": "X-Mi-Header", "value": "Valor" }]
      }
    ]
  }
}
```

`events` admite varios valores: `["message", "message.ack", "session.status"]`.

## Política de reintentos

| Política | Comportamiento |
|---|---|
| `constant` | Mismo delay siempre (2, 2, 2) |
| `linear` | Incremento lineal (2, 4, 6, 8) |
| `exponential` | Retroceso exponencial con jitter |

## Validar la firma HMAC

Si configuraste `hmac.key`, cada webhook incluye:

- `X-Webhook-Hmac`: firma HMAC del body con sha512.
- `X-Webhook-Hmac-Algorithm`: `sha512`.
- `X-Webhook-Request-Id` y `X-Webhook-Timestamp`.

```js
import { createHmac, timingSafeEqual } from "node:crypto";

function verify(rawBody, hmacHeader, secret) {
  const expected = createHmac("sha512", secret).update(rawBody).digest("base64");
  return timingSafeEqual(Buffer.from(expected), Buffer.from(hmacHeader));
}

app.post("/webhook", express.raw({ type: "*/*" }), (req, res) => {
  if (!verify(req.body, req.header("X-Webhook-Hmac"), process.env.WAZEND_HMAC_KEY)) {
    return res.sendStatus(401);
  }
  const event = JSON.parse(req.body.toString());
  res.sendStatus(200);
  processEvent(event);
});
```

Responde `2xx` inmediatamente y procesa en background; si el webhook falla, Wazend reintenta según la política.

## Estructura del payload

```json
{
  "id": "evt_1111111111111111111111111111",
  "timestamp": 1741249702485,
  "event": "message",
  "session": "S0001",
  "metadata": { "user.id": "123", "user.email": "cliente@ejemplo.com" },
  "me": { "id": "5215551234567@c.us", "pushName": "Mi Nombre" },
  "payload": {},
  "environment": { "tier": "CORE", "version": "2023.10.12" },
  "engine": "NOWEB"
}
```

`metadata` es la que definiste al crear la sesión; `payload` contiene los datos del evento específico.

## Lista de eventos

| Evento | Descripción |
|---|---|
| `session.status` | Cambio de estado de la sesión |
| `message` | Mensaje entrante (texto, audio, archivos) |
| `message.any` | Todos los mensajes, incluidos los propios |
| `message.reaction` | Reacción a un mensaje |
| `message.ack` | Confirmación de entrega/lectura/reproducción |
| `message.ack.group` | Confirmación de un participante en grupo |
| `message.waiting` | Mensaje en espera |
| `message.edited` | Mensaje editado |
| `message.revoked` | Mensaje eliminado (revocado) |
| `chat.archive` | Chat archivado o desarchivado |
| `group.v2.join` / `group.v2.leave` | Entrada/salida de grupos |
| `group.v2.participants` | Alguien entra, sale, es promovido o degradado |
| `group.v2.update` | Actualización de la información del grupo |
| `presence.update` | Actualización de presencia |
| `poll.vote` / `poll.vote.failed` | Votos de encuesta |
| `event.response` / `event.response.failed` | Respuestas a mensajes de evento (GOING, NOT_GOING, MAYBE) |
| `label.upsert` / `label.deleted` | Etiquetas creadas/actualizadas/eliminadas |
| `label.chat.added` / `label.chat.deleted` | Etiquetas asignadas/quitadas de un chat |
| `call.received` / `call.accepted` / `call.rejected` | Llamadas |
| `engine.event` | Evento de bajo nivel del motor (debug) |

## WebSockets

Alternativa a webhooks: `ws://tu-servidor.wazend.net/ws?x-api-key=TU_API_KEY`. Recibe los mismos eventos en formato JSON.
