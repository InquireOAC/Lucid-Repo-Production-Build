INSERT INTO public.lucid_achievement_definitions (key, title, description, icon, category, unlock_rule) VALUES
('first_lucid', 'First Lucid Dream', 'Logged your first lucid dream', '🌟', 'lucid', '{"type":"total_lucid","value":1}'),
('10_lucid', 'Lucid Explorer', 'Logged 10 lucid dreams', '✨', 'lucid', '{"type":"total_lucid","value":10}'),
('25_lucid', 'Lucid Master', 'Logged 25 lucid dreams', '💫', 'lucid', '{"type":"total_lucid","value":25}'),
('50_lucid', 'Lucid Legend', 'Logged 50 lucid dreams', '🌌', 'lucid', '{"type":"total_lucid","value":50}'),
('7_recall_streak', 'Week Warrior', '7-day dream recall streak', '🔥', 'recall', '{"type":"recall_streak","value":7}'),
('30_recall_streak', 'Monthly Master', '30-day dream recall streak', '⚡', 'recall', '{"type":"recall_streak","value":30}'),
('full_control', 'Dream Architect', 'First full control lucid dream', '🏗️', 'lucid', '{"type":"lucidity_level","value":3}'),
('3_techniques', 'Method Explorer', 'Tried 3 different techniques', '🧪', 'technique', '{"type":"techniques_tried","value":3}'),
('50_dreams', 'Dream Chronicler', 'Logged 50 dreams total', '📚', 'recall', '{"type":"total_entries","value":50}'),
('100_dreams', 'Dream Sage', 'Logged 100 dreams total', '🧙', 'recall', '{"type":"total_entries","value":100}')
ON CONFLICT (key) DO NOTHING;