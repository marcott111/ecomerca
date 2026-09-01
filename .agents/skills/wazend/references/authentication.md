# Autenticación y conceptos base

## Base URL

Cada cuenta de Wazend tiene su propia URL de servidor. Se obtiene del Dashboard y es la base de todos los endpoints:

```
https://eu-central-1.wazend.net/
```

Los endpoints se forman anteponiendo la Base URL a la ruta. Ejemplo: `POST {BASE_URL}/api/sendText`.

## API Key (X-Api-Key)

Todas las peticiones requieren el header `X-Api-Key`. Las API Keys se crean desde el Dashboard con **alcance limitado por sesión**.

```bash
curl -X POST "https://eu-central-1.wazend.net/api/sendText" \
  -H "X-Api-Key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "session": "S0001", "chatId": "5215551234567@c.us", "text": "¡Hola!" }'
```

Seguridad:

- No versionar la API Key (usar variables de entorno).
- Si se filtra, rotarla desde el Dashboard.
- Una key con alcance a una sesión no funciona contra otras sesiones.

## Formatos de chatId

| Tipo | Formato | Ejemplo |
|---|---|---|
| Usuario | `numero@c.us` (internacional sin `+`) | `5215551234567@c.us` |
| Grupo | `id@g.us` | `123456789012345678@g.us` |
| Canal (newsletter) | `id@newsletter` | `123456789012345678@newsletter` |
| Estado (stories) | fijo | `status@broadcast` |

Los IDs de mensaje tienen el formato `{owner}_{chatId}_{id}`, ej. `false_5215551234567@c.us_ABC123`.

## Códigos de estado HTTP

| Código | Significado |
|---|---|
| `200` / `201` | Éxito (201 en envíos de mensajes) |
| `400` | Body inválido (falta `session`, `chatId`, formato incorrecto) |
| `401` | API Key ausente o inválida |
| `404` | Sesión inexistente o endpoint incorrecto |
| `409` | Sesión no está en estado `WORKING` (espera a que se conecte) |

## Recursos

- Docs: https://wazend.net/docs
- Referencia completa para LLMs: https://wazend.net/llms.txt
