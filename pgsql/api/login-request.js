import { connectwhatsBot } from "../../scripts/database.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido" });

  const { numero } = req.body;
  if (!numero)
    return res.status(400).json({ error: "O número é obrigatório." });

  const db = await connectwhatsBot();
  if (!db)
    return res.status(500).json({ error: "Banco de dados indisponível." });

  const lojas = db.collection("lojas");
  const loja = await lojas.findOne({ numeroDono: numero });

  if (!loja)
    return res
      .status(404)
      .json({ error: "Nenhuma loja encontrada para este número." });

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  const expiracao = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await lojas.updateOne(
    { numeroDono: numero },
    {
      $set: {
        codigoLogin: {
          codigo,
          expiracao,
          usado: false,
          enviado: false, // o bot detecta isso
        },
      },
    }
  );

  return res.status(200).json({
    message: "Código gerado! Aguarde o envio no WhatsApp.",
  });
}
