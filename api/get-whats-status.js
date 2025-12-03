export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET")
    return res.status(405).json({ error: "Método não permitido" });

  try {
    const DISCOULD_URL = process.env.DISCLOUD_STATUS_URL;

    if (!DISCOULD_URL)
      return res.status(500).json({ error: "Variável DISCOULD_STATUS_URL faltando." });

    const r = await fetch(DISCOULD_URL);
    const data = await r.json();

    if (data.conectado) {
      return res.status(200).json({ conectado: true });
    } else {
      return res.status(200).json({
        conectado: false,
        qr: data.qr || null
      });
    }

  } catch (err) {
    return res.status(500).json({ error: "Erro ao acessar status do bot" });
  }
}
