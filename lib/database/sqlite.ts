// @ts-nocheck
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cuber.db');

// ============================================
//         TIPOS
// ============================================
export interface Chofer {
  id: number;
  nombre_completo: string;
  ci: string;
  chapa: string;
  telefono_whatsapp: string;
  cobertura: string[];
  condiciones: { horario_habitual: string; notas_extra: string };
  foto_perfil_url: string | null;
  foto_carro_url: string | null;
  estado_suscripcion: 'pendiente' | 'activo' | 'suspendido';
  rating_trato: number;
  created_at: string;
}

export interface Usuario {
  id: number;
  ci: string;
  password: string;
  role: 'admin' | 'chofer';
  nombre: string;
  chofer_id: number | null;
  created_at: string;
}

// ============================================
//         INICIALIZACIÓN
// ============================================
export function initDatabase() {
  // Eliminar tabla antigua si existe (SOLO PARA MIGRACIÓN)
  db.execSync(`DROP TABLE IF EXISTS usuarios;`);
  db.execSync(`DROP TABLE IF EXISTS choferes;`);

  // Crear tabla choferes
  db.execSync(`
    CREATE TABLE IF NOT EXISTS choferes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_completo TEXT NOT NULL,
      ci TEXT NOT NULL UNIQUE,
      chapa TEXT NOT NULL,
      telefono_whatsapp TEXT NOT NULL,
      cobertura TEXT DEFAULT '[]',
      condiciones TEXT DEFAULT '{}',
      foto_perfil_url TEXT,
      foto_carro_url TEXT,
      estado_suscripcion TEXT DEFAULT 'pendiente',
      rating_trato REAL DEFAULT 5.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Crear tabla usuarios con columna ci
  db.execSync(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ci TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'chofer',
      nombre TEXT NOT NULL,
      chofer_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chofer_id) REFERENCES choferes(id)
    );
  `);

  // Admin por defecto
  const adminCount = (db.getAllSync(`SELECT COUNT(*) as c FROM usuarios WHERE role = 'admin'`)[0] as any)?.c || 0;
  if (adminCount === 0) {
    db.runSync(
      `INSERT INTO usuarios (ci, password, role, nombre) VALUES (?, ?, ?, ?)`,
      ['00000000000', 'admin123', 'admin', 'Administrador Principal']
    );
  }

  // Chofer demo
  const choferesCount = (db.getAllSync(`SELECT COUNT(*) as c FROM choferes`)[0] as any)?.c || 0;
  if (choferesCount === 0) {
    const result = db.runSync(
      `INSERT INTO choferes (nombre_completo, ci, chapa, telefono_whatsapp, cobertura, condiciones, estado_suscripcion) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['Armando Pérez', '89012345678', 'B123456', '5355555555', '["provincial"]', '{"horario_habitual":"Lun-Sáb"}', 'activo']
    );
    const choferId = result.lastInsertRowId;
    
    db.runSync(
      `INSERT INTO usuarios (ci, password, role, nombre, chofer_id) VALUES (?, ?, ?, ?, ?)`,
      ['89012345678', 'chofer123', 'chofer', 'Armando Pérez', choferId]
    );
  }

  // DEBUG
  const users = db.getAllSync(`SELECT ci, password, role, nombre FROM usuarios`);
  console.log('📋 USUARIOS:', JSON.stringify(users, null, 2));
}

// ============================================
//         LOGIN CON CI + CONTRASEÑA
// ============================================
export function login(ci: string, password: string): { user: any; profile: Usuario } | null {
  const rows = db.getAllSync(
    `SELECT * FROM usuarios WHERE ci = ? AND password = ?`,
    [ci, password]
  );
  
  if (rows.length === 0) return null;
  
  const profile = rows[0] as Usuario;
  const { password: _, ...user } = profile;
  return { user, profile };
}

// ============================================
//         CHOFERES
// ============================================
export function getChoferes(filtro?: { estado?: string }): Chofer[] {
  let query = `SELECT * FROM choferes`;
  if (filtro?.estado) query += ` WHERE estado_suscripcion = '${filtro.estado}'`;
  query += ` ORDER BY rating_trato DESC`;
  
  const rows = db.getAllSync(query);
  return rows.map((row: any) => ({
    ...row,
    cobertura: JSON.parse(row.cobertura || '[]'),
    condiciones: JSON.parse(row.condiciones || '{}'),
  }));
}

export function getChoferById(id: number): Chofer | null {
  const rows = db.getAllSync(`SELECT * FROM choferes WHERE id = ?`, [id]);
  if (rows.length === 0) return null;
  const row = rows[0] as any;
  return {
    ...row,
    cobertura: JSON.parse(row.cobertura || '[]'),
    condiciones: JSON.parse(row.condiciones || '{}'),
  };
}

export function createChofer(
  chofer: Omit<Chofer, 'id' | 'created_at'>,
  password: string
): number {
  const result = db.runSync(
    `INSERT INTO choferes (nombre_completo, ci, chapa, telefono_whatsapp, cobertura, condiciones, foto_perfil_url, foto_carro_url, estado_suscripcion, rating_trato) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      chofer.nombre_completo, chofer.ci, chofer.chapa, chofer.telefono_whatsapp,
      JSON.stringify(chofer.cobertura || []), JSON.stringify(chofer.condiciones || {}),
      chofer.foto_perfil_url || null, chofer.foto_carro_url || null,
      chofer.estado_suscripcion || 'pendiente', chofer.rating_trato || 5.0
    ]
  );
  const choferId = result.lastInsertRowId;
  
  db.runSync(
    `INSERT INTO usuarios (ci, password, role, nombre, chofer_id) VALUES (?, ?, 'chofer', ?, ?)`,
    [chofer.ci, password, chofer.nombre_completo, choferId]
  );
  
  return choferId;
}

export function updateChofer(id: number, updates: Partial<Chofer>): void {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.nombre_completo !== undefined) { fields.push('nombre_completo = ?'); values.push(updates.nombre_completo); }
  if (updates.ci !== undefined) { fields.push('ci = ?'); values.push(updates.ci); }
  if (updates.chapa !== undefined) { fields.push('chapa = ?'); values.push(updates.chapa); }
  if (updates.telefono_whatsapp !== undefined) { fields.push('telefono_whatsapp = ?'); values.push(updates.telefono_whatsapp); }
  if (updates.cobertura !== undefined) { fields.push('cobertura = ?'); values.push(JSON.stringify(updates.cobertura)); }
  if (updates.condiciones !== undefined) { fields.push('condiciones = ?'); values.push(JSON.stringify(updates.condiciones)); }
  if (updates.foto_perfil_url !== undefined) { fields.push('foto_perfil_url = ?'); values.push(updates.foto_perfil_url); }
  if (updates.foto_carro_url !== undefined) { fields.push('foto_carro_url = ?'); values.push(updates.foto_carro_url); }
  if (updates.estado_suscripcion !== undefined) { fields.push('estado_suscripcion = ?'); values.push(updates.estado_suscripcion); }
  if (updates.rating_trato !== undefined) { fields.push('rating_trato = ?'); values.push(updates.rating_trato); }

  if (fields.length > 0) {
    values.push(id);
    db.runSync(`UPDATE choferes SET ${fields.join(', ')} WHERE id = ?`, values);
  }
}

export function deleteChofer(id: number): void {
  db.runSync(`DELETE FROM usuarios WHERE chofer_id = ?`, [id]);
  db.runSync(`DELETE FROM choferes WHERE id = ?`, [id]);
}

export function updatePerfilChofer(choferId: number, ci: string, updates: Partial<Chofer>): boolean {
  const rows = db.getAllSync(`SELECT * FROM usuarios WHERE ci = ? AND chofer_id = ?`, [ci, choferId]);
  if (rows.length === 0) return false;

  const allowedFields: (keyof Chofer)[] = ['telefono_whatsapp', 'foto_perfil_url', 'foto_carro_url', 'condiciones'];
  const filteredUpdates: Partial<Chofer> = {};
  
  for (const key of allowedFields) {
    if (updates[key] !== undefined) (filteredUpdates as any)[key] = updates[key];
  }

  updateChofer(choferId, filteredUpdates);
  return true;
}

// Inicializar
initDatabase();