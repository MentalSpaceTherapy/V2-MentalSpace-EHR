-- Migration: optimize_database_indexes
-- Created at: 2024-07-01T00:00:02.000Z
-- Description: Add indexes to improve database performance on frequently accessed fields

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_primary_therapist ON clients(primary_therapist_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_search 
    ON clients USING gin(to_tsvector('english', 
        coalesce(first_name,'') || ' ' || 
        coalesce(last_name,'') || ' ' || 
        coalesce(email,'') || ' ' || 
        coalesce(phone,'')
    ));

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_therapist ON sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date_range ON sessions(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_sessions_medium ON sessions(medium);

-- Documentation indexes
CREATE INDEX IF NOT EXISTS idx_documentation_client ON documentation(client_id);
CREATE INDEX IF NOT EXISTS idx_documentation_therapist ON documentation(therapist_id);
CREATE INDEX IF NOT EXISTS idx_documentation_session ON documentation(session_id);
CREATE INDEX IF NOT EXISTS idx_documentation_type ON documentation(type);
CREATE INDEX IF NOT EXISTS idx_documentation_status ON documentation(status);
CREATE INDEX IF NOT EXISTS idx_documentation_date ON documentation(created_at);
CREATE INDEX IF NOT EXISTS idx_documentation_search 
    ON documentation USING gin(to_tsvector('english', 
        coalesce(title,'') || ' ' || 
        coalesce(content,'')
    ));

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_client ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_therapist ON messages(therapist_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender);
CREATE INDEX IF NOT EXISTS idx_messages_category ON messages(category);
CREATE INDEX IF NOT EXISTS idx_messages_date ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_search 
    ON messages USING gin(to_tsvector('english', 
        coalesce(subject,'') || ' ' || 
        coalesce(content,'')
    ));

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_name ON staff(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_supervisor ON staff(supervisor_id);

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_name ON leads(name);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_date ON leads(date_added);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);

-- Marketing campaigns indexes
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON marketing_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_date_range ON marketing_campaigns(start_date, end_date);

-- Event registrations indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_name ON event_registrations(name);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- Contact history indexes
CREATE INDEX IF NOT EXISTS idx_contact_history_lead ON contact_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_client ON contact_history(client_id);
CREATE INDEX IF NOT EXISTS idx_contact_history_type ON contact_history(contact_type);
CREATE INDEX IF NOT EXISTS idx_contact_history_date ON contact_history(date);
CREATE INDEX IF NOT EXISTS idx_contact_history_outcome ON contact_history(outcome);

-- Create a function for cleanup of old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete expired password reset tokens
    DELETE FROM password_reset_tokens
    WHERE expires_at < NOW();
    
    -- Archive old notifications (more than 6 months old)
    UPDATE notifications
    SET archived = true
    WHERE created_at < NOW() - INTERVAL '6 months'
    AND archived = false;
    
    -- Log the cleanup
    RAISE NOTICE 'Cleanup completed: % expired tokens deleted, % old notifications archived',
        (SELECT count(*) FROM password_reset_tokens WHERE expires_at < NOW()),
        (SELECT count(*) FROM notifications WHERE created_at < NOW() - INTERVAL '6 months' AND archived = false);
END;
$$ LANGUAGE plpgsql;

-- Comment the function
COMMENT ON FUNCTION cleanup_old_data() IS 'Periodic cleanup function for expired tokens and old data'; 