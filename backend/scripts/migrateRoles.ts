/**
 * Script de migration pour ajouter le champ 'role' aux utilisateurs existants.
 * Usage: npx tsx scripts/migrateRoles.ts
 */

import fs from "fs";
import path from "path";

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role?: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

interface DbData {
  users: DbUser[];
  reports?: any[];
  [key: string]: any;
}

function migrate() {
  console.log("📦 Lecture de la base de données...");

  const rawData = fs.readFileSync(DB_PATH, "utf-8");
  const db: DbData = JSON.parse(rawData);

  let migratedCount = 0;

  // Migrer les utilisateurs
  db.users = db.users.map((user) => {
    if (!user.role) {
      migratedCount++;
      return { ...user, role: "user" as const };
    }
    return user;
  });

  // S'assurer que le tableau reports existe
  if (!db.reports) {
    db.reports = [];
    console.log("✅ Tableau 'reports' créé.");
  }

  // Écrire la DB
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");

  console.log(`✅ Migration terminée !`);
  console.log(`   ${migratedCount} utilisateur(s) migré(s) avec role="user"`);
}

migrate();
