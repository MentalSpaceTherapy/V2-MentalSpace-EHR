-- Performance indexes for MentalSpace EHR Database

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_primary_therapist ON clients(primary_therapist_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_lead_id ON clients(lead_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_clients_referral_source ON clients(referral_source_id);

-- Sessions/Appointments table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_therapist ON sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_medium ON sessions(medium);
CREATE INDEX IF NOT EXISTS idx_sessions_billing_status ON sessions(billing_status);
CREATE INDEX IF NOT EXISTS idx_sessions_documentation_status ON sessions(documentation_status);
CREATE INDEX IF NOT EXISTS idx_sessions_date_range ON sessions(start_time, end_time);

-- Documentation/Notes index
CREATE INDEX IF NOT EXISTS idx_documentation_client ON documentation(client_id);
CREATE INDEX IF NOT EXISTS idx_documentation_therapist ON documentation(therapist_id);
CREATE INDEX IF NOT EXISTS idx_documentation_session ON documentation(session_id);
CREATE INDEX IF NOT EXISTS idx_documentation_type ON documentation(type);
CREATE INDEX IF NOT EXISTS idx_documentation_status ON documentation(status);
CREATE INDEX IF NOT EXISTS idx_documentation_created_at ON documentation(created_at);
CREATE INDEX IF NOT EXISTS idx_documentation_due_date ON documentation(due_date);

-- Notifications index
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Messages index
CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_therapist ON messages(therapist_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);
CREATE INDEX IF NOT EXISTS idx_messages_client_therapist ON messages(client_id, therapist_id);

-- Leads index
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_date_added ON leads(date_added);
CREATE INDEX IF NOT EXISTS idx_leads_marketing_campaign ON leads(marketing_campaign_id);

-- Marketing Campaigns index
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON marketing_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_by ON marketing_campaigns(created_by_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_date_range ON marketing_campaigns(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_cc_campaign_id ON marketing_campaigns(cc_campaign_id);

-- Marketing Events index
CREATE INDEX IF NOT EXISTS idx_marketing_events_status ON marketing_events(status);
CREATE INDEX IF NOT EXISTS idx_marketing_events_type ON marketing_events(type);
CREATE INDEX IF NOT EXISTS idx_marketing_events_date ON marketing_events(date);
CREATE INDEX IF NOT EXISTS idx_marketing_events_created_by ON marketing_events(created_by_id);

-- Event Registrations index
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_lead ON event_registrations(lead_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_client ON event_registrations(client_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_date ON event_registrations(registration_date);

-- Contact History index
CREATE INDEX IF NOT EXISTS idx_contact_history_lead ON contact_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_client ON contact_history(client_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_type ON contact_history(contact_type);
CREATE INDEX IF NOT EXISTS idx_contact_history_date ON contact_history(date);
CREATE INDEX IF NOT EXISTS idx_contact_history_completed_by ON contact_history(completed_by_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_campaign ON contact_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_outcome ON contact_history(outcome);
CREATE INDEX IF NOT EXISTS idx_contact_history_follow_up ON contact_history(follow_up_date);

-- Referral Sources index
CREATE INDEX IF NOT EXISTS idx_referral_sources_type ON referral_sources(type);
CREATE INDEX IF NOT EXISTS idx_referral_sources_status ON referral_sources(active_status);
CREATE INDEX IF NOT EXISTS idx_referral_sources_created_by ON referral_sources(created_by_id);

-- Document Templates index
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);
CREATE INDEX IF NOT EXISTS idx_document_templates_status ON document_templates(status);
CREATE INDEX IF NOT EXISTS idx_document_templates_created_by ON document_templates(created_by_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_is_system ON document_templates(is_system);

-- Template Versions index
CREATE INDEX IF NOT EXISTS idx_template_versions_template ON template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_version ON template_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_template_versions_status ON template_versions(status);
CREATE INDEX IF NOT EXISTS idx_template_versions_created_by ON template_versions(created_by_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_approved_by ON template_versions(approved_by_id);

-- Signature Requests index
CREATE INDEX IF NOT EXISTS idx_signature_requests_document ON signature_requests(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_requested_by ON signature_requests(requested_by_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_requested_for ON signature_requests(requested_for_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_status ON signature_requests(status);
CREATE INDEX IF NOT EXISTS idx_signature_requests_token ON signature_requests(signature_token);
CREATE INDEX IF NOT EXISTS idx_signature_requests_requested_at ON signature_requests(requested_at);
CREATE INDEX IF NOT EXISTS idx_signature_requests_expires_at ON signature_requests(expires_at);

-- Signature Fields index
CREATE INDEX IF NOT EXISTS idx_signature_fields_request ON signature_fields(request_id);
CREATE INDEX IF NOT EXISTS idx_signature_fields_type ON signature_fields(field_type);
CREATE INDEX IF NOT EXISTS idx_signature_fields_required ON signature_fields(required);
CREATE INDEX IF NOT EXISTS idx_signature_fields_page ON signature_fields(page_number);
CREATE INDEX IF NOT EXISTS idx_signature_fields_completed ON signature_fields(completed_at);

-- Signature Events index
CREATE INDEX IF NOT EXISTS idx_signature_events_request ON signature_events(request_id);
CREATE INDEX IF NOT EXISTS idx_signature_events_type ON signature_events(event_type);
CREATE INDEX IF NOT EXISTS idx_signature_events_timestamp ON signature_events(timestamp);

-- Integrations index
CREATE INDEX IF NOT EXISTS idx_integrations_user ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider_name);
CREATE INDEX IF NOT EXISTS idx_integrations_provider_user ON integrations(provider_user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_expires ON integrations(token_expires_at);

-- OAuth States index
CREATE INDEX IF NOT EXISTS idx_oauth_states_user ON oauth_states(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_states_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_states_provider ON oauth_states(provider_name);
CREATE INDEX IF NOT EXISTS idx_oauth_states_used ON oauth_states(used);
CREATE INDEX IF NOT EXISTS idx_oauth_states_expires ON oauth_states(expires_at);

-- Report Templates index
CREATE INDEX IF NOT EXISTS idx_report_templates_category ON report_templates(category);
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(type);
CREATE INDEX IF NOT EXISTS idx_report_templates_created_by ON report_templates(created_by_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_is_public ON report_templates(is_public);

-- Saved Reports index
CREATE INDEX IF NOT EXISTS idx_saved_reports_template ON saved_reports(template_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_created_by ON saved_reports(created_by_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_created_at ON saved_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_reports_expires ON saved_reports(expires_at);
CREATE INDEX IF NOT EXISTS idx_saved_reports_is_archived ON saved_reports(is_archived);
CREATE INDEX IF NOT EXISTS idx_saved_reports_status ON saved_reports(status);

-- Analytics Dashboards index
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_created_by ON analytics_dashboards(created_by_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_is_default ON analytics_dashboards(is_default);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_category ON analytics_dashboards(category);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_is_public ON analytics_dashboards(is_public);

-- Staff index
CREATE INDEX IF NOT EXISTS idx_staff_supervisor ON staff(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_license_expiration ON staff(license_expiration);
CREATE INDEX IF NOT EXISTS idx_staff_name ON staff(last_name, first_name);

-- Session table index
CREATE INDEX IF NOT EXISTS idx_session_expired ON "session"(expire);

-- Create partial indexes for frequently filtered queries
CREATE INDEX IF NOT EXISTS idx_leads_active ON leads(assigned_to_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sessions_upcoming ON sessions(start_time) WHERE status = 'scheduled' AND start_time > NOW();
CREATE INDEX IF NOT EXISTS idx_documentation_pending ON documentation(due_date) WHERE status = 'draft' AND due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(client_id, therapist_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_signature_requests_pending ON signature_requests(expires_at) WHERE status = 'pending';

-- Create text search indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_documentation_content_gin ON documentation USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_clients_search_gin ON clients USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, '')));
CREATE INDEX IF NOT EXISTS idx_messages_content_gin ON messages USING gin(to_tsvector('english', content));

-- Create composite indexes for frequently joined tables
CREATE INDEX IF NOT EXISTS idx_sessions_client_therapist ON sessions(client_id, therapist_id);
CREATE INDEX IF NOT EXISTS idx_documentation_client_type ON documentation(client_id, type);
CREATE INDEX IF NOT EXISTS idx_documentation_therapist_status ON documentation(therapist_id, status);
CREATE INDEX IF NOT EXISTS idx_client_therapist_period ON sessions(client_id, therapist_id, start_time);

-- Create indexes for password reset and two-factor auth
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user ON two_factor_auth(user_id);

-- Create indexes for audit trail tables if they exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Create special indexes for reporting and analytics queries
CREATE INDEX IF NOT EXISTS idx_sessions_month_year ON sessions(EXTRACT(YEAR FROM start_time), EXTRACT(MONTH FROM start_time));
CREATE INDEX IF NOT EXISTS idx_clients_created_month_year ON clients(EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at));
CREATE INDEX IF NOT EXISTS idx_marketing_campaign_success ON marketing_campaigns(id) 
    WHERE status = 'completed' AND total_sent > 0 AND total_opened > 0;

-- Add btree_gin extension for more advanced indexing if needed
-- CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Comment on the purpose of each index section for documentation
COMMENT ON INDEX idx_users_role IS 'Improves filtering users by role for access control';
COMMENT ON INDEX idx_clients_primary_therapist IS 'Improves therapist lookups of their client lists';
COMMENT ON INDEX idx_sessions_client IS 'Speeds up client appointment history queries';
COMMENT ON INDEX idx_documentation_therapist IS 'Improves lookup of documents by therapist';
COMMENT ON INDEX idx_messages_is_read IS 'Speeds up unread message queries';
COMMENT ON INDEX idx_leads_status IS 'Improves filtering of leads by status';
COMMENT ON INDEX idx_marketing_campaigns_status IS 'Speeds up active campaign queries';
COMMENT ON INDEX idx_signature_requests_status IS 'Improves filtering of pending signature requests';
COMMENT ON INDEX idx_documentation_content_gin IS 'Enables full-text searching within documentation content';
COMMENT ON INDEX idx_clients_search_gin IS 'Enables full-text searching of clients by name and email';
COMMENT ON INDEX idx_sessions_client_therapist IS 'Optimizes client-therapist session history lookups';
COMMENT ON INDEX idx_password_reset_tokens_token IS 'Speeds up password reset token validation';
COMMENT ON INDEX idx_sessions_month_year IS 'Optimizes date-based analytics and reporting queries'; 