// lib/database/mockData.ts
export interface Chofer {
  id: string;
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
}

// Datos de prueba para Holguín
export const MOCK_CHOFERES: Chofer[] = [
  {
    id: '1',
    nombre_completo: 'Armando Pérez',
    ci: '89012345678',
    chapa: 'B123456',
    telefono_whatsapp: '5355555555',
    cobertura: ['provincial', 'municipal'],
    condiciones: {
      horario_habitual: 'Lun-Sáb 7am-7pm',
      notas_extra: 'Viajes a Moa, Gibara y Mayarí'
    },
    foto_perfil_url: null,
    foto_carro_url: null,
    estado_suscripcion: 'activo',
    rating_trato: 4.8
  },
  {
    id: '2',
    nombre_completo: 'Yudith Rodríguez',
    ci: '89087654321',
    chapa: 'P654321',
    telefono_whatsapp: '5355555556',
    cobertura: ['centro_ciudad', 'municipal'],
    condiciones: {
      horario_habitual: 'Lun-Vie 8am-5pm',
      notas_extra: 'Solo dentro del perímetro de Holguín'
    },
    foto_perfil_url: null,
    foto_carro_url: null,
    estado_suscripcion: 'activo',
    rating_trato: 5.0
  },
  {
    id: '3',
    nombre_completo: 'Luis "El Yiyi" García',
    ci: '89055512345',
    chapa: 'C789012',
    telefono_whatsapp: '5355555557',
    cobertura: ['provincial'],
    condiciones: {
      horario_habitual: '24/7 previa coordinación',
      notas_extra: 'Especialista en viajes a La Habana'
    },
    foto_perfil_url: null,
    foto_carro_url: null,
    estado_suscripcion: 'pendiente',
    rating_trato: 4.5
  }
];

// Usuarios mock para login
export const MOCK_USERS = [
  {
    email: 'admin@cuber.holguin',
    password: 'admin123',
    role: 'admin',
    nombre: 'Administrador'
  },
  {
    email: 'chofer@cuber.holguin',
    password: 'chofer123',
    role: 'chofer',
    nombre: 'Chofer Demo'
  }
];

// Perfiles mock
export const MOCK_PROFILES = [
  { id: 'admin-1', email: 'admin@cuber.holguin', role: 'admin', nombre: 'Administrador' },
  { id: 'chofer-1', email: 'chofer@cuber.holguin', role: 'chofer', nombre: 'Chofer Demo' }
];