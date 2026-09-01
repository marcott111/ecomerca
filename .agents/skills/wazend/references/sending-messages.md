# Enviar mensajes

Todos los endpoints son `POST {BASE_URL}/api/...` con header `X-Api-Key`. Requieren `session` en estado `WORKING`. Respuesta `201` con el mensaje creado (incluye `id`).

## Texto — `POST /api/sendText`

```json
{
  "session": "S0001",
  "chatId": "5215551234567@c.us",
  "text": "¡Hola! ¿Cómo estás?",
  "reply_to": "false_5215551234567@c.us_ABC123",
  "mentions": ["5215559876543@c.us"],
  "linkPreview": true
}
```

`mentions: ["all"]` menciona a todos (solo grupos). Para citar un mensaje usa `reply_to` con el `id`.

## Imagen — `POST /api/sendImage`

```json
{
  "session": "S0001",
  "chatId": "5215551234567@c.us",
  "file": { "mimetype": "image/jpeg", "url": "https://ejemplo.com/foto.jpg", "filename": "foto.jpg" },
  "caption": "Mira esta foto"
}
```

También acepta `data` (base64) en lugar de `url`: `{ "mimetype": "image/jpeg", "data": "BASE64" }`.

## Nota de voz — `POST /api/sendVoice`

OGG/Opus. Con `convert: true` convierte automáticamente otros formatos de audio.

```json
{
  "session": "S0001",
  "chatId": "5215551234567@c.us",
  "file": { "mimetype": "audio/ogg; codecs=opus", "url": "https://ejemplo.com/audio.ogg" },
  "convert": false
}
```

## Video — `POST /api/sendVideo`

```json
{
  "session": "S0001",
  "chatId": "5215551234567@c.us",
  "file": { "mimetype": "video/mp4", "url": "https://ejemplo.com/video.mp4" },
  "convert": false
}
```

## Archivo — `POST /api/sendFile`

```json
{
  "session": "S0001",
  "chatId": "5215551234567@c.us",
  "file": { "mimetype": "application/pdf", "url": "https://ejemplo.com/documento.pdf", "filename": "documento.pdf" }
}
```

## Encuesta — `POST /api/sendPoll`

```json
{
  "session": "S0001",
  "chatId": "5215551234567@c.us",
  "poll": { "name": "¿Cómo estás?", "options": ["¡Genial!", "¡Bien!", "No tan bien"], "multipleAnswers": false }
}
```

Votar: `POST /api/sendPollVote` con `{ "session", "chatId", "pollMessageId", "votes": ["¡Genial!"] }`.

## Lista interactiva — `POST /api/sendList`

```json
{
  "session": "S0001",
  "chatId": "5215551234567@c.us",
  "title": "Menú principal",
  "text": "Selecciona una opción",
  "buttonText": "Abrir menú",
  "sections": [{ "title": "Opciones", "rows": [{ "title": "Opción 1" }, { "title": "Opción 2" }] }]
}
```

## Link con vista previa personalizada — `POST /api/send/link-custom-preview`

```json
{
  "session": "S0001",
  "chatId": "5215551234567@c.us",
  "title": "Título personalizado",
  "description": "Descripción del enlace",
  "url": "https://ejemplo.com",
  "imageUrl": "https://ejemplo.com/preview.jpg"
}
```

## Contacto (vCard) — `POST /api/sendContactVcard`

```json
{
  "session": "S0001",
  "chatId": "5215551234567@c.us",
  "contacts": [{ "fullName": "Juan Pérez", "phoneNumber": "+5215551234567" }]
}
```

## Ubicación — `POST /api/sendLocation`

```json
{
  "session": "S0001",
  "chatId": "5215551234567@c.us",
  "lat": 19.4326,
  "lng": -99.1332,
  "title": "Ciudad de México"
}
```

## Otros

| Endpoint | Body |
|---|---|
| `POST /api/sendSeen` | `{ "session", "chatId" }` — marca el chat como leído |
| `POST /api/startTyping` | `{ "session", "chatId" }` |
| `POST /api/stopTyping` | `{ "session", "chatId" }` |
| `POST /api/forwardMessage` | `{ "session", "messageId", "chatId" }` |
| `POST /api/reaction` | `{ "session", "messageId", "chatId", "reaction": "👍" }` (`""` quita la reacción) |
| `POST /api/star` | `{ "session", "messageId", "chatId", "star": true }` |
| `POST /api/{session}/media/convert/voice` | `{ "url": "https://ejemplo.com/audio.mp3" }` → OGG/Opus |
| `POST /api/{session}/media/convert/video` | `{ "url": "https://ejemplo.com/video.mov" }` → MP4 |

## Mensajes de evento — `POST /api/{session}/events`

```json
{
  "chatId": "5215551234567@c.us",
  "event": {
    "name": "Reunión de equipo",
    "description": "Revisión del proyecto",
    "startTime": "2026-09-01T10:00:00Z",
    "endTime": "2026-09-01T11:00:00Z"
  }
}
```
