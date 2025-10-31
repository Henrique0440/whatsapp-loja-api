import { connectwhatsBot } from "../../scripts/database.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "senha_muito_secreta";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "GET")
        return res.status(405).json({ error: "Método não permitido" });

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

        if (!loja)
            return res.status(404).json({ error: "Loja não encontrada." });

        // remove dados sensíveis antes de enviar
        delete loja.codigoLogin;

        return res.status(200).json(loja);
    } catch (err) {
        return res.status(401).json({ error: "Token inválido." });
    }
}
