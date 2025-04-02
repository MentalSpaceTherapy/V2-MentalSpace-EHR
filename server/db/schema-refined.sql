-- Refined Schema with improved constraints, relationships, and data types
-- For MentalSpace EHR (Electronic Health Record) system

-- Create custom types and enumerations
DO $$ BEGIN
    CREATE TYPE USER_ROLE AS ENUM (
        'administrator', 'practice_administrator', 'admin_clinician', 
        'supervisor', 'clinician', 'intern', 'scheduler', 'biller', 'user'
    );
    EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE CLIENT_STATUS AS ENUM (
        'active', 'inactive', 'archived', 'pending'
    );
    EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE SESSION_STATUS AS ENUM (
        'scheduled', 'confirmed', 'completed', 'no_show', 'cancelled'
    );
    EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE SESSION_MEDIUM AS ENUM (
        'telehealth', 'in_person', 'phone'
    );
    EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE DOCUMENT_STATUS AS ENUM (
        'draft', 'complete', 'signed', 'approved', 'rejected'
    );
    EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE BILLING_STATUS AS ENUM (
        'unbilled', 'billed', 'paid', 'partial', 'adjusted', 'write_off'
    );
    EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users (Staff) table with improved column definitions
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE CHECK (LENGTH(username) >= 3),
  email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role USER_ROLE NOT NULL,
  license_type VARCHAR(50),
  license_number VARCHAR(50),
  license_expiration_date TIMESTAMP,
  profile_image_url TEXT,
  status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'inactive', 'disabled', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0 NOT NULL CHECK (failed_login_attempts >= 0),
  locked_until TIMESTAMP WITH TIME ZONE
);

-- Table for 2FA information
CREATE TABLE IF NOT EXISTS two_factor_auth (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  secret VARCHAR(255) NOT NULL,
  recovery_codes TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  used BOOLEAN DEFAULT false NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Clients table with improved constraints
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone VARCHAR(20) CHECK (phone ~* '^\+?[0-9\- ]{10,15}$'),
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  status CLIENT_STATUS DEFAULT 'active' NOT NULL,
  primary_therapist_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  referral_source_id INTEGER,
  referral_notes TEXT,
  lead_id INTEGER,
  conversion_date TIMESTAMP WITH TIME ZONE,
  original_marketing_campaign_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  -- Client demographic and medical information
  gender VARCHAR(50),
  preferred_pronouns VARCHAR(50),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  -- Insurance information
  insurance_provider VARCHAR(100),
  insurance_policy_number VARCHAR(50),
  insurance_group_number VARCHAR(50),
  insurance_copay VARCHAR(20),
  insurance_deductible VARCHAR(20),
  insurance_effective_date DATE,
  -- Clinical information
  primary_diagnosis VARCHAR(100),
  secondary_diagnosis VARCHAR(100),
  allergies TEXT,
  medications TEXT,
  -- Portal access
  portal_enabled BOOLEAN DEFAULT false,
  portal_last_login TIMESTAMP WITH TIME ZONE,
  -- HIPAA tracking
  hipaa_signed BOOLEAN DEFAULT false,
  hipaa_signed_date TIMESTAMP WITH TIME ZONE,
  hipaa_document_id INTEGER
);

-- Sessions/Appointments table with improved data types
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL CHECK (end_time > start_time),
  session_type VARCHAR(50) NOT NULL,
  medium SESSION_MEDIUM NOT NULL DEFAULT 'telehealth',
  status SESSION_STATUS DEFAULT 'scheduled' NOT NULL,
  notes TEXT,
  location TEXT,
  cpt_code VARCHAR(10),
  reminder_sent BOOLEAN DEFAULT false,
  reminder_time TIMESTAMP WITH TIME ZONE,
  external_calendar_event_id TEXT,
  external_calendar_type VARCHAR(50),
  billing_status BILLING_STATUS DEFAULT 'unbilled',
  documentation_status VARCHAR(20) DEFAULT 'pending',
  documentation_id INTEGER,
  recurrence_rule TEXT,
  recurrence_end_date TIMESTAMP WITH TIME ZONE,
  cancel_reason TEXT,
  canceled_at TIMESTAMP WITH TIME ZONE,
  canceled_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT sessions_duration_check CHECK (
    EXTRACT(EPOCH FROM (end_time - start_time)) >= 900 -- At least 15 minutes
  )
);

-- Documentation/Notes with improved validation and relations
CREATE TABLE IF NOT EXISTS documentation (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'progress_note', 'treatment_plan', 'assessment', 'intake', 'discharge', 
    'correspondence', 'medical', 'supervision', 'collateral', 'other'
  )),
  status DOCUMENT_STATUS DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  supervisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  supervisor_approved BOOLEAN DEFAULT false,
  supervisor_approved_at TIMESTAMP WITH TIME ZONE,
  supervisor_notes TEXT,
  template_id INTEGER,
  template_version INTEGER,
  is_locked BOOLEAN DEFAULT false,
  locked_at TIMESTAMP WITH TIME ZONE,
  locked_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE sessions ADD CONSTRAINT fk_sessions_documentation 
  FOREIGN KEY (documentation_id) REFERENCES documentation(id) ON DELETE SET NULL;

-- Document Templates with versioning support
CREATE TABLE IF NOT EXISTS document_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  default_content TEXT,
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  tags TEXT[],
  is_system BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  approval_status VARCHAR(20) DEFAULT 'approved',
  organization_id INTEGER,
  is_global BOOLEAN DEFAULT true,
  current_version_id INTEGER,
  version_count INTEGER DEFAULT 1 NOT NULL
);

-- Template versions for tracking changes
CREATE TABLE IF NOT EXISTS template_versions (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft' NOT NULL,
  approved_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  is_latest BOOLEAN DEFAULT true,
  UNIQUE (template_id, version_number)
);

ALTER TABLE document_templates ADD CONSTRAINT fk_document_templates_current_version
  FOREIGN KEY (current_version_id) REFERENCES template_versions(id) ON DELETE SET NULL;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  link TEXT,
  source_id INTEGER,
  source_type VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'normal',
  expiration TIMESTAMP WITH TIME ZONE
);

-- Messages between therapists and clients
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  subject VARCHAR(255),
  category VARCHAR(20) DEFAULT 'Clinical' CHECK (category IN ('Clinical', 'Billing', 'Administrative', 'Other')),
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('client', 'therapist')),
  is_read BOOLEAN DEFAULT false NOT NULL,
  status VARCHAR(20) DEFAULT 'sent' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  attachments JSONB DEFAULT '[]',
  parent_message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
  is_automated BOOLEAN DEFAULT false
);

-- Leads model for marketing and intake
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  source VARCHAR(50),
  source_id INTEGER,
  status VARCHAR(20) DEFAULT 'new' NOT NULL,
  notes TEXT,
  stage VARCHAR(20) DEFAULT 'inquiry' NOT NULL,
  assigned_to_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  interested_services JSONB DEFAULT '[]',
  demographic_info JSONB DEFAULT '{}',
  conversion_date TIMESTAMP WITH TIME ZONE,
  marketing_campaign_id INTEGER,
  lead_score INTEGER DEFAULT 0,
  conversion_probability INTEGER DEFAULT 0 CHECK (conversion_probability BETWEEN 0 AND 100),
  last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[],
  converted_to_client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  referral_source VARCHAR(100),
  how_heard_about VARCHAR(100),
  preferred_contact_method VARCHAR(20) DEFAULT 'email'
);

-- Referral sources
CREATE TABLE IF NOT EXISTS referral_sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}',
  active_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active_status VARCHAR(20) DEFAULT 'active' NOT NULL,
  contact_person VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  notes TEXT,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  address TEXT,
  website VARCHAR(255),
  relationship VARCHAR(50),
  organization_type VARCHAR(50),
  conversion_rate DECIMAL(5,2),
  monthly_average_referrals INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  recent_referrals INTEGER DEFAULT 0
);

-- Add the foreign key constraints that were missing
ALTER TABLE clients ADD CONSTRAINT fk_clients_referral_source 
  FOREIGN KEY (referral_source_id) REFERENCES referral_sources(id) ON DELETE SET NULL;
ALTER TABLE clients ADD CONSTRAINT fk_clients_lead 
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;

-- Marketing campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' NOT NULL,
  description TEXT,
  audience TEXT,
  content JSONB DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  tags TEXT[],
  stats JSONB DEFAULT '{}',
  cc_campaign_id VARCHAR(100),
  cc_list_ids TEXT[],
  cc_template_id VARCHAR(100),
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  referral_source_id INTEGER REFERENCES referral_sources(id) ON DELETE SET NULL,
  budget DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  roi DECIMAL(10,2),
  target_leads INTEGER,
  target_conversions INTEGER,
  actual_leads INTEGER DEFAULT 0,
  actual_conversions INTEGER DEFAULT 0
);

-- Add the marketing campaign foreign key constraints
ALTER TABLE clients ADD CONSTRAINT fk_clients_marketing_campaign 
  FOREIGN KEY (original_marketing_campaign_id) REFERENCES marketing_campaigns(id) ON DELETE SET NULL;
ALTER TABLE leads ADD CONSTRAINT fk_leads_marketing_campaign 
  FOREIGN KEY (marketing_campaign_id) REFERENCES marketing_campaigns(id) ON DELETE SET NULL;

-- Marketing events
CREATE TABLE IF NOT EXISTS marketing_events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER,
  location TEXT NOT NULL,
  capacity INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'upcoming' NOT NULL,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  registration_url VARCHAR(255),
  cost DECIMAL(10,2) DEFAULT 0.00,
  marketing_campaign_id INTEGER REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  image_url VARCHAR(255),
  registration_count INTEGER DEFAULT 0,
  attendance_count INTEGER DEFAULT 0,
  referral_source_id INTEGER REFERENCES referral_sources(id) ON DELETE SET NULL,
  speakers TEXT[]
);

-- Event registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES marketing_events(id) ON DELETE CASCADE,
  lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'registered' NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  notes TEXT,
  phone VARCHAR(20),
  check_in_time TIMESTAMP WITH TIME ZONE,
  payment_status VARCHAR(20) DEFAULT 'none',
  payment_amount DECIMAL(10,2),
  payment_method VARCHAR(20),
  registration_source VARCHAR(50)
);

-- Contact history for leads and clients
CREATE TABLE IF NOT EXISTS contact_history (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  contact_type VARCHAR(50) NOT NULL,
  direction VARCHAR(20) NOT NULL,
  subject VARCHAR(255),
  content TEXT,
  contact_number INTEGER DEFAULT 1,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  duration INTEGER,
  notes TEXT,
  outcome VARCHAR(50),
  follow_up_date TIMESTAMP WITH TIME ZONE,
  follow_up_type VARCHAR(50),
  completed_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  campaign_id INTEGER REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
  email_opened BOOLEAN DEFAULT false,
  email_clicked BOOLEAN DEFAULT false,
  email_delivered BOOLEAN DEFAULT true,
  email_bounced BOOLEAN DEFAULT false,
  constant_contact_activity_id VARCHAR(100),
  CHECK (
    (lead_id IS NOT NULL AND client_id IS NULL) OR
    (lead_id IS NULL AND client_id IS NOT NULL)
  )
);

-- E-signature system
CREATE TABLE IF NOT EXISTS signature_requests (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES documentation(id) ON DELETE CASCADE,
  requested_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  requested_for_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  signature_token VARCHAR(255) NOT NULL UNIQUE,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  reminder_count INTEGER DEFAULT 0,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT
);

-- Track fields that need signatures 
CREATE TABLE IF NOT EXISTS signature_fields (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,
  field_type VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  required BOOLEAN DEFAULT true,
  x_position INTEGER,
  y_position INTEGER,
  page_number INTEGER DEFAULT 1,
  width INTEGER,
  height INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  value TEXT,
  order_index INTEGER DEFAULT 0
);

-- Audit trail for signature events
CREATE TABLE IF NOT EXISTS signature_events (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL REFERENCES signature_requests(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  event_data JSONB DEFAULT '{}'
);

-- External integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_name VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[],
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- OAuth state tracking
CREATE TABLE IF NOT EXISTS oauth_states (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  state VARCHAR(255) NOT NULL UNIQUE,
  provider_name VARCHAR(50) NOT NULL,
  redirect_uri TEXT,
  scopes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Report templates
CREATE TABLE IF NOT EXISTS report_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  config JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_run_at TIMESTAMP WITH TIME ZONE,
  schedule TEXT,
  export_formats TEXT[]
);

-- Saved reports
CREATE TABLE IF NOT EXISTS saved_reports (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  template_id INTEGER NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  parameters JSONB DEFAULT '{}',
  format VARCHAR(20) NOT NULL,
  file_url TEXT,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT false,
  size INTEGER,
  status VARCHAR(20) DEFAULT 'completed' NOT NULL,
  error_message TEXT
);

-- Analytics dashboards
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  layout JSONB DEFAULT '{}',
  widgets JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_by_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_public BOOLEAN DEFAULT false,
  category VARCHAR(50)
);

-- Staff model (more detailed than users)
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  suffix VARCHAR(20),
  type_of_clinician VARCHAR(50),
  npi_number VARCHAR(20),
  supervisor_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
  role VARCHAR(50) NOT NULL,
  roles TEXT[],
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  can_receive_texts BOOLEAN DEFAULT false,
  work_phone VARCHAR(20),
  home_phone VARCHAR(20),
  address TEXT,
  city_state VARCHAR(100),
  zip_code VARCHAR(20),
  license_state VARCHAR(2),
  license_type VARCHAR(50),
  license_number VARCHAR(50),
  license_expiration TIMESTAMP WITH TIME ZONE,
  formal_name VARCHAR(100),
  professional_title VARCHAR(100),
  languages TEXT[],
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  availability JSONB,
  specialties TEXT[],
  biography TEXT,
  hourly_rate DECIMAL(10,2),
  session_fee DECIMAL(10,2),
  accepts_insurance BOOLEAN DEFAULT true,
  insurance_panels TEXT[]
);

-- Audit log for security events
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT true
);

-- Create indexes for performance (separate file for indexes also exists)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_clients_primary_therapist ON clients(primary_therapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_therapist ON sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_documentation_client ON documentation(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(client_id, therapist_id) WHERE is_read = false;

COMMENT ON TABLE users IS 'Users of the system, including staff, clinicians, and administrators';
COMMENT ON TABLE clients IS 'Client/patient records with personal and clinical information';
COMMENT ON TABLE sessions IS 'Therapy sessions and appointments between clinicians and clients';
COMMENT ON TABLE documentation IS 'Clinical documentation including notes, treatment plans, and assessments';
COMMENT ON TABLE messages IS 'Secure messaging between clients and therapists';
COMMENT ON TABLE leads IS 'Prospective clients in the marketing/sales pipeline';
COMMENT ON TABLE marketing_campaigns IS 'Marketing campaigns for practice growth and client acquisition';
COMMENT ON TABLE signature_requests IS 'Electronic signature requests for clinical documentation';
COMMENT ON TABLE audit_logs IS 'Security audit trail for compliance and monitoring'; 