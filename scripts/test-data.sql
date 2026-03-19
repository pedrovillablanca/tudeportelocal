-- ============================================
-- Datos de Prueba: Clubes
-- ============================================

-- Club 1: Club Deportivo Las Condes
INSERT INTO clubs (name, slug, description, region_id, commune_id, address, instagram_url, facebook_url, contact_email, contact_phone, status, is_featured) VALUES
('Club Deportivo Las Condes', 'club-deportivo-las-condes', 'Club deportivo con más de 30 años de trayectoria ofreciendo fútbol, básquetbol y natación para todas las edades.', 13, 257, 'Av. Apoquindo 3000, Las Condes', 'https://instagram.com/cdlascondes', 'https://facebook.com/cdlascondes', 'contacto@cdlascondes.cl', '+56222010001', 'active', true);

-- Club 2: Academia de Natación Santiago
INSERT INTO clubs (name, slug, description, region_id, commune_id, address, instagram_url, facebook_url, contact_email, contact_phone, status, is_featured) VALUES
('Academia de Natación Santiago', 'academia-natacion-santiago', 'Academia especializada en natación para niños y adultos. Instructores certificados y piscinas temperadas.', 13, 244, 'Av. Libertador Bernardo O Higgins 1440, Santiago', 'https://instagram.com/natacionstgo', 'https://facebook.com/natacionstgo', 'info@natacionstgo.cl', '+56226880002', 'active', true);

-- Club 3: Centro Deportivo Viña del Mar
INSERT INTO clubs (name, slug, description, region_id, commune_id, address, instagram_url, facebook_url, contact_email, contact_phone, status, is_featured) VALUES
('Centro Deportivo Viña del Mar', 'centro-deportivo-vina-del-mar', 'Centro deportivo con canchas de fútbol, tennis, paddle y piscina. Ideal para familias.', 6, 49, 'Av. Marina 250, Viña del Mar', 'https://instagram.com/cdvina', 'https://facebook.com/centrodeportivovina', 'contacto@cdvina.cl', '+56322200003', 'active', false);

-- Club 4: Club de Rugby Concepción
INSERT INTO clubs (name, slug, description, region_id, commune_id, address, instagram_url, facebook_url, contact_email, contact_phone, status, is_featured) VALUES
('Club de Rugby Concepción', 'club-rugby-concepcion', 'Club de rugby competitivo en la ciudad de Concepción. Categorías juveniles y adultas.', 10, 149, 'Av. Pedro de Valdivia 1500, Concepción', 'https://instagram.com/rugbyconcepcion', 'https://facebook.com/rugbyconcepcion', 'info@rugbyconcepcion.cl', '+5641200004', 'active', false);

-- ============================================
-- Relación Club-Deportes
-- ============================================

-- Club Deportivo Las Condes (fútbol, básquetbol, natación)
INSERT INTO club_sports (club_id, sport_id, is_primary) VALUES
((SELECT id FROM clubs WHERE slug = 'club-deportivo-las-condes'), 1, true), -- Fútbol
((SELECT id FROM clubs WHERE slug = 'club-deportivo-las-condes'), 2, false), -- Basketball
((SELECT id FROM clubs WHERE slug = 'club-deportivo-las-condes'), 8, false); -- Natación

-- Academia de Natación Santiago (natación)
INSERT INTO club_sports (club_id, sport_id, is_primary) VALUES
((SELECT id FROM clubs WHERE slug = 'academia-natacion-santiago'), 8, true); -- Natación

-- Centro Deportivo Viña del Mar (fútbol, tennis, paddle)
INSERT INTO club_sports (club_id, sport_id, is_primary) VALUES
((SELECT id FROM clubs WHERE slug = 'centro-deportivo-vina-del-mar'), 1, true), -- Fútbol
((SELECT id FROM clubs WHERE slug = 'centro-deportivo-vina-del-mar'), 3, false), -- Tenis
((SELECT id FROM clubs WHERE slug = 'centro-deportivo-vina-del-mar'), 4, false); -- Padel

-- Club de Rugby Concepción (rugby)
INSERT INTO club_sports (club_id, sport_id, is_primary) VALUES
((SELECT id FROM clubs WHERE slug = 'club-rugby-concepcion'), 16, true); -- Rugby
