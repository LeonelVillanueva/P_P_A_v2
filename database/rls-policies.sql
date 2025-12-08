-- ============================================
-- POLÍTICAS RLS MEJORADAS PARA SEGURIDAD
-- ============================================
-- 
-- IMPORTANTE: Estas políticas mejoran la seguridad pero NO son perfectas
-- porque usas autenticación personalizada (no Supabase Auth).
-- 
-- Para máxima seguridad, considera usar Service Role Key en servidor.
-- ============================================

-- ============================================
-- 1. ELIMINAR POLÍTICAS ANTIGUAS (si existen)
-- ============================================

DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON animes;
DROP POLICY IF EXISTS "Allow read for all" ON configuracion;
DROP POLICY IF EXISTS "Allow write for authenticated users" ON configuracion;

-- ============================================
-- 2. OPCIÓN A: POLÍTICAS RESTRICTIVAS BÁSICAS
-- ============================================
-- Estas políticas validan que los datos sean válidos
-- pero NO pueden verificar autenticación (porque usas JWT personalizado)

-- Política para ANIMES: Solo lectura y escritura con validación de datos
CREATE POLICY "animes_select_policy" ON animes
  FOR SELECT
  USING (
    -- Validar que el nombre no esté vacío (protección básica)
    nombre IS NOT NULL AND length(trim(nombre)) > 0
    AND length(nombre) <= 500  -- Límite de longitud
  );

CREATE POLICY "animes_insert_policy" ON animes
  FOR INSERT
  WITH CHECK (
    -- Validar datos antes de insertar
    nombre IS NOT NULL 
    AND length(trim(nombre)) > 0 
    AND length(nombre) <= 500
    AND estado IS NOT NULL
    AND length(estado) <= 100
    AND (imagen_url IS NULL OR length(imagen_url) <= 1000)
    AND (temporadas IS NULL OR array_length(temporadas, 1) <= 50)
  );

CREATE POLICY "animes_update_policy" ON animes
  FOR UPDATE
  USING (
    -- Solo permitir actualizar si los datos son válidos
    nombre IS NOT NULL AND length(trim(nombre)) > 0
  )
  WITH CHECK (
    -- Validar datos actualizados
    nombre IS NOT NULL 
    AND length(trim(nombre)) > 0 
    AND length(nombre) <= 500
    AND estado IS NOT NULL
    AND length(estado) <= 100
    AND (imagen_url IS NULL OR length(imagen_url) <= 1000)
    AND (temporadas IS NULL OR array_length(temporadas, 1) <= 50)
  );

CREATE POLICY "animes_delete_policy" ON animes
  FOR DELETE
  USING (
    -- Permitir eliminar (sin restricción adicional por ahora)
    true
  );

-- Política para CONFIGURACIÓN: Solo lectura pública, escritura con validación
CREATE POLICY "config_select_policy" ON configuracion
  FOR SELECT
  USING (true);  -- Lectura pública permitida

CREATE POLICY "config_insert_policy" ON configuracion
  FOR INSERT
  WITH CHECK (
    -- Solo permitir insertar configuración válida
    (estados IS NULL OR array_length(estados, 1) <= 100)
    AND (temporadas IS NULL OR array_length(temporadas, 1) <= 100)
  );

CREATE POLICY "config_update_policy" ON configuracion
  FOR UPDATE
  USING (true)
  WITH CHECK (
    -- Validar datos actualizados
    (estados IS NULL OR array_length(estados, 1) <= 100)
    AND (temporadas IS NULL OR array_length(temporadas, 1) <= 100)
  );

-- ============================================
-- 3. OPCIÓN B: POLÍTICAS CON VERIFICACIÓN DE ORIGEN (Más segura)
-- ============================================
-- Descomenta esta sección si quieres restringir por origen
-- Nota: Esto requiere configurar allowed origins en Supabase

/*
-- Función para verificar origen (requiere configuración en Supabase)
CREATE OR REPLACE FUNCTION check_request_origin()
RETURNS boolean AS $$
BEGIN
  -- Verificar que el request viene de un origen permitido
  -- Esto requiere configuración adicional en Supabase
  RETURN true;  -- Por ahora permite todo
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas con verificación de origen
CREATE POLICY "animes_select_secure" ON animes
  FOR SELECT
  USING (check_request_origin() AND nombre IS NOT NULL);

CREATE POLICY "animes_insert_secure" ON animes
  FOR INSERT
  WITH CHECK (
    check_request_origin() 
    AND nombre IS NOT NULL 
    AND length(trim(nombre)) > 0
  );
*/

-- ============================================
-- 4. OPCIÓN C: DESHABILITAR RLS (NO RECOMENDADO)
-- ============================================
-- Solo si confías completamente en tu autenticación frontend
-- y no te importa que cualquiera con la anon key pueda acceder

/*
ALTER TABLE animes DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
*/

-- ============================================
-- 5. VERIFICAR POLÍTICAS CREADAS
-- ============================================

-- Ejecutar esto para ver las políticas activas:
-- SELECT * FROM pg_policies WHERE tablename = 'animes';
-- SELECT * FROM pg_policies WHERE tablename = 'configuracion';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- 1. Estas políticas NO pueden verificar tu JWT personalizado
--    porque Supabase no tiene acceso a él.
--
-- 2. La protección real viene de:
--    - Tu autenticación en frontend (LoginModal)
--    - Validación en servicios (animeService.js)
--    - Headers de seguridad (vercel.json)
--
-- 3. Para máxima seguridad:
--    - Usa Service Role Key en servidor
--    - O migra a Supabase Auth
--
-- 4. Estas políticas al menos:
--    - Validan que los datos sean correctos
--    - Previenen inyección de datos maliciosos
--    - Limitan tamaños y cantidades
--
-- ============================================

