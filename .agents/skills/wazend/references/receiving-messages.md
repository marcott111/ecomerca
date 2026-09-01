# Recibir mensajes: historial, chats y contactos

## Historial de mensajes

```bash
curl "https://eu-central-1.wazend.net/api/S0001/chats/5215551234567@c.us/messages?limit=100" \
  -H "X-Api-Key: TU_API_KEY"
```

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/{session}/chats?limit=100&offset=0` | Listar chats |
| `POST` | `/api/{session}/chats/overview` | Resumen de chats. Body: `{ "pagination": { "limit": 20, "offset": 0 }, "filter": { "ids": ["5215551234567@c.us"] } }` |
| `GET` | `/api/{session}/chats/{chatId}/messages?limit=10` | Mensajes de un chat |
| `GET` | `/api/{session}/chats/{chatId}/messages/{messageId}` | Un mensaje |
| `GET` | `/api/{session}/chats/{chatId}/picture` | Foto del chat |

## Gestión de mensajes

| Método | Ruta | Body / notas |
|---|---|---|
| `PUT` | `/api/{session}/chats/{chatId}/messages/{messageId}` | `{ "text": "Mensaje editado" }` |
| `DELETE` | `/api/{session}/chats/{chatId}/messages/{messageId}` | Elimina el mensaje |
| `DELETE` | `/api/{session}/chats/{chatId}/messages` | Elimina todos |
| `POST` | `/api/{session}/chats/{chatId}/messages/read` | `{ "messages": 30, "days": 7 }` o `{ "ids": ["..."] }` |
| `POST` | `/api/{session}/chats/{chatId}/pin` (via `messages/{messageId}/pin`) | `{ "duration": 86400 }` |
| `POST` | `.../unpin` | Quita el pin |

## Gestión de chats

| Método | Ruta |
|---|---|
| `POST` | `/api/{session}/chats/{chatId}/archive` · `/unarchive` · `/unread` |
| `DELETE` | `/api/{session}/chats/{chatId}` |

## Contactos

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/api/contacts/all?session=S0001` | Listar contactos |
| `GET` | `/api/contacts?contactId=5215551234567&session=S0001` | Obtener contacto |
| `PUT` | `/api/{session}/contacts/{chatId}` | `{ "firstName": "Juan", "lastName": "Pérez" }` |
| `GET` | `/api/contacts/check-exists?phone=5215551234567&session=S0001` | ¿El número tiene WhatsApp? |
| `GET` | `/api/contacts/about?contactId=...&session=S0001` | Estado (about) |
| `GET` | `/api/contacts/profile-picture?contactId=...&session=S0001` | Foto de perfil |
| `POST` | `/api/contacts/block` / `/api/contacts/unblock` | `{ "contactId": "5215551234567", "session": "S0001" }` |
| `GET` | `/api/{session}/lids` | LIDs conocidos |

## Tiempo real

Para recibir mensajes en vivo usa webhooks (recomendado) o WebSockets. Ver [webhooks-events.md](webhooks-events.md). El evento clave es `message` y su payload llega en `payload` del evento:

```json
{
  "event": "message",
  "session": "S0001",
  "payload": {
    "id": "false_5215551234567@c.us_ABC123",
    "from": "5215551234567@c.us",
    "to": "5215551111111@c.us",
    "body": "¡Hola!",
    "hasMedia": false,
    "timestamp": 1741249702
  }
}
```

Respónde el webhook con HTTP `2xx` lo antes posible y procesa el mensaje en background (evita bloqueos por latencia).
