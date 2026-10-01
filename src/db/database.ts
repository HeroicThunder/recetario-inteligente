import * as SQLite from "expo-sqlite";

export type Ingrediente = {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  caducidad: string | null;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync("recetario.db");
  return dbPromise;
}

export async function iniciarDb() {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ingredientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cantidad REAL NOT NULL,
      unidad TEXT NOT NULL,
      caducidad TEXT
    );
  `);
}

export async function listarIngredientes(): Promise<Ingrediente[]> {
  const db = await getDb();
  return db.getAllAsync<Ingrediente>(
    "SELECT * FROM ingredientes ORDER BY nombre",
  );
}

export async function agregarIngrediente(
  nombre: string,
  cantidad: number,
  unidad: string,
  caducidad: string | null = null,
) {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO ingredientes (nombre, cantidad, unidad, caducidad) VALUES (?, ?, ?, ?)",
    nombre,
    cantidad,
    unidad,
    caducidad,
  );
}

export async function actualizarIngrediente(
  id: number,
  nombre: string,
  cantidad: number,
  unidad: string,
  caducidad: string | null = null,
) {
  const db = await getDb();
  await db.runAsync(
    "UPDATE ingredientes SET nombre = ?, cantidad = ?, unidad = ?, caducidad = ? WHERE id = ?",
    nombre,
    cantidad,
    unidad,
    caducidad,
    id,
  );
}

export async function eliminarIngrediente(id: number) {
  const db = await getDb();
  await db.runAsync("DELETE FROM ingredientes WHERE id = ?", id);
}
