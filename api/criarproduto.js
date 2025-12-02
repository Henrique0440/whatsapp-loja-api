import { connectwhatsBot } from "../../scripts/database.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "senha_muito_secreta";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  // Token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ error: "Token ausente." });

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const db = await connectwhatsBot();
    if (!db) return res.status(500).json({ error: "Banco indisponível." });

    const lojas = db.collection("lojas");
    const loja = await lojas.findOne({ lojaId: payload.lojaId });

    if (!loja) return res.status(404).json({ error: "Loja não encontrada." });

    // Dados enviados pelo front
    const { nome, descricao, preco } = req.body;

    if (!nome || !preco) {
      return res.status(400).json({ error: "Nome e preço são obrigatórios." });
    }

    // Criar ID único
    let id = Math.random().toString(36).substring(2, 10)

    const novoProduto = {
      id,
      nome,
      descricao: descricao || "",
      preco: Number(preco),
      criadoEm: new Date(),
    };

    // Salvar no Mongo
    await lojas.updateOne(
      { lojaId: payload.lojaId },
      { $push: { produtos: novoProduto } }
    );

    return res.status(201).json({ sucesso: true, produto: novoProduto });

  } catch (err) {
    return res.status(401).json({ error: "Token inválido." });
  }
}
