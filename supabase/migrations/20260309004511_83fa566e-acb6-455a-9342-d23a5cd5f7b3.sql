
-- Seed dream_matches with sample data
INSERT INTO public.dream_matches (user1_id, dream1_id, user2_id, dream2_id, match_percentage, shared_elements) VALUES
('9d76ce75-15cb-458f-bca0-caaaa5d150ee', '8325d159-f509-4a29-bd42-2f27b8d056b5', 'c3b590cf-0133-46bb-9e01-7cffa5ddddea', '58dadfc5-7651-4de0-b37d-a267b7601dbd', 78, ARRAY['adventure', 'flying', 'sky']),
('9d76ce75-15cb-458f-bca0-caaaa5d150ee', 'f9833a35-3746-496f-b9d1-77e543241e02', '6a49c751-2704-4bc6-a0f5-1c6a97f89276', '0e3c891f-2585-452e-84b8-12a209986465', 65, ARRAY['survival', 'adventure']),
('9d76ce75-15cb-458f-bca0-caaaa5d150ee', '7b905583-487f-4599-8e41-9c46e9c80515', 'c9fd7159-3455-44ae-8422-e8effed83fc1', 'cb5a1586-8a50-4475-ab47-c305fbd39047', 52, ARRAY['flying', 'escape']);

-- Seed sync_alerts
INSERT INTO public.sync_alerts (theme, emoji, description, dreamer_count, dreamer_ids, is_trending) VALUES
('Flying Dreams', '🦅', '12 dreamers experienced flying dreams in the last 48 hours', 12, ARRAY['9d76ce75-15cb-458f-bca0-caaaa5d150ee', 'c3b590cf-0133-46bb-9e01-7cffa5ddddea']::uuid[], true),
('Water Symbolism', '🌊', '8 dreamers had water-themed dreams recently', 8, ARRAY['9d76ce75-15cb-458f-bca0-caaaa5d150ee']::uuid[], false),
('Chase Dreams', '🏃', '6 dreamers reported being chased in their dreams', 6, ARRAY['9d76ce75-15cb-458f-bca0-caaaa5d150ee', '6a49c751-2704-4bc6-a0f5-1c6a97f89276']::uuid[], false);

-- Seed collective_waves
INSERT INTO public.collective_waves (theme, emoji, description, dream_count, percent_change, top_symbols, timeframe_start, timeframe_end) VALUES
('Lucid Awareness Surge', '✨', 'A wave of lucid dreaming swept through the community this week', 34, 42, ARRAY['lucidity', 'awareness', 'control'], now() - interval '72 hours', now()),
('Nature & Earth Dreams', '🌿', 'Many dreamers reported vivid nature and earth-themed dreams', 28, 18, ARRAY['trees', 'mountains', 'rivers'], now() - interval '5 days', now() - interval '2 days'),
('Cosmic Exploration', '🌌', 'Space and cosmic themes trending across dream journals', 19, 65, ARRAY['stars', 'planets', 'void'], now() - interval '4 days', now());

-- Seed dream_clusters
INSERT INTO public.dream_clusters (event_name, emoji, event_date, description, dream_count, top_themes) VALUES
('Full Moon March 2026', '🌕', '2026-03-07', 'Dreams during the full moon showed heightened emotional intensity', 45, ARRAY['transformation', 'emotions', 'water']),
('Spring Equinox Dreams', '🌸', '2026-03-20', 'Anticipatory dreams around the spring equinox with themes of renewal', 32, ARRAY['rebirth', 'growth', 'light']),
('Solar Eclipse Cluster', '🌑', '2026-02-17', 'A cluster of vivid dreams surrounding the recent solar eclipse', 58, ARRAY['darkness', 'revelation', 'duality']);
