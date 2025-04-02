import pg from 'pg';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Bing@@0912',
  database: 'mental_space_ehr',
});

async function main() {
  try {
    // Create tables in order of dependencies
    const createTableQueries = [
      // Users table first since it's referenced by many others
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        license_type TEXT,
        license_number TEXT,
        license_expiration_date TIMESTAMP,
        profile_image_url TEXT,
        status TEXT NOT NULL DEFAULT 'active'
      )`,

      // Staff table
      `CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT NOT NULL,
        suffix TEXT,
        type_of_clinician TEXT,
        npi_number TEXT,
        supervisor_id INTEGER,
        role TEXT,
        roles TEXT[],
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        can_receive_texts BOOLEAN DEFAULT false,
        work_phone TEXT,
        home_phone TEXT,
        address TEXT,
        city_state TEXT,
        zip_code TEXT,
        license_state TEXT,
        license_type TEXT,
        license_number TEXT,
        license_expiration TEXT,
        formal_name TEXT,
        title TEXT,
        languages TEXT[],
        status TEXT DEFAULT 'active' NOT NULL,
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,

      // Report templates
      `CREATE TABLE IF NOT EXISTS report_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        config JSONB DEFAULT '{}',
        is_public BOOLEAN DEFAULT false,
        created_by_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        last_run_at TIMESTAMP,
        schedule TEXT,
        export_formats TEXT[],
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      )`,

      // Saved reports
      `CREATE TABLE IF NOT EXISTS saved_reports (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        template_id INTEGER,
        data JSONB DEFAULT '{}',
        parameters JSONB DEFAULT '{}',
        format TEXT NOT NULL,
        file_url TEXT,
        created_by_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        expires_at TIMESTAMP,
        is_archived BOOLEAN DEFAULT false,
        size INTEGER,
        status TEXT DEFAULT 'completed' NOT NULL,
        error_message TEXT,
        FOREIGN KEY (template_id) REFERENCES report_templates(id),
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      )`,

      // Analytics dashboards
      `CREATE TABLE IF NOT EXISTS analytics_dashboards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        layout JSONB DEFAULT '{}',
        widgets JSONB DEFAULT '[]',
        is_default BOOLEAN DEFAULT false,
        created_by_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        is_public BOOLEAN DEFAULT false,
        category TEXT,
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      )`,

      // Referral sources
      `CREATE TABLE IF NOT EXISTS referral_sources (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        details JSONB DEFAULT '{}',
        active_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        active_status TEXT DEFAULT 'active' NOT NULL,
        contact_person TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        notes TEXT,
        created_by_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      )`,

      // Marketing campaigns
      `CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'draft' NOT NULL,
        description TEXT,
        audience TEXT,
        content JSONB DEFAULT '{}',
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        created_by_id INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        tags TEXT[],
        stats JSONB DEFAULT '{}',
        cc_campaign_id TEXT,
        cc_list_ids TEXT[],
        cc_template_id TEXT,
        total_sent INTEGER DEFAULT 0,
        total_opened INTEGER DEFAULT 0,
        total_clicked INTEGER DEFAULT 0,
        total_bounced INTEGER DEFAULT 0,
        total_unsubscribed INTEGER DEFAULT 0,
        referral_source_id INTEGER,
        FOREIGN KEY (created_by_id) REFERENCES users(id),
        FOREIGN KEY (referral_source_id) REFERENCES referral_sources(id)
      )`,

      // Leads
      `CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        source TEXT,
        source_id INTEGER,
        status TEXT DEFAULT 'new' NOT NULL,
        notes TEXT,
        stage TEXT DEFAULT 'inquiry' NOT NULL,
        assigned_to_id INTEGER,
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        last_contact_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        interested_services JSONB DEFAULT '[]',
        demographic_info JSONB DEFAULT '{}',
        conversion_date TIMESTAMP,
        marketing_campaign_id INTEGER,
        lead_score INTEGER DEFAULT 0,
        conversion_probability INTEGER DEFAULT 0,
        last_activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tags TEXT[],
        FOREIGN KEY (assigned_to_id) REFERENCES users(id)
      )`,

      // Clients/Patients
      `CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        date_of_birth TIMESTAMP,
        address TEXT,
        status TEXT DEFAULT 'active' NOT NULL,
        primary_therapist_id INTEGER,
        referral_source_id INTEGER,
        referral_notes TEXT,
        lead_id INTEGER,
        conversion_date TIMESTAMP,
        original_marketing_campaign_id INTEGER,
        FOREIGN KEY (primary_therapist_id) REFERENCES users(id),
        FOREIGN KEY (referral_source_id) REFERENCES referral_sources(id),
        FOREIGN KEY (lead_id) REFERENCES leads(id),
        FOREIGN KEY (original_marketing_campaign_id) REFERENCES marketing_campaigns(id)
      )`,

      // Documentation/Notes
      `CREATE TABLE IF NOT EXISTS documentation (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        therapist_id INTEGER,
        session_id INTEGER,
        title TEXT NOT NULL,
        content TEXT,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'draft' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        due_date TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (therapist_id) REFERENCES users(id)
      )`,

      // Sessions/Appointments
      `CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        therapist_id INTEGER,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        session_type TEXT NOT NULL,
        medium TEXT NOT NULL,
        status TEXT DEFAULT 'scheduled' NOT NULL,
        notes TEXT,
        location TEXT,
        cpt_code TEXT,
        reminder_sent BOOLEAN DEFAULT false,
        reminder_time TIMESTAMP,
        external_calendar_event_id TEXT,
        external_calendar_type TEXT,
        billing_status TEXT DEFAULT 'unbilled',
        documentation_status TEXT DEFAULT 'pending',
        documentation_id INTEGER,
        recurrence_rule TEXT,
        recurrence_end_date TIMESTAMP,
        cancel_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (therapist_id) REFERENCES users(id),
        FOREIGN KEY (documentation_id) REFERENCES documentation(id)
      )`,

      // Notifications
      `CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        link TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,

      // Marketing events
      `CREATE TABLE IF NOT EXISTS marketing_events (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        duration INTEGER,
        location TEXT NOT NULL,
        capacity INTEGER DEFAULT 0,
        status TEXT DEFAULT 'upcoming' NOT NULL,
        created_by_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      )`,

      // Event registrations
      `CREATE TABLE IF NOT EXISTS event_registrations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER,
        user_id INTEGER,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) NOT NULL,
        payment_status VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES marketing_events(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,

      // Contact history
      `CREATE TABLE IF NOT EXISTS contact_history (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        user_id INTEGER,
        contact_type VARCHAR(50) NOT NULL,
        contact_date TIMESTAMP NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,

      // Messages
      `CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        sender_id INTEGER,
        recipient_id INTEGER,
        subject TEXT,
        content TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (recipient_id) REFERENCES users(id)
      )`,

      // Documentation Categories
      `CREATE TABLE IF NOT EXISTS documentation_categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        parent_id INTEGER,
        required_fields JSONB DEFAULT '[]',
        custom_fields JSONB DEFAULT '[]',
        status TEXT DEFAULT 'active' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES documentation_categories(id)
      )`,

      // Documentation Types
      `CREATE TABLE IF NOT EXISTS documentation_types (
        id SERIAL PRIMARY KEY,
        category_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        template_required BOOLEAN DEFAULT false,
        frequency TEXT, -- once, daily, weekly, monthly, etc.
        validity_period INTEGER, -- in days
        requires_signature BOOLEAN DEFAULT false,
        required_signatures JSONB DEFAULT '[]', -- array of required role types
        auto_reminder BOOLEAN DEFAULT false,
        reminder_days INTEGER[], -- days before due date to send reminder
        status TEXT DEFAULT 'active' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (category_id) REFERENCES documentation_categories(id)
      )`,

      // Documentation Metadata
      `CREATE TABLE IF NOT EXISTS documentation_metadata (
        id SERIAL PRIMARY KEY,
        documentation_id INTEGER,
        diagnosis_codes TEXT[],
        treatment_codes TEXT[],
        service_location TEXT,
        service_modality TEXT,
        duration INTEGER, -- in minutes
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (documentation_id) REFERENCES documentation(id)
      )`,

      // Documentation Attachments
      `CREATE TABLE IF NOT EXISTS documentation_attachments (
        id SERIAL PRIMARY KEY,
        documentation_id INTEGER,
        file_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_by INTEGER,
        description TEXT,
        is_confidential BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (documentation_id) REFERENCES documentation(id),
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )`,

      // Documentation Reviews
      `CREATE TABLE IF NOT EXISTS documentation_reviews (
        id SERIAL PRIMARY KEY,
        documentation_id INTEGER,
        reviewer_id INTEGER,
        status TEXT DEFAULT 'pending' NOT NULL, -- pending, approved, rejected
        comments TEXT,
        review_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (documentation_id) REFERENCES documentation(id),
        FOREIGN KEY (reviewer_id) REFERENCES users(id)
      )`,

      // Documentation Version History
      `CREATE TABLE IF NOT EXISTS documentation_versions (
        id SERIAL PRIMARY KEY,
        documentation_id INTEGER,
        content TEXT NOT NULL,
        metadata JSONB,
        version_number INTEGER NOT NULL,
        created_by INTEGER,
        reason_for_change TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (documentation_id) REFERENCES documentation(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`,

      // Documentation Access Log
      `CREATE TABLE IF NOT EXISTS documentation_access_log (
        id SERIAL PRIMARY KEY,
        documentation_id INTEGER,
        user_id INTEGER,
        access_type TEXT NOT NULL, -- view, edit, print, download
        ip_address TEXT,
        user_agent TEXT,
        accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (documentation_id) REFERENCES documentation(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,

      // Documentation Relationships
      `CREATE TABLE IF NOT EXISTS documentation_relationships (
        id SERIAL PRIMARY KEY,
        source_doc_id INTEGER,
        target_doc_id INTEGER,
        relationship_type TEXT NOT NULL, -- parent, child, reference, supersedes
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (source_doc_id) REFERENCES documentation(id),
        FOREIGN KEY (target_doc_id) REFERENCES documentation(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`,

      // Documentation Tags
      `CREATE TABLE IF NOT EXISTS documentation_tags (
        id SERIAL PRIMARY KEY,
        documentation_id INTEGER,
        tag_name TEXT NOT NULL,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (documentation_id) REFERENCES documentation(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`,

      // Documentation Comments
      `CREATE TABLE IF NOT EXISTS documentation_comments (
        id SERIAL PRIMARY KEY,
        documentation_id INTEGER,
        user_id INTEGER,
        comment TEXT NOT NULL,
        parent_comment_id INTEGER,
        is_resolved BOOLEAN DEFAULT false,
        resolved_by INTEGER,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (documentation_id) REFERENCES documentation(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (parent_comment_id) REFERENCES documentation_comments(id),
        FOREIGN KEY (resolved_by) REFERENCES users(id)
      )`,

      // Documentation Templates (existing but modified)
      `CREATE TABLE IF NOT EXISTS document_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        category_id INTEGER,
        created_by_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        default_content TEXT,
        required_fields JSONB DEFAULT '[]',
        optional_fields JSONB DEFAULT '[]',
        auto_populate_rules JSONB DEFAULT '{}',
        status TEXT DEFAULT 'active' NOT NULL,
        tags TEXT[],
        is_system BOOLEAN DEFAULT false,
        FOREIGN KEY (category_id) REFERENCES documentation_categories(id),
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      )`,

      // Template versions
      `CREATE TABLE IF NOT EXISTS template_versions (
        id SERIAL PRIMARY KEY,
        template_id INTEGER,
        version_number INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_by_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'draft' NOT NULL,
        approved_by_id INTEGER,
        approved_at TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES document_templates(id),
        FOREIGN KEY (created_by_id) REFERENCES users(id),
        FOREIGN KEY (approved_by_id) REFERENCES users(id)
      )`,

      // Signature requests
      `CREATE TABLE IF NOT EXISTS signature_requests (
        id SERIAL PRIMARY KEY,
        document_id INTEGER,
        requested_by_id INTEGER,
        requested_for_id INTEGER,
        status TEXT DEFAULT 'pending' NOT NULL,
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        expires_at TIMESTAMP,
        signature_token TEXT NOT NULL,
        email_sent BOOLEAN DEFAULT false,
        email_sent_at TIMESTAMP,
        reminder_sent BOOLEAN DEFAULT false,
        reminder_sent_at TIMESTAMP,
        notes TEXT,
        FOREIGN KEY (document_id) REFERENCES documentation(id),
        FOREIGN KEY (requested_by_id) REFERENCES users(id),
        FOREIGN KEY (requested_for_id) REFERENCES clients(id)
      )`,

      // Signature fields
      `CREATE TABLE IF NOT EXISTS signature_fields (
        id SERIAL PRIMARY KEY,
        request_id INTEGER,
        field_type TEXT NOT NULL,
        label TEXT NOT NULL,
        required BOOLEAN DEFAULT true,
        x_position INTEGER,
        y_position INTEGER,
        page_number INTEGER DEFAULT 1,
        width INTEGER,
        height INTEGER,
        completed_at TIMESTAMP,
        value TEXT,
        FOREIGN KEY (request_id) REFERENCES signature_requests(id)
      )`,

      // Signature events
      `CREATE TABLE IF NOT EXISTS signature_events (
        id SERIAL PRIMARY KEY,
        request_id INTEGER,
        event_type TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        event_data JSONB DEFAULT '{}',
        FOREIGN KEY (request_id) REFERENCES signature_requests(id)
      )`,

      // External integrations
      `CREATE TABLE IF NOT EXISTS integrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        provider_name TEXT NOT NULL,
        provider_user_id TEXT,
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMP,
        scopes TEXT[],
        status TEXT DEFAULT 'active' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        metadata JSONB DEFAULT '{}',
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,

      // OAuth states
      `CREATE TABLE IF NOT EXISTS oauth_states (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        state TEXT NOT NULL,
        provider_name TEXT NOT NULL,
        redirect_uri TEXT,
        scopes TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        used_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,

      // Scheduling - Provider Availability
      `CREATE TABLE IF NOT EXISTS schedule_settings (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER,
        day_of_week INTEGER NOT NULL, -- 0-6 for Sunday-Saturday
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT true,
        location_type TEXT NOT NULL, -- 'office', 'telehealth', 'both'
        appointment_duration INTEGER NOT NULL, -- in minutes
        buffer_time INTEGER DEFAULT 0, -- minutes between appointments
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (provider_id) REFERENCES users(id)
      )`,

      // Blocked Time Slots
      `CREATE TABLE IF NOT EXISTS schedule_blocks (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        reason TEXT,
        is_recurring BOOLEAN DEFAULT false,
        recurrence_rule TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (provider_id) REFERENCES users(id)
      )`,

      // Waiting List
      `CREATE TABLE IF NOT EXISTS waiting_list (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        provider_id INTEGER,
        preferred_days TEXT[],
        preferred_times TEXT[],
        service_type TEXT NOT NULL,
        urgency_level TEXT DEFAULT 'normal',
        notes TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (provider_id) REFERENCES users(id)
      )`,

      // Cancellation Policies
      `CREATE TABLE IF NOT EXISTS cancellation_policies (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER,
        notice_period INTEGER NOT NULL, -- hours required for cancellation
        fee_amount DECIMAL(10,2),
        waiver_limit INTEGER DEFAULT 1, -- number of allowed waivers
        policy_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (provider_id) REFERENCES users(id)
      )`,

      // Telehealth Sessions
      `CREATE TABLE IF NOT EXISTS telehealth_sessions (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        provider_id INTEGER,
        session_date TIMESTAMP NOT NULL,
        session_type VARCHAR(50) NOT NULL,
        platform VARCHAR(50) NOT NULL,
        meeting_link TEXT,
        status VARCHAR(20) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (provider_id) REFERENCES users(id)
      )`,

      // Telehealth Settings
      `CREATE TABLE IF NOT EXISTS telehealth_settings (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER,
        platform VARCHAR(50) NOT NULL,
        api_key TEXT,
        api_secret TEXT,
        webhook_url TEXT,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (provider_id) REFERENCES users(id)
      )`,

      // Virtual Waiting Room Settings
      `CREATE TABLE IF NOT EXISTS virtual_waiting_room (
        id SERIAL PRIMARY KEY,
        session_id INTEGER,
        client_id INTEGER,
        status VARCHAR(20) NOT NULL,
        join_time TIMESTAMP,
        wait_duration INTEGER,
        notes TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (session_id) REFERENCES telehealth_sessions(id),
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,

      // Insurance Providers
      `CREATE TABLE IF NOT EXISTS insurance_providers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        payer_id TEXT,
        address TEXT,
        phone TEXT,
        website TEXT,
        electronic_payer_id TEXT,
        claim_office_phone TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`,

      // Client Insurance Information
      `CREATE TABLE IF NOT EXISTS client_insurance (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        insurance_provider_id INTEGER,
        policy_number TEXT NOT NULL,
        group_number TEXT,
        subscriber_name TEXT NOT NULL,
        subscriber_dob DATE,
        relationship_to_subscriber TEXT,
        coverage_start_date DATE,
        coverage_end_date DATE,
        copay_amount DECIMAL(10,2),
        coinsurance_percentage INTEGER,
        deductible_amount DECIMAL(10,2),
        deductible_met DECIMAL(10,2),
        authorization_number TEXT,
        sessions_approved INTEGER,
        sessions_used INTEGER DEFAULT 0,
        verification_date TIMESTAMP,
        verification_method TEXT,
        verification_details JSONB DEFAULT '{}',
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (insurance_provider_id) REFERENCES insurance_providers(id)
      )`,

      // Insurance Claims
      `CREATE TABLE IF NOT EXISTS insurance_claims (
        id SERIAL PRIMARY KEY,
        session_id INTEGER,
        client_insurance_id INTEGER,
        claim_number TEXT,
        date_of_service DATE NOT NULL,
        billing_codes TEXT[] NOT NULL,
        diagnosis_codes TEXT[] NOT NULL,
        claim_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        submission_date TIMESTAMP,
        paid_amount DECIMAL(10,2),
        payment_date TIMESTAMP,
        denial_reason TEXT,
        appeal_status TEXT,
        appeal_deadline DATE,
        notes TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id),
        FOREIGN KEY (client_insurance_id) REFERENCES client_insurance(id)
      )`,

      // Billing Codes
      `CREATE TABLE IF NOT EXISTS billing_codes (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL, -- CPT, HCPCS, etc.
        description TEXT NOT NULL,
        rate DECIMAL(10,2),
        duration INTEGER, -- in minutes
        requires_modifier BOOLEAN DEFAULT false,
        valid_modifiers TEXT[],
        notes TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`,

      // Payment Transactions
      `CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT NOT NULL,
        transaction_type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_date TIMESTAMP,
        reference_number TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,

      // Invoices
      `CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        invoice_number TEXT NOT NULL UNIQUE,
        issue_date DATE NOT NULL,
        due_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        status TEXT DEFAULT 'pending',
        items JSONB NOT NULL,
        payment_terms TEXT,
        notes TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,

      // Payment Methods
      `CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        type TEXT NOT NULL,
        last_four TEXT,
        expiry_date TEXT,
        billing_address TEXT,
        is_default BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'active',
        provider_token TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )`,

      // Clinical Assessment Templates
      `CREATE TABLE IF NOT EXISTS assessment_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        questions JSONB NOT NULL,
        scoring_method TEXT,
        interpretation_guide TEXT,
        estimated_duration INTEGER,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`,

      // Assessment Responses
      `CREATE TABLE IF NOT EXISTS assessment_responses (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        template_id INTEGER,
        session_id INTEGER,
        responses JSONB NOT NULL,
        score JSONB,
        interpretation TEXT,
        completed_at TIMESTAMP,
        status TEXT DEFAULT 'in_progress',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (template_id) REFERENCES assessment_templates(id),
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      )`,

      // Screening Tools
      `CREATE TABLE IF NOT EXISTS screening_tools (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        target_condition TEXT NOT NULL,
        questions JSONB NOT NULL,
        scoring_criteria JSONB NOT NULL,
        threshold_values JSONB,
        reference_list TEXT[],
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`,

      // Measurement Scales
      `CREATE TABLE IF NOT EXISTS measurement_scales (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        scale_range JSONB NOT NULL,
        interpretation_guide TEXT,
        validation_studies TEXT[],
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`,

      // Appointments
      `CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        provider_id INTEGER,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (provider_id) REFERENCES users(id)
      )`,

      // Treatment Plans
      `CREATE TABLE IF NOT EXISTS treatment_plans (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        provider_id INTEGER,
        diagnosis TEXT,
        goals TEXT,
        interventions TEXT,
        progress_notes TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (provider_id) REFERENCES users(id)
      )`,

      // Progress Notes
      `CREATE TABLE IF NOT EXISTS progress_notes (
        id SERIAL PRIMARY KEY,
        client_id INTEGER,
        provider_id INTEGER,
        session_date TIMESTAMP NOT NULL,
        subjective TEXT,
        objective TEXT,
        assessment TEXT,
        plan TEXT,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (provider_id) REFERENCES users(id)
      )`,
    ];

    // Execute each creation query
    for (const query of createTableQueries) {
      await pool.query(query);
      console.log('Created table successfully');
    }
    
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating schema:', error);
  } finally {
    await pool.end();
  }
}

main(); 