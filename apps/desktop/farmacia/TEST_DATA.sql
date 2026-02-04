-- ============================================================================
-- TEST DATA FOR PHARMACY APP
-- ============================================================================
-- Este script crea datos de prueba para la app de farmacia
-- Ejecutar en Supabase SQL Editor

-- ============================================================================
-- 1. WAREHOUSE (Almacén)
-- ============================================================================

INSERT INTO warehouses (name, code, type, address, phone, is_active)
VALUES 
  ('Farmacia Principal', 'FARM-001', 'store', 'Av. Principal, Caracas', '+58-212-1234567', true),
  ('Almacén Central', 'ALM-001', 'central', 'Zona Industrial, Caracas', '+58-212-7654321', true)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 2. PRODUCTS (Productos)
-- ============================================================================

INSERT INTO products (
  sku, barcode, name, generic_name, active_ingredient,
  product_type, category, manufacturer, brand,
  cost_price_usd, cost_price_ves, sale_price_usd, sale_price_ves,
  iva_rate, iva_exempt,
  min_stock, max_stock, reorder_point,
  unit_type, units_per_box, allow_fractional_sale,
  requires_prescription, controlled_substance, psychotropic, refrigerated
)
VALUES 
  -- Analgésicos
  ('MED-001', '7501234567890', 'Paracetamol 500mg', 'Acetaminofén', 'Paracetamol',
   'medicine', 'analgesic', 'Laboratorios XYZ', 'Paracetamol',
   1.50, 54.00, 2.50, 90.00,
   0.16, false,
   20, 200, 50,
   'unit', 1, false,
   false, false, false, false),
   
  ('MED-002', '7501234567891', 'Ibuprofeno 400mg', 'Ibuprofeno', 'Ibuprofeno',
   'medicine', 'analgesic', 'Laboratorios ABC', 'Ibuprofeno',
   2.00, 72.00, 3.00, 108.00,
   0.16, false,
   20, 200, 50,
   'unit', 1, false,
   false, false, false, false),
   
  ('MED-003', '7501234567892', 'Aspirina 100mg', 'Ácido Acetilsalicílico', 'Aspirina',
   'medicine', 'analgesic', 'Bayer', 'Aspirina',
   1.00, 36.00, 1.50, 54.00,
   0.16, false,
   30, 300, 75,
   'unit', 1, false,
   false, false, false, false),
   
  -- Antibióticos
  ('MED-004', '7501234567893', 'Amoxicilina 500mg', 'Amoxicilina', 'Amoxicilina',
   'medicine', 'antibiotic', 'Laboratorios DEF', 'Amoxicilina',
   3.50, 126.00, 5.00, 180.00,
   0.16, false,
   15, 150, 40,
   'unit', 1, false,
   true, false, false, false),
   
  ('MED-005', '7501234567894', 'Azitromicina 500mg', 'Azitromicina', 'Azitromicina',
   'medicine', 'antibiotic', 'Pfizer', 'Zitromax',
   8.00, 288.00, 12.00, 432.00,
   0.16, false,
   10, 100, 25,
   'unit', 1, false,
   true, false, false, false),
   
  -- Vitaminas
  ('MED-006', '7501234567895', 'Vitamina C 1000mg', 'Ácido Ascórbico', 'Vitamina C',
   'medicine', 'vitamins', 'Laboratorios GHI', 'Redoxon',
   2.50, 90.00, 4.00, 144.00,
   0.16, false,
   25, 250, 60,
   'unit', 1, false,
   false, false, false, false),
   
  ('MED-007', '7501234567896', 'Complejo B', 'Vitaminas del Complejo B', 'Complejo B',
   'medicine', 'vitamins', 'Laboratorios JKL', 'Bedoyecta',
   3.00, 108.00, 5.00, 180.00,
   0.16, false,
   20, 200, 50,
   'unit', 1, false,
   false, false, false, false),
   
  -- Antihipertensivos
  ('MED-008', '7501234567897', 'Losartán 50mg', 'Losartán', 'Losartán',
   'medicine', 'antihypertensive', 'Laboratorios MNO', 'Cozaar',
   4.00, 144.00, 6.50, 234.00,
   0.16, false,
   15, 150, 40,
   'unit', 1, false,
   true, false, false, false),
   
  ('MED-009', '7501234567898', 'Enalapril 10mg', 'Enalapril', 'Enalapril',
   'medicine', 'antihypertensive', 'Laboratorios PQR', 'Renitec',
   3.50, 126.00, 5.50, 198.00,
   0.16, false,
   15, 150, 40,
   'unit', 1, false,
   true, false, false, false),
   
  -- Diabetes
  ('MED-010', '7501234567899', 'Metformina 850mg', 'Metformina', 'Metformina',
   'medicine', 'diabetes', 'Laboratorios STU', 'Glucophage',
   2.00, 72.00, 3.50, 126.00,
   0.16, false,
   20, 200, 50,
   'unit', 1, false,
   true, false, false, false)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================================
-- 3. BATCHES (Lotes)
-- ============================================================================

-- Obtener IDs de warehouse y productos
DO $$
DECLARE
  v_warehouse_id UUID;
  v_product_id UUID;
BEGIN
  -- Obtener warehouse ID
  SELECT id INTO v_warehouse_id FROM warehouses WHERE code = 'FARM-001' LIMIT 1;
  
  -- Insertar lotes para cada producto
  FOR v_product_id IN SELECT id FROM products LOOP
    INSERT INTO batches (
      product_id, lot_number, expiry_date, manufacturing_date,
      warehouse_id, location, zone,
      quantity, original_quantity
    )
    VALUES 
      (v_product_id, 'LOTE-' || SUBSTRING(gen_random_uuid()::text, 1, 8), 
       (CURRENT_DATE + INTERVAL '12 months')::date, 
       (CURRENT_DATE - INTERVAL '2 months')::date,
       v_warehouse_id, 'A-01-01', 'available',
       100, 100),
      (v_product_id, 'LOTE-' || SUBSTRING(gen_random_uuid()::text, 1, 8), 
       (CURRENT_DATE + INTERVAL '6 months')::date, 
       (CURRENT_DATE - INTERVAL '4 months')::date,
       v_warehouse_id, 'A-01-02', 'available',
       50, 50)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- ============================================================================
-- 4. SUPPLIERS (Proveedores)
-- ============================================================================

INSERT INTO suppliers (name, rif, contact_person, email, phone, address, payment_terms, is_active)
VALUES 
  ('Distribuidora Farmacéutica ABC', 'J-12345678-9', 'Juan Pérez', 'ventas@abc.com', '+58-212-1111111', 'Caracas, Venezuela', '30 días', true),
  ('Laboratorios XYZ C.A.', 'J-98765432-1', 'María García', 'contacto@xyz.com', '+58-212-2222222', 'Valencia, Venezuela', '45 días', true),
  ('Importadora Médica DEF', 'J-11111111-1', 'Carlos López', 'info@def.com', '+58-212-3333333', 'Maracaibo, Venezuela', '60 días', true)
ON CONFLICT (rif) DO NOTHING;

-- ============================================================================
-- 5. PATIENTS (Pacientes de prueba)
-- ============================================================================

INSERT INTO patients (first_name, last_name, ci, phone, email, date_of_birth, blood_type)
VALUES 
  ('Juan', 'Pérez', 'V-12345678', '+58-414-1234567', 'juan.perez@email.com', '1980-05-15', 'O+'),
  ('María', 'García', 'V-23456789', '+58-424-2345678', 'maria.garcia@email.com', '1975-08-22', 'A+'),
  ('Carlos', 'López', 'V-34567890', '+58-412-3456789', 'carlos.lopez@email.com', '1990-12-10', 'B+'),
  ('Ana', 'Martínez', 'V-45678901', '+58-416-4567890', 'ana.martinez@email.com', '1985-03-30', 'AB+'),
  ('Luis', 'Rodríguez', 'V-56789012', '+58-426-5678901', 'luis.rodriguez@email.com', '1992-07-18', 'O-')
ON CONFLICT (ci) DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Contar registros creados
SELECT 
  (SELECT COUNT(*) FROM warehouses) as warehouses,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM batches) as batches,
  (SELECT COUNT(*) FROM suppliers) as suppliers,
  (SELECT COUNT(*) FROM patients) as patients;

-- Ver productos con stock
SELECT 
  p.name,
  p.sku,
  p.sale_price_usd,
  SUM(b.quantity) as total_stock
FROM products p
LEFT JOIN batches b ON b.product_id = p.id
GROUP BY p.id, p.name, p.sku, p.sale_price_usd
ORDER BY p.name;

-- ============================================================================
-- NOTAS
-- ============================================================================
-- 
-- Después de ejecutar este script:
-- 1. Tendrás 10 productos de prueba
-- 2. Cada producto tendrá 2 lotes (150 unidades total)
-- 3. Tendrás 2 almacenes
-- 4. Tendrás 3 proveedores
-- 5. Tendrás 5 pacientes de prueba
--
-- Para probar la app:
-- 1. Hacer login
-- 2. Ver dashboard con KPIs
-- 3. Buscar productos en POS
-- 4. Crear una venta
-- 5. Verificar que el stock se actualiza
--
-- ============================================================================


-- ============================================================================
-- PRESCRIPTIONS TEST DATA (Recetas de Prueba)
-- ============================================================================

-- Insertar recetas de prueba
INSERT INTO prescriptions (
  prescription_number, patient_id, doctor_name, doctor_license,
  issue_date, expiry_date, status, notes
)
VALUES 
  -- Receta pendiente válida
  (
    'RX-2026-001',
    (SELECT id FROM patients LIMIT 1),
    'Dr. María García',
    'MPPS-12345',
    '2026-02-01',
    '2026-03-01',
    'pending',
    'Paciente con infección respiratoria. Completar tratamiento.'
  ),
  
  -- Receta pendiente próxima a vencer
  (
    'RX-2026-002',
    (SELECT id FROM patients LIMIT 1 OFFSET 1),
    'Dr. Carlos López',
    'MPPS-67890',
    '2026-01-25',
    '2026-02-05',
    'pending',
    'Tratamiento para hipertensión. Paciente debe tomar en ayunas.'
  ),
  
  -- Receta dispensada
  (
    'RX-2026-003',
    (SELECT id FROM patients LIMIT 1),
    'Dra. Ana Martínez',
    'MPPS-11111',
    '2026-01-28',
    '2026-02-28',
    'dispensed',
    'Tratamiento completado exitosamente.'
  ),
  
  -- Receta cancelada
  (
    'RX-2026-004',
    (SELECT id FROM patients LIMIT 1 OFFSET 1),
    'Dr. Pedro Ramírez',
    'MPPS-22222',
    '2026-01-20',
    '2026-02-20',
    'cancelled',
    'Cancelada por cambio de tratamiento médico.'
  ),
  
  -- Receta pendiente con sustancias controladas
  (
    'RX-2026-005',
    (SELECT id FROM patients LIMIT 1),
    'Dr. Luis Fernández',
    'MPPS-33333',
    '2026-02-01',
    '2026-02-15',
    'pending',
    'IMPORTANTE: Sustancia controlada. Verificar identificación del paciente.'
  )
ON CONFLICT (prescription_number) DO NOTHING;

-- Insertar items de recetas
INSERT INTO prescription_items (
  prescription_id, product_id, quantity, dosage, frequency, duration, dispensed_quantity
)
VALUES 
  -- Items para RX-2026-001 (Infección respiratoria)
  (
    (SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-001'),
    (SELECT id FROM products WHERE name LIKE '%Amoxicilina%' LIMIT 1),
    21,
    '500mg',
    'Cada 8 horas',
    '7 días',
    0
  ),
  (
    (SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-001'),
    (SELECT id FROM products WHERE name LIKE '%Ibuprofeno%' LIMIT 1),
    10,
    '400mg',
    'Cada 8 horas si hay dolor',
    '5 días',
    0
  ),
  
  -- Items para RX-2026-002 (Hipertensión)
  (
    (SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-002'),
    (SELECT id FROM products WHERE name LIKE '%Losartán%' OR name LIKE '%Enalapril%' LIMIT 1),
    30,
    '50mg',
    '1 vez al día en ayunas',
    '30 días',
    0
  ),
  
  -- Items para RX-2026-003 (Dispensada)
  (
    (SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-003'),
    (SELECT id FROM products WHERE name LIKE '%Paracetamol%' LIMIT 1),
    20,
    '500mg',
    'Cada 6 horas',
    '5 días',
    20
  ),
  (
    (SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-003'),
    (SELECT id FROM products WHERE name LIKE '%Omeprazol%' LIMIT 1),
    14,
    '20mg',
    '1 vez al día antes del desayuno',
    '14 días',
    14
  ),
  
  -- Items para RX-2026-004 (Cancelada)
  (
    (SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-004'),
    (SELECT id FROM products WHERE name LIKE '%Metformina%' LIMIT 1),
    60,
    '850mg',
    '2 veces al día con las comidas',
    '30 días',
    0
  ),
  
  -- Items para RX-2026-005 (Sustancia controlada)
  (
    (SELECT id FROM prescriptions WHERE prescription_number = 'RX-2026-005'),
    (SELECT id FROM products WHERE controlled_substance = true LIMIT 1),
    15,
    'Según indicación',
    'Cada 12 horas',
    '15 días',
    0
  )
ON CONFLICT DO NOTHING;

-- Verificar datos insertados
SELECT 
  p.prescription_number,
  p.doctor_name,
  p.status,
  p.issue_date,
  p.expiry_date,
  COUNT(pi.id) as items_count
FROM prescriptions p
LEFT JOIN prescription_items pi ON pi.prescription_id = p.id
GROUP BY p.id, p.prescription_number, p.doctor_name, p.status, p.issue_date, p.expiry_date
ORDER BY p.created_at DESC;

-- ============================================================================
-- FIN DE DATOS DE PRUEBA PARA RECETAS
-- ============================================================================
