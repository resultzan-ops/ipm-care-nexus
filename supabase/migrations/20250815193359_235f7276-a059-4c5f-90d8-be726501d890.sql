-- First check the current enum values
DO $$ 
BEGIN
    -- Create new company_type enum with updated values
    DROP TYPE IF EXISTS company_type_new;
    CREATE TYPE company_type_new AS ENUM (
        'Mitra Penyedia (Kalibrasi)', 
        'Mitra Penyedia (Barang & Jasa)', 
        'Klien Rumah Sakit/Perusahaan'
    );
    
    -- Add temporary column with new enum type
    ALTER TABLE tenants ADD COLUMN company_type_new company_type_new;
    
    -- Migrate existing data
    UPDATE tenants SET company_type_new = 
        CASE 
            WHEN company_type = 'IPM' THEN 'Mitra Penyedia (Kalibrasi)'::company_type_new
            WHEN company_type = 'Mitra Kalibrasi' THEN 'Mitra Penyedia (Kalibrasi)'::company_type_new
            WHEN company_type = 'Rumah Sakit / Perusahaan' THEN 'Klien Rumah Sakit/Perusahaan'::company_type_new
            ELSE 'Klien Rumah Sakit/Perusahaan'::company_type_new
        END;
    
    -- Drop old column and rename new one
    ALTER TABLE tenants DROP COLUMN company_type;
    ALTER TABLE tenants RENAME COLUMN company_type_new TO company_type;
    
    -- Set not null constraint
    ALTER TABLE tenants ALTER COLUMN company_type SET NOT NULL;
    
    -- Drop old enum and rename new one
    DROP TYPE IF EXISTS company_type;
    ALTER TYPE company_type_new RENAME TO company_type;
    
    -- Add new company profile fields
    ALTER TABLE tenants 
        ADD COLUMN IF NOT EXISTS logo_url TEXT,
        ADD COLUMN IF NOT EXISTS description TEXT,
        ADD COLUMN IF NOT EXISTS whatsapp TEXT;
    
    -- Make sure alamat column exists (it should already exist based on earlier structure)
    ALTER TABLE tenants 
        ADD COLUMN IF NOT EXISTS alamat TEXT;
END $$;