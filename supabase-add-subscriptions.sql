-- ============================================================
-- Migración: Suscripciones y perfiles para Review Responder
-- Ejecutá esto en el SQL Editor de Supabase
-- ============================================================

-- Tabla de perfiles de usuario (datos extendidos)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nombre TEXT,
  stripe_customer_id TEXT,
  mercadopago_id TEXT,
  paypal_id TEXT,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Tabla de suscripciones
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_tier TEXT NOT NULL CHECK (plan_tier IN ('gratis', 'starter', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'incomplete', 'trialing')),
  gateway TEXT CHECK (gateway IN ('stripe', 'mercadopago', 'paypal', NULL)),
  gateway_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- Trigger para actualizar actualizado_en automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_perfiles
  BEFORE UPDATE ON perfiles
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_actualizar_subscriptions
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- Seguridad: RLS
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas: cada usuario solo ve sus propios datos
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON perfiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Usuarios pueden insertar su propio perfil"
  ON perfiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON perfiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Usuarios pueden ver su propia suscripción"
  ON subscriptions FOR SELECT
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden insertar su propia suscripción"
  ON subscriptions FOR INSERT
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su propia suscripción"
  ON subscriptions FOR UPDATE
  USING (usuario_id = auth.uid());

-- Índices
CREATE INDEX idx_subscriptions_usuario ON subscriptions(usuario_id);
CREATE INDEX idx_subscriptions_gateway ON subscriptions(gateway);
CREATE INDEX idx_perfiles_stripe ON perfiles(stripe_customer_id);

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION crear_perfil_al_registrarse()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfiles (id, email, nombre)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nombre');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_crear_perfil
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION crear_perfil_al_registrarse();
