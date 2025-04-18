-- Create opening_stock table
CREATE TABLE opening_stock (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    bar_id UUID NOT NULL REFERENCES bars(id),
    brand_id BIGINT NOT NULL REFERENCES brands(id),
    financial_year_start DATE NOT NULL,
    opening_qty INTEGER NOT NULL CHECK (opening_qty >= 0),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(bar_id, brand_id, financial_year_start)
);

-- Create indexes for better query performance
CREATE INDEX idx_opening_stock_bar_id ON opening_stock(bar_id);
CREATE INDEX idx_opening_stock_brand_id ON opening_stock(brand_id);
CREATE INDEX idx_opening_stock_financial_year_start ON opening_stock(financial_year_start);
CREATE INDEX idx_opening_stock_created_by ON opening_stock(created_by);

-- Enable Row Level Security
ALTER TABLE opening_stock ENABLE ROW LEVEL SECURITY;

-- Create policies for opening_stock
CREATE POLICY "Users can view their own opening stock"
    ON opening_stock FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own opening stock"
    ON opening_stock FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own opening stock"
    ON opening_stock FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own opening stock"
    ON opening_stock FOR DELETE
    USING (auth.uid() = created_by);

-- Create function to sync opening stock with inventory
CREATE OR REPLACE FUNCTION sync_opening_stock_to_inventory()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update inventory record for the opening stock
    INSERT INTO inventory (
        bar_id,
        brand_id,
        date,
        opening_qty,
        receipt_qty,
        sale_qty,
        closing_qty,
        created_by
    )
    VALUES (
        NEW.bar_id,
        NEW.brand_id,
        NEW.financial_year_start,
        NEW.opening_qty,
        0, -- receipt_qty starts at 0
        0, -- sale_qty starts at 0
        NEW.opening_qty, -- closing_qty equals opening_qty initially
        NEW.created_by
    )
    ON CONFLICT (bar_id, brand_id, date) 
    DO UPDATE SET
        opening_qty = NEW.opening_qty,
        closing_qty = NEW.opening_qty,
        updated_at = TIMEZONE('utc'::text, NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync opening stock with inventory
CREATE TRIGGER sync_opening_stock_to_inventory_trigger
    AFTER INSERT OR UPDATE ON opening_stock
    FOR EACH ROW
    EXECUTE FUNCTION sync_opening_stock_to_inventory();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_opening_stock_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_opening_stock_updated_at
    BEFORE UPDATE ON opening_stock
    FOR EACH ROW
    EXECUTE FUNCTION update_opening_stock_updated_at();

-- Add comment to explain the relationship
COMMENT ON TABLE opening_stock IS 'Stores opening stock quantities for each brand at the start of a financial year';
COMMENT ON FUNCTION sync_opening_stock_to_inventory() IS 'Automatically syncs opening stock with inventory when opening stock is created or updated'; 