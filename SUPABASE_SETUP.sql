-- Ejecuta esto en el Editor SQL de Supabase para crear la estructura necesaria

CREATE TABLE choferes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo TEXT,
  foto_perfil_url TEXT,
  foto_carro_url TEXT,
  chapa TEXT,
  cobertura TEXT[],
  condiciones JSONB,
  rating_puntualidad NUMERIC DEFAULT 5.0,
  rating_trato NUMERIC DEFAULT 5.0,
  telefono_whatsapp TEXT, -- Guardar con formato 53XXXXXXXX (sin +)
  estado_suscripcion TEXT DEFAULT 'pendiente'
);

-- Función RPC para enmascarar el número (Seguridad)
CREATE OR REPLACE FUNCTION obtener_whatsapp_enmascarado(p_chofer_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (SELECT json_build_object('numero', telefono_whatsapp) FROM choferes WHERE id = p_chofer_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tabla para métricas
CREATE TABLE clics_contacto (
  id BIGSERIAL PRIMARY KEY,
  chofer_id UUID REFERENCES choferes(id),
  fecha TIMESTAMP,
  mensaje_predefinido TEXT
);
