-- ============================================================
-- Extend dream_characters for Lucid Engine compatibility
-- Adds lora_id and appearance_data so dream characters are
-- forward-compatible with Lucid Engine's character_references
-- schema (enabling seamless cross-app character sharing).
-- ============================================================

alter table dream_characters
  add column if not exists lora_id         text,
  add column if not exists appearance_data jsonb;

comment on column dream_characters.lora_id is
  'Lucid Engine LoRA fine-tune ID for stronger visual consistency across shots';

comment on column dream_characters.appearance_data is
  'Structured appearance data: { hairColor, eyeColor, skinTone, height, build, distinguishingFeatures }';
