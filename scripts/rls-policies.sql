-- ============================================
-- RLS Policies - TuDeporteLocal
-- ============================================

-- Enable RLS on all tables
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Regions: Public read, service role full access
-- ============================================
CREATE POLICY "regions_select" ON regions
  FOR SELECT USING (true);

CREATE POLICY "regions_all" ON regions
  FOR ALL
  USING (auth.jwt() IS NOT NULL)
  WITH CHECK (auth.jwt() IS NOT NULL);

-- ============================================
-- Communes: Public read, service role full access
-- ============================================
CREATE POLICY "communes_select" ON communes
  FOR SELECT USING (true);

CREATE POLICY "communes_all" ON communes
  FOR ALL
  USING (auth.jwt() IS NOT NULL)
  WITH CHECK (auth.jwt() IS NOT NULL);

-- ============================================
-- Sports: Public read, service role full access
-- ============================================
CREATE POLICY "sports_select" ON sports
  FOR SELECT USING (true);

CREATE POLICY "sports_all" ON sports
  FOR ALL
  USING (auth.jwt() IS NOT NULL)
  WITH CHECK (auth.jwt() IS NOT NULL);

-- ============================================
-- Clubs: Public read active clubs, authenticated can create
-- ============================================
CREATE POLICY "clubs_select_active" ON clubs
  FOR SELECT USING (
    status = 'active' AND is_deleted = false
  );

CREATE POLICY "clubs_insert" ON clubs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "clubs_update" ON clubs
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "clubs_delete" ON clubs
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- Club Sports: Same as clubs
-- ============================================
CREATE POLICY "club_sports_select" ON club_sports
  FOR SELECT USING (true);

CREATE POLICY "club_sports_insert" ON club_sports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "club_sports_update" ON club_sports
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "club_sports_delete" ON club_sports
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- Update Requests: Authenticated users can create/read own
-- ============================================
CREATE POLICY "update_requests_select" ON update_requests
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

CREATE POLICY "update_requests_insert" ON update_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "update_requests_update" ON update_requests
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "update_requests_delete" ON update_requests
  FOR DELETE
  USING (auth.role() = 'authenticated');
