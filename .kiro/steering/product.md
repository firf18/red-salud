---
inclusion: always
---

# Red-Salud Product Context

Red-Salud is a healthcare telemedicine platform connecting patients with medical professionals for online consultations and health management.

## User Roles & Permissions

- **paciente**: End users accessing medical services, managing health records
- **doctor**: Healthcare providers offering consultations, accessing patient data
- **admin**: Platform administrators with full system access

Role-based routing: `/dashboard/{role}` (e.g., `/dashboard/paciente`)

## Language & Localization

- Primary language: **Spanish (es_ES)**
- All user-facing text, error messages, and validation messages must be in Spanish
- Form labels, buttons, notifications, and UI text in Spanish
- Comments and technical documentation can be in English

## Core Domain Features

### Authentication & Security
- Multi-provider auth (email/password, Google OAuth)
- Role-based access control (RBAC)
- Session management with activity logging
- Rate limiting on authentication attempts

### Patient Management
- Profile management with medical history
- Document upload and management for medical records
- Health metrics tracking
- Appointment scheduling
- Medication tracking
- Laboratory results

### Medical Services
- Telemedicine video consultations
- Messaging between patients and doctors
- Medical record access and sharing
- Prescription management

### Administrative
- User verification (doctors via SACS system)
- Payment method management
- Transaction tracking
- System monitoring and logs

## Data Privacy & Compliance

- Handle all medical data as sensitive/confidential
- Log user activities for audit trails
- Implement proper access controls for medical records
- Never expose PII in logs or error messages

## Business Rules

- Doctor verification required before providing services (SACS integration)
- Patient profiles must be complete before booking appointments
- All medical consultations require proper authentication
- Activity logging required for compliance and audit purposes
