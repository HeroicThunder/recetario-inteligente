import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";

export type Ingrediente = {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  caducidad: string | null;
};

export type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  creado_en: string;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("recetario.db");
  }
  return dbPromise;
}

// --------------------------------------------------
// BASE DE DATOS Y MIGRACIÓN
// --------------------------------------------------

export async function iniciarDb() {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ingredientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      cantidad REAL NOT NULL,
      unidad TEXT NOT NULL,
      caducidad TEXT,
      usuario_id INTEGER
    );
  `);

  // Compatibilidad con instalaciones anteriores.
  // Agrega usuario_id sin borrar los ingredientes.
  const columnas = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(ingredientes)",
  );

  const existeUsuarioId = columnas.some(
    (columna) => columna.name === "usuario_id",
  );

  if (!existeUsuarioId) {
    await db.execAsync(
      "ALTER TABLE ingredientes ADD COLUMN usuario_id INTEGER",
    );
  }

  // Tablas nuevas: lista de compras, favoritos y registro de preparaciones.
  // Se crean sin borrar ni modificar los ingredientes existentes.
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      cantidad REAL NOT NULL,
      unidad TEXT NOT NULL,
      comprado INTEGER NOT NULL DEFAULT 0,
      receta_origen TEXT,
      creado_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS favoritos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      receta_json TEXT NOT NULL,
      foto_uri TEXT,
      creado_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS preparaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      receta_nombre TEXT NOT NULL,
      receta_json TEXT NOT NULL,
      foto_uri TEXT,
      ingredientes_descontados INTEGER NOT NULL DEFAULT 0,
      terminado_en TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ingredientes_usuario
      ON ingredientes(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_compras_usuario
      ON compras(usuario_id, comprado);
    CREATE INDEX IF NOT EXISTS idx_favoritos_usuario
      ON favoritos(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_preparaciones_usuario
      ON preparaciones(usuario_id);
  `);
}

// --------------------------------------------------
// AUTENTICACIÓN
// --------------------------------------------------

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

  await db.execAsync(`
  CREATE TABLE IF NOT EXISTS identidades_supabase (
    supabase_uid TEXT PRIMARY KEY NOT NULL,
    usuario_id INTEGER NOT NULL UNIQUE,
    creado_en TEXT NOT NULL,
    FOREIGN KEY (usuario_id)
      REFERENCES usuarios(id)
      ON DELETE CASCADE
  );
`);

  // Los ingredientes anteriores pertenecen a la primera
  // cuenta registrada, no a la persona que inicie sesión después.
  await db.runAsync(`
    UPDATE ingredientes
    SET usuario_id = (
      SELECT id FROM usuarios ORDER BY id ASC LIMIT 1
    )
    WHERE usuario_id IS NULL
      AND EXISTS (SELECT 1 FROM usuarios)
  `);
}

export async function obtenerOCrearUsuarioSupabase(
  supabaseUid: string,
  correo: string,
  nombre: string,
): Promise<number> {
  const db = await getDb();
  const correoNormalizado = correo.toLowerCase().trim();

  // 1. Buscar si ya existe una vinculación con Supabase.
  const identidad = await db.getFirstAsync<{ usuario_id: number }>(
    `SELECT usuario_id
     FROM identidades_supabase
     WHERE supabase_uid = ?`,
    [supabaseUid],
  );

  if (identidad) {
    await db.runAsync(
      `INSERT OR REPLACE INTO sesion (id, usuario_id)
       VALUES (1, ?)`,
      [identidad.usuario_id],
    );

    return identidad.usuario_id;
  }

  // 2. Buscar si ya existe un usuario local con ese correo.
  const usuarioExistente = await db.getFirstAsync<{ id: number }>(
    `SELECT id
     FROM usuarios
     WHERE LOWER(correo) = ?`,
    [correoNormalizado],
  );

  let usuarioId: number;

  if (usuarioExistente) {
    // Reutilizar el usuario local existente.
    usuarioId = usuarioExistente.id;
  } else {
    // Crear un usuario local nuevo.
    const resultado = await db.runAsync(
      `INSERT INTO usuarios
       (nombre, correo, password_hash, salt, creado_en)
       VALUES (?, ?, ?, ?, ?)`,
      [
        nombre || "Usuario",
        correoNormalizado,
        "",
        "",
        new Date().toISOString(),
      ],
    );

    usuarioId = resultado.lastInsertRowId;
  }

  // 3. Vincular el usuario local con Supabase.
  await db.runAsync(
    `INSERT INTO identidades_supabase
     (supabase_uid, usuario_id, creado_en)
     VALUES (?, ?, ?)`,
    [supabaseUid, usuarioId, new Date().toISOString()],
  );

  // 4. Guardar la sesión local.
  await db.runAsync(
    `INSERT OR REPLACE INTO sesion (id, usuario_id)
     VALUES (1, ?)`,
    [usuarioId],
  );

  return usuarioId;
}

async function obtenerUsuarioActualId(): Promise<number> {
  const db = await getDb();

  const sesion = await db.getFirstAsync<{ usuario_id: number }>(
    "SELECT usuario_id FROM sesion WHERE id = 1",
  );

  if (!sesion) {
    throw new Error("Debes iniciar sesión para acceder a tu despensa.");
  }

  return sesion.usuario_id;
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

  const usuarioId = resultado.lastInsertRowId;

  // Si es la primera cuenta, recibe los ingredientes
  // antiguos que todavía no tengan propietario.
  await db.runAsync(
    `UPDATE ingredientes
     SET usuario_id = ?
     WHERE usuario_id IS NULL
       AND (SELECT COUNT(*) FROM usuarios) = 1`,
    usuarioId,
  );

  await db.runAsync(
    "INSERT OR REPLACE INTO sesion (id, usuario_id) VALUES (1, ?)",
    usuarioId,
  );

  return usuarioId;
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
  }>("SELECT id, nombre FROM usuarios WHERE correo = ?", correoNormalizado);

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

// --------------------------------------------------
// DESPENSA POR USUARIO
// --------------------------------------------------

export async function listarIngredientes(): Promise<Ingrediente[]> {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();

  return db.getAllAsync<Ingrediente>(
    `SELECT id, nombre, cantidad, unidad, caducidad
     FROM ingredientes
     WHERE usuario_id = ?
     ORDER BY nombre`,
    usuarioId,
  );
}

export async function agregarIngrediente(
  nombre: string,
  cantidad: number,
  unidad: string,
  caducidad: string | null = null,
) {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();

  await db.runAsync(
    `INSERT INTO ingredientes
      (nombre, cantidad, unidad, caducidad, usuario_id)
     VALUES (?, ?, ?, ?, ?)`,
    nombre,
    cantidad,
    unidad,
    caducidad,
    usuarioId,
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
  const usuarioId = await obtenerUsuarioActualId();

  await db.runAsync(
    `UPDATE ingredientes
     SET nombre = ?, cantidad = ?, unidad = ?, caducidad = ?
     WHERE id = ? AND usuario_id = ?`,
    nombre,
    cantidad,
    unidad,
    caducidad,
    id,
    usuarioId,
  );
}

export async function eliminarIngrediente(id: number) {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();

  await db.runAsync(
    "DELETE FROM ingredientes WHERE id = ? AND usuario_id = ?",
    id,
    usuarioId,
  );
}

// --------------------------------------------------
// SÚPER / COMPRAS
// --------------------------------------------------

export type ItemCompra = {
  id: number;
  nombre: string;
  cantidad: number;
  unidad: string;
  comprado: number;
  receta_origen: string | null;
  creado_en: string;
};

export async function listarCompras(): Promise<ItemCompra[]> {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  return db.getAllAsync<ItemCompra>(
    `SELECT id, nombre, cantidad, unidad, comprado, receta_origen, creado_en
     FROM compras WHERE usuario_id = ? ORDER BY comprado ASC, nombre COLLATE NOCASE`,
    usuarioId,
  );
}

export async function agregarCompra(
  nombre: string,
  cantidad: number,
  unidad: string,
  recetaOrigen: string | null = null,
) {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  if (!nombre.trim() || !Number.isFinite(cantidad) || cantidad <= 0) {
    throw new Error("Indica un ingrediente y una cantidad válida.");
  }
  await db.runAsync(
    `INSERT INTO compras (usuario_id, nombre, cantidad, unidad, receta_origen, creado_en)
     VALUES (?, ?, ?, ?, ?, ?)`,
    usuarioId,
    nombre.trim(),
    cantidad,
    unidad,
    recetaOrigen,
    new Date().toISOString(),
  );
}

export async function cambiarEstadoCompra(id: number, comprado: boolean) {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  await db.runAsync(
    "UPDATE compras SET comprado = ? WHERE id = ? AND usuario_id = ?",
    comprado ? 1 : 0,
    id,
    usuarioId,
  );
}

export async function eliminarCompra(id: number) {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  await db.runAsync(
    "DELETE FROM compras WHERE id = ? AND usuario_id = ?",
    id,
    usuarioId,
  );
}

// Confirma únicamente artículos marcados como comprados y los incorpora al stock.
// La transacción evita que se agreguen al stock sin retirar el artículo de compras.
export async function confirmarCompras() {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  await db.withTransactionAsync(async () => {
    const items = await db.getAllAsync<ItemCompra>(
      `SELECT id, nombre, cantidad, unidad, comprado, receta_origen, creado_en
       FROM compras WHERE usuario_id = ? AND comprado = 1`,
      usuarioId,
    );

    for (const item of items) {
      const existente = await db.getFirstAsync<{
        id: number;
        cantidad: number;
      }>(
        `SELECT id, cantidad FROM ingredientes
         WHERE usuario_id = ? AND lower(nombre) = lower(?) AND unidad = ? LIMIT 1`,
        usuarioId,
        item.nombre,
        item.unidad,
      );
      if (existente) {
        await db.runAsync(
          "UPDATE ingredientes SET cantidad = ? WHERE id = ? AND usuario_id = ?",
          existente.cantidad + item.cantidad,
          existente.id,
          usuarioId,
        );
      } else {
        await db.runAsync(
          `INSERT INTO ingredientes (nombre, cantidad, unidad, caducidad, usuario_id)
           VALUES (?, ?, ?, NULL, ?)`,
          item.nombre,
          item.cantidad,
          item.unidad,
          usuarioId,
        );
      }
      await db.runAsync(
        "DELETE FROM compras WHERE id = ? AND usuario_id = ?",
        item.id,
        usuarioId,
      );
    }
  });
}

// --------------------------------------------------
// FAVORITOS
// --------------------------------------------------

export type Favorito = {
  id: number;
  receta_json: string;
  foto_uri: string | null;
  creado_en: string;
};

export async function listarFavoritos(): Promise<Favorito[]> {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  return db.getAllAsync<Favorito>(
    `SELECT id, receta_json, foto_uri, creado_en
     FROM favoritos WHERE usuario_id = ? ORDER BY creado_en DESC`,
    usuarioId,
  );
}

export async function guardarFavorito(
  receta: unknown,
  fotoUri: string | null = null,
) {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  const recetaJson = JSON.stringify(receta);
  if (!recetaJson || recetaJson === "null")
    throw new Error("La receta no es válida.");
  await db.runAsync(
    `INSERT INTO favoritos (usuario_id, receta_json, foto_uri, creado_en)
     VALUES (?, ?, ?, ?)`,
    usuarioId,
    recetaJson,
    fotoUri,
    new Date().toISOString(),
  );
}

export async function actualizarFotoFavorito(
  id: number,
  fotoUri: string | null,
) {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  await db.runAsync(
    "UPDATE favoritos SET foto_uri = ? WHERE id = ? AND usuario_id = ?",
    fotoUri,
    id,
    usuarioId,
  );
}

export async function eliminarFavorito(id: number) {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  await db.runAsync(
    "DELETE FROM favoritos WHERE id = ? AND usuario_id = ?",
    id,
    usuarioId,
  );
}

// --------------------------------------------------
// HISTORIAL DE PREPARACIONES
// --------------------------------------------------

export type PreparacionGuardada = {
  id: number;
  receta_nombre: string;
  receta_json: string;
  foto_uri: string | null;
  ingredientes_descontados: number;
  terminado_en: string;
};

export async function guardarPreparacion(
  recetaNombre: string,
  receta: unknown,
  fotoUri: string | null = null,
) {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  await db.runAsync(
    `INSERT INTO preparaciones
      (usuario_id, receta_nombre, receta_json, foto_uri, ingredientes_descontados, terminado_en)
     VALUES (?, ?, ?, ?, 0, ?)`,
    usuarioId,
    recetaNombre,
    JSON.stringify(receta),
    fotoUri,
    new Date().toISOString(),
  );
}

export async function listarPreparaciones(): Promise<PreparacionGuardada[]> {
  const db = await getDb();
  const usuarioId = await obtenerUsuarioActualId();
  return db.getAllAsync<PreparacionGuardada>(
    `SELECT id, receta_nombre, receta_json, foto_uri, ingredientes_descontados, terminado_en
     FROM preparaciones WHERE usuario_id = ? ORDER BY terminado_en DESC`,
    usuarioId,
  );
}
