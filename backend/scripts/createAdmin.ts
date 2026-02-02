/**
 * Script pour initialiser un compte administrateur.
 * Usage: npx tsx scripts/createAdmin.ts <email> <password>
 */

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const SALT_ROUNDS = 10;
const DB_PATH = path.join(__dirname, "..", "data", "db.json");

interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

interface DbData {
  users: DbUser[];
  [key: string]: any;
}

async function createAdmin(
  email: string,
  password: string,
  displayName: string,
) {
  // Lire la DB
  const rawData = fs.readFileSync(DB_PATH, "utf-8");
  const db: DbData = JSON.parse(rawData);

  // Vérifier si l'email existe déjà
  const existingUser = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (existingUser) {
    console.error(`❌ Un utilisateur avec l'email "${email}" existe déjà.`);
    process.exit(1);
  }

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Créer l'admin
  const now = new Date().toISOString();
  const admin: DbUser = {
    id: uuidv4(),
    email,
    passwordHash,
    displayName,
    role: "admin",
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(admin);

  // Migrer les utilisateurs existants (ajouter role: "user" si manquant)
  db.users = db.users.map((u) => ({
    ...u,
    role: u.role || "user",
  }));

  // Écrire la DB
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");

  console.log(`✅ Compte administrateur créé avec succès !`);
  console.log(`   Email: ${email}`);
  console.log(`   ID: ${admin.id}`);
}

// Arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log(
    "Usage: npx tsx scripts/createAdmin.ts <email> <password> [displayName]",
  );
  console.log(
    "Exemple: npx tsx scripts/createAdmin.ts admin@koudpouce.fr MonMotDePasse Admin",
  );
  process.exit(1);
}

const [email, password, displayName = "Admin"] = args;

createAdmin(email, password, displayName);
