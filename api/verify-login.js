import { connectwhatsBot } from "../../scripts/database.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "senha_muito_secreta";

export default async function handler(req, res) {
  // 🔹 CORS completo
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const { numero, codigo } = req.body;
  if (!numero || !codigo) return res.status(400).json({ error: "Número e código são obrigatórios." });

  const db = await connectwhatsBot();
  if (!db) return res.status(500).json({ error: "Banco de dados indisponível." });

  const lojas = db.collection("lojas");
  const loja = await lojas.findOne({ numeroDono: numero });

  if (!loja || !loja.codigoLogin) return res.status(400).json({ error: "Nenhum código ativo para este número." });

  const { codigoLogin } = loja;
  if (codigoLogin.usado) return res.status(400).json({ error: "Código já foi usado." });
  if (codigoLogin.codigo !== codigo) return res.status(400).json({ error: "Código incorreto." });
  if (new Date(codigoLogin.expiracao) < new Date()) return res.status(400).json({ error: "Código expirado." });

  // Marca como usado
  await lojas.updateOne({ numeroDono: numero }, { $set: { "codigoLogin.usado": true } });

  const token = jwt.sign({ lojaId: loja.lojaId, numero }, JWT_SECRET, { expiresIn: "24h" });

  return res.status(200).json({ message: "Login confirmado!", token, lojaId: loja.lojaId });
}
