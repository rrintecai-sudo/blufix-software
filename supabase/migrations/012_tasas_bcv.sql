-- =============================================
-- 012: TASAS BCV
-- Compartida entre todos los tenants
-- =============================================

CREATE TABLE IF NOT EXISTS tasas_bcv (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date UNIQUE NOT NULL,
  tasa numeric(12,4) NOT NULL,
  fuente text DEFAULT 'api', -- 'api' | 'manual'
  created_at timestamptz DEFAULT now()
);

-- Acceso público de lectura (no requiere auth para leer tasas)
ALTER TABLE tasas_bcv ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasas_bcv_read" ON tasas_bcv
  FOR SELECT USING (true);

CREATE POLICY "tasas_bcv_insert_service" ON tasas_bcv
  FOR INSERT WITH CHECK (true);

CREATE POLICY "tasas_bcv_update_service" ON tasas_bcv
  FOR UPDATE USING (true);
