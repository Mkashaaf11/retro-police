import * as SQLITE from "expo-sqlite";
const db = await SQLITE.openDatabaseAsync("retro-police.db");

export const createTables = async () => {
  await db.execAsync(`
        PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS officer (id text PRIMARY KEY NOT NULL, name TEXT NOT NULL, 
badge_number INTEGER NOT NULL,rank text NOT NULL,email text NOT NULL, contact text NOT NULL, profile_picture text,  
UNIQUE(badge_number));

`);
};

export const insertOfficer = async (officerData) => {
  const { id, name, badge_number, rank, email, contact, profile_picture } =
    officerData;

  const result = await db.runAsync(
    "INSERT INTO officer (id, name,badge_number,rank,email,contact,profile_picture) VALUES (?, ?,?,?,?,?,?)",
    [id, name, badge_number, rank, email, contact, profile_picture]
  );
  console.log(result.lastInsertRowId, result.changes);
};
