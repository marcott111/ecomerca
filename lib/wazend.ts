const BASE_URL = (() => {
  const raw = process.env.WAZEND_BASE_URL || "https://eu-central-1.wazend.net";
  return raw.replace(/\/+$/, "");
})();
const API_KEY = process.env.WAZEND_API_KEY || "";
const SESSION = process.env.WAZEND_SESSION || "S0001";

export { SESSION };

export class WazendError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "WazendError";
  }
}

/**
 * Normaliza un número de WhatsApp a formato internacional SIN el signo +,
 * espacios ni guiones. Ej: "+52 1 555 123 4567" -> "5215551234567"
 */
export function normalizarNumero(numero: string): string {
  return numero.replace(/\D/g, "").replace(/^00/, "").replace(/^0+/, "");
}

/**
 * Convierte un número normalizado a chatId de Wazend.
 * Ej: "5215551234567" -> "5215551234567@c.us"
 */
export function numeroAChatId(numeroNormalizado: string): string {
  return `${numeroNormalizado}@c.us`;
}

/**
 * Genera el enlace wa.me para el botón "Comprar ahora".
 * Ej: "5215551234567" -> "https://wa.me/5215551234567"
 */
export function numeroAWhatsAppLink(numeroNormalizado: string, texto?: string): string {
  const base = `https://wa.me/${numeroNormalizado}`;
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}

/**
 * Envía un mensaje de texto por WhatsApp usando la API de Wazend.
 * @returns true si se envió correctamente
 */
export async function enviarTextoWhatsApp(chatId: string, text: string): Promise<boolean> {
  if (!API_KEY) {
    throw new WazendError(401, "WAZEND_API_KEY no configurada");
  }

  const res = await fetch(`${BASE_URL}/api/sendText`, {
    method: "POST",
    headers: {
      "X-Api-Key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session: SESSION, chatId, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new WazendError(res.status, `Wazend ${res.status}: ${body}`);
  }

  return true;
}

/**
 * Verifica que la sesión de Wazend esté en estado WORKING.
 */
export async function sesionActiva(): Promise<boolean> {
  if (!API_KEY) {
    throw new WazendError(401, "WAZEND_API_KEY no configurada");
  }

  const res = await fetch(`${BASE_URL}/api/sessions/${SESSION}`, {
    method: "GET",
    headers: { "X-Api-Key": API_KEY },
  });

  if (!res.ok) {
    throw new WazendError(res.status, `Wazend ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data?.state === "WORKING";
}
