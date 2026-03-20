ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Anyone can read pricing tiers (public pricing info)
CREATE POLICY "Anyone can view pricing tiers" ON pricing_tiers
  FOR SELECT USING (true);

-- Only the creator can manage their own pricing tiers
CREATE POLICY "Creator can insert pricing tier" ON pricing_tiers
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator can update pricing tier" ON pricing_tiers
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creator can delete pricing tier" ON pricing_tiers
  FOR DELETE USING (auth.uid() = creator_id);