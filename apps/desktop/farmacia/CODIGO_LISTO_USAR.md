# 📦 Código Listo para Usar

**Fecha**: 1 de Febrero, 2026
**Objetivo**: Snippets de código copy-paste para acelerar desarrollo

---

## 📋 Índice

1. [SQL Migrations](#sql-migrations)
2. [Services](#services)
3. [Hooks](#hooks)
4. [Components](#components)
5. [Pages](#pages)
6. [Rust/Tauri](#rust-tauri)
7. [Utilities](#utilities)

---

## 🗄️ SQL MIGRATIONS

### Recetas Digitales
```sql
-- ============================================
-- RECETAS DIGITALES - MIGRATION
-- ============================================

-- Tabla principal de recetas
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prescription_number VARCHAR(50) UNIQUE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_name VARCHAR(255) NOT NULL,
  doctor_license VARCHAR(50) NOT NULL,
  doctor_specialty VARCHAR(100),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dispensed', 'cancelled', 'expired')),
  notes TEXT,
  created_by UUID REFERENCES users(id)