// Gestion de la base de données JSON
// On stocke tout dans un fichier db.json pour simplifier (pas de vrai SGBD)

import fs from "node:fs";
import path from "node:path";
import type { DbData } from "./types";

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = path.resolve(DATA_DIR, "db.json");

// Crée le dossier data s'il n'existe pas
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Structure de base vide pour initialiser la DB
function defaultDb(): DbData {
  return {
    users: [],
    listings: [],
    conversations: [],
    messages: [],
    reports: [],
    userReports: [],
  };
}

export function getDbPath(): string {
  return DB_PATH;
}

export function readDb(): DbData {
  ensureDataDir();

  if (!fs.existsSync(DB_PATH)) {
    const initial = defaultDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }

  const raw = fs.readFileSync(DB_PATH, "utf8");
  if (!raw.trim()) return defaultDb();

  try {
    // Supprimer un éventuel BOM UTF-8 au début du fichier
    const cleanRaw = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;

    const parsed = JSON.parse(cleanRaw) as Partial<DbData>;
    return {
      users: Array.isArray(parsed.users)
        ? (parsed.users as DbData["users"])
        : [],
      listings: Array.isArray(parsed.listings)
        ? (parsed.listings as DbData["listings"])
        : [],
      conversations: Array.isArray(parsed.conversations)
        ? (parsed.conversations as DbData["conversations"])
        : [],
      messages: Array.isArray(parsed.messages)
        ? (parsed.messages as DbData["messages"])
        : [],
      reports: Array.isArray(parsed.reports)
        ? (parsed.reports as DbData["reports"])
        : [],
      userReports: Array.isArray(parsed.userReports)
        ? (parsed.userReports as DbData["userReports"])
        : [],
    };
  } catch (err) {
    // Fichier corrompu : logger l'erreur et lever une exception pour éviter perte de données
    console.error("[fileDb] ERREUR parsing db.json:", err);
    console.error(
      "[fileDb] Contenu brut (premiers 100 chars):",
      raw.slice(0, 100),
    );
    throw new Error("Fichier db.json corrompu - intervention manuelle requise");
  }
}

export function writeDb(db: DbData): void {
  ensureDataDir();

  const tmp = DB_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");

  // Remplacement atomique (autant que possible sous Windows)
  if (fs.existsSync(DB_PATH)) {
    fs.rmSync(DB_PATH);
  }
  fs.renameSync(tmp, DB_PATH);
}
