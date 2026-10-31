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

import * as Crypto from "expo-crypto";

export type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  creado_en: string;
};

export async function inicializarAutenticacion() {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      creado_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sesion (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      usuario_id INTEGER NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);
}

async function generarHash(password: string, salt: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`,
  );
}

export async function registrarUsuario(
  nombre: string,
  correo: string,
  password: string,
) {
  const db = await getDb();

  const correoNormalizado = correo.trim().toLowerCase();

  const existente = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM usuarios WHERE correo = ?",
    correoNormalizado,
  );

  if (existente) {
    throw new Error("Ya existe una cuenta con ese correo.");
  }

  const salt = Crypto.randomUUID();
  const passwordHash = await generarHash(password, salt);
  const creadoEn = new Date().toISOString();

  const resultado = await db.runAsync(
    `INSERT INTO usuarios
      (nombre, correo, password_hash, salt, creado_en)
     VALUES (?, ?, ?, ?, ?)`,
    nombre.trim(),
    correoNormalizado,
    passwordHash,
    salt,
    creadoEn,
  );

  await db.runAsync(
    "INSERT OR REPLACE INTO sesion (id, usuario_id) VALUES (1, ?)",
    resultado.lastInsertRowId,
  );

  return resultado.lastInsertRowId;
}

export async function iniciarSesionLocal(correo: string, password: string) {
  const db = await getDb();

  const correoNormalizado = correo.trim().toLowerCase();

  const usuario = await db.getFirstAsync<{
    id: number;
    password_hash: string;
    salt: string;
  }>(
    `SELECT id, password_hash, salt
     FROM usuarios
     WHERE correo = ?`,
    correoNormalizado,
  );

  if (!usuario) {
    throw new Error("El correo o la contraseña son incorrectos.");
  }

  const hash = await generarHash(password, usuario.salt);

  if (hash !== usuario.password_hash) {
    throw new Error("El correo o la contraseña son incorrectos.");
  }

  await db.runAsync(
    "INSERT OR REPLACE INTO sesion (id, usuario_id) VALUES (1, ?)",
    usuario.id,
  );
}

export async function obtenerSesion(): Promise<Usuario | null> {
  const db = await getDb();

  const usuario = await db.getFirstAsync<Usuario>(
    `SELECT u.id, u.nombre, u.correo, u.creado_en
     FROM usuarios u
     INNER JOIN sesion s ON s.usuario_id = u.id
     WHERE s.id = 1`,
  );

  return usuario ?? null;
}

export async function cerrarSesion() {
  const db = await getDb();
  await db.runAsync("DELETE FROM sesion");
}

export async function recuperarPasswordLocal(
  correo: string,
  nombre: string,
  nuevaPassword: string,
) {
  const db = await getDb();

  const correoNormalizado = correo.trim().toLowerCase();
  const nombreNormalizado = nombre.trim().toLowerCase();

  const usuario = await db.getFirstAsync<{
    id: number;
    nombre: string;
  }>(`SELECT id, nombre FROM usuarios WHERE correo = ?`, correoNormalizado);

  if (!usuario || usuario.nombre.trim().toLowerCase() !== nombreNormalizado) {
    throw new Error("No encontramos una cuenta con esos datos.");
  }

  if (nuevaPassword.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  const salt = Crypto.randomUUID();
  const passwordHash = await generarHash(nuevaPassword, salt);

  await db.runAsync(
    `UPDATE usuarios
     SET password_hash = ?, salt = ?
     WHERE id = ?`,
    passwordHash,
    salt,
    usuario.id,
  );

  return true;
}
