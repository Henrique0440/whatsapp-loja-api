import { connectwhatsBot } from "../scripts/database.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "senha_muito_secreta";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "DELETE") return res.status(405).json({ error: "Método inválido." });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "Token ausente." });

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "ID obrigatório." });

    const db = await connectwhatsBot();
    const lojas = db.collection("lojas");

    await lojas.updateOne(
      { lojaId: payload.lojaId },
      { $pull: { produtos: { id } } }
    );

    res.status(200).json({ sucesso: true });
  } catch (e) {
    res.status(401).json({ error: "Token inválido." });
  }
}
