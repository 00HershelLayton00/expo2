export interface Chofer {
  id: number;
  nombre_completo: string;
  ci: string;
  chapa: string;
  telefono_whatsapp: string;
  cobertura: string[];
  condiciones: {
    horario_habitual: string;
    tarifa_centro?: string;
    tarifa_municipal?: string;
    tarifa_provincial?: string;
    notas_extra: string;
  };
  foto_perfil_url: string | null;
  foto_carro_url: string | null;
  estado_suscripcion: 'pendiente' | 'activo' | 'suspendido';
  rating_trato: number;
  created_at: string;
}

export interface Usuario {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'chofer';
  nombre: string;
  chofer_id: number | null;
  created_at: string;
}

export type UserRole = 'admin' | 'chofer';