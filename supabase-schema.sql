-- ============================================================
-- Esquema de base de datos para Review Responder
-- Ejecutá esto en el SQL Editor de Supabase
-- ============================================================

-- Tabla de locales registrados por cada usuario
CREATE TABLE locales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) NOT NULL,
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  google_place_id TEXT NOT NULL DEFAULT 'pendiente',
  rating_actual NUMERIC(2,1),
  total_resenas INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de reseñas obtenidas de Google Places
CREATE TABLE resenas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  local_id UUID REFERENCES locales(id) ON DELETE CASCADE NOT NULL,
  autor TEXT NOT NULL,
  rating INTEGER NOT NULL,
  texto TEXT,
  fecha_google TIMESTAMPTZ,
  respondida BOOLEAN DEFAULT false,
  respuesta_generada TEXT,
  respuesta_aprobada BOOLEAN,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- Seguridad: cada usuario solo ve sus propios datos
ALTER TABLE locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

-- Políticas para locales
CREATE POLICY "Usuarios pueden ver sus locales"
  ON locales FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden crear sus locales"
  ON locales FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar sus locales"
  ON locales FOR UPDATE
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden eliminar sus locales"
  ON locales FOR DELETE
  USING (usuario_id = auth.uid());

-- Políticas para reseñas
CREATE POLICY "Usuarios pueden ver reseñas de sus locales"
  ON resenas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM locales
      WHERE locales.id = resenas.local_id
      AND locales.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden insertar reseñas en sus locales"
  ON resenas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM locales
      WHERE locales.id = resenas.local_id
      AND locales.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden actualizar reseñas de sus locales"
  ON resenas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM locales
      WHERE locales.id = resenas.local_id
      AND locales.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden eliminar reseñas de sus locales"
  ON resenas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM locales
      WHERE locales.id = resenas.local_id
      AND locales.usuario_id = auth.uid()
    )
  );

-- Índices para rendimiento
CREATE INDEX idx_locales_usuario ON locales(usuario_id);
CREATE INDEX idx_resenas_local ON resenas(local_id);
CREATE INDEX idx_resenas_respondida ON resenas(respondida);
