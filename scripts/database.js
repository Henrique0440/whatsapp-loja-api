import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
const client = new MongoClient(MONGO_URI);
let db;

export async function connectwhatsBot() {
    try {
        if (!db) {
            await client.connect();
            db = client.db("whatsappBot");
        }
        return db;
    } catch (error) {
        console.log("Mongo indisponível", error.code);
        return null;
    }
}
