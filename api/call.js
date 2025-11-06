export default async function handler(req, res) {
  // ✅ Habilita CORS para todos los orígenes (puedes restringir luego si quieres)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Responder preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ❌ Bloquear otros métodos
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { phoneE164 } = req.body || {};
    if (!phoneE164)
      return res.status(400).json({ error: "phoneE164 required" });

    // 🔑 Variables de entorno (asegúrate que estén en Vercel)
    const VAPI_API_KEY = process.env.VAPI_API_KEY;
    const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;
    const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;

    // ☎️ Llamar a la API de VAPI
    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        assistantId: VAPI_ASSISTANT_ID,
        phoneNumberId: VAPI_PHONE_NUMBER_ID,
        customer: { number: phoneE164 },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ ok: true, call: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
