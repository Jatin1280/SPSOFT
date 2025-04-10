-- Create daily_sales table
CREATE TABLE daily_sales (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    bar_id UUID NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    qty INTEGER NOT NULL CHECK (qty > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_daily_sale UNIQUE (bar_id, sale_date, brand_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_daily_sales_bar_id ON daily_sales(bar_id);
CREATE INDEX idx_daily_sales_sale_date ON daily_sales(sale_date);
CREATE INDEX idx_daily_sales_brand_id ON daily_sales(brand_id);
CREATE INDEX idx_daily_sales_created_at ON daily_sales(created_at);

-- Enable Row Level Security
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own daily sales"
    ON daily_sales FOR SELECT
    USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own daily sales"
    ON daily_sales FOR INSERT
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own daily sales"
    ON daily_sales FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own daily sales"
    ON daily_sales FOR DELETE
    USING (auth.uid() = created_by);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON daily_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
