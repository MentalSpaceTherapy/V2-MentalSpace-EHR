-- Create document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  organization_id INTEGER,
  is_global BOOLEAN NOT NULL DEFAULT FALSE,
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  approval_status TEXT NOT NULL DEFAULT 'not-submitted',
  approved_by_id INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  current_version_id INTEGER
);

-- Create template versions table
CREATE TABLE IF NOT EXISTS template_versions (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES document_templates(id),
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_latest BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  approval_status TEXT NOT NULL DEFAULT 'not-submitted',
  approved_by_id INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT
);

-- Create index on template_id for faster lookups
CREATE INDEX IF NOT EXISTS template_versions_template_id_idx ON template_versions(template_id);

-- Create index on is_latest for quicker latest version queries
CREATE INDEX IF NOT EXISTS template_versions_is_latest_idx ON template_versions(is_latest);

-- Create index on approval_status for filtering by status
CREATE INDEX IF NOT EXISTS template_versions_approval_status_idx ON template_versions(approval_status);

-- Create index on template type for filtering templates by type
CREATE INDEX IF NOT EXISTS document_templates_type_idx ON document_templates(type);

-- Create index on global templates for quick filtering
CREATE INDEX IF NOT EXISTS document_templates_is_global_idx ON document_templates(is_global);

-- Create index on template status for filtering
CREATE INDEX IF NOT EXISTS document_templates_status_idx ON document_templates(status);