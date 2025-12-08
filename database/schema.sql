-- Tabla de configuración (estados y temporadas personalizables)
CREATE TABLE IF NOT EXISTS configuracion (
  id INTEGER PRIMARY KEY DEFAULT 1,
  estados TEXT[] DEFAULT ARRAY['Animes Vistos', 'Estrenos', 'Sin fecha', 'Emisión', 'En espera', 'Animes faltantes de ver'],
  temporadas TEXT[] DEFAULT ARRAY['1', '2', '3', '4', '5', 'Movie', 'OVA', 'Spin off'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar configuración inicial si no existe
INSERT INTO configuracion (id, estados, temporadas)
VALUES (1, 
  ARRAY['Animes Vistos', 'Estrenos', 'Sin fecha', 'Emisión', 'En espera', 'Animes faltantes de ver'],
  ARRAY['1', '2', '3', '4', '5', 'Movie', 'OVA', 'Spin off']
)
ON CONFLICT (id) DO NOTHING;

-- Tabla de animes
CREATE TABLE IF NOT EXISTS animes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  temporadas TEXT[] DEFAULT ARRAY[]::TEXT[],
  estado TEXT NOT NULL,
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_animes_estado ON animes(estado);
CREATE INDEX IF NOT EXISTS idx_animes_created_at ON animes(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_animes_updated_at
  BEFORE UPDATE ON animes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracion_updated_at
  BEFORE UPDATE ON configuracion
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE animes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para animes (permitir todo para usuarios autenticados)
-- Nota: Si no usas autenticación, puedes deshabilitar RLS o crear políticas más permisivas
CREATE POLICY "Allow all operations for authenticated users" ON animes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Política para configuración (solo lectura para todos, escritura para autenticados)
CREATE POLICY "Allow read for all" ON configuracion
  FOR SELECT
  USING (true);

CREATE POLICY "Allow write for authenticated users" ON configuracion
  FOR ALL
  USING (true)
  WITH CHECK (true);

