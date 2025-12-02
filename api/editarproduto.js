import { connectwhatsBot } from "../../scripts/database.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "senha_muito_secreta";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "PUT") return res.status(405).json({ error: "Método inválido." });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "Token ausente." });

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const { id, nome, descricao, preco } = req.body;
    if (!id || !nome || preco === undefined)
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });

    const db = await connectwhatsBot();
    const lojas = db.collection("lojas");

    // Atualiza produto dentro do array usando positional operator $
    await lojas.updateOne(
      { lojaId: payload.lojaId, "produtos.id": id },
      {
        $set: {
          "produtos.$.nome": nome,
          "produtos.$.descricao": descricao,
          "produtos.$.preco": Number(preco),
        },
      }
    );

    res.status(200).json({ sucesso: true });
  } catch (e) {
    res.status(401).json({ error: "Token inválido." });
  }
}
