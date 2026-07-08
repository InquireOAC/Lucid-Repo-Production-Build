// ============================================================
// OpenInLucidEngine
// CTA button shown on DreamStoryPage for Dreamer/Studio users.
// Exports the dream as a Lucid Engine project (writing to the
// shared Supabase projects table) then deep-links to the studio.
//
// Gating: requires tierId 'dreamer' or 'studio'.
// ============================================================

import React, { useState } from 'react';
import { ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { dreamToProject, exportDreamToSharedDb } from '@/lib/dream-to-project';
import { supabase } from '@/integrations/supabase/client';
import type { DreamEntry, DreamCharacterReference } from '@/types/dream';

interface OpenInLucidEngineProps {
  dream: DreamEntry;
  /** Lucid Engine web app base URL — configure via env var */
  engineBaseUrl?: string;
  className?: string;
}

const LUCID_ENGINE_URL =
  import.meta.env.VITE_LUCID_ENGINE_URL ?? 'https://lucidengine.app';

export const OpenInLucidEngine: React.FC<OpenInLucidEngineProps> = ({
  dream,
  engineBaseUrl = LUCID_ENGINE_URL,
  className,
}) => {
  const { user } = useAuth();
  const { tierId, tierDef } = useSubscriptionContext();
  const [exporting, setExporting] = useState(false);

  const canExport = tierId === 'dreamer' || tierId === 'studio' || tierDef?.lucidEngineExportEnabled;

  const handleExport = async () => {
    if (!user?.id) {
      toast.error('Please sign in to export to Lucid Engine.');
      return;
    }
    if (!canExport) {
      toast.error('Upgrade to Dreamer or Studio to open dreams in Lucid Engine.');
      return;
    }

    setExporting(true);
    try {
      // Fetch characters attached to this dream
      let characters: DreamCharacterReference[] = [];
      if (dream.dream_character_ids?.length) {
        const { data } = await supabase
          .from('dream_characters')
          .select('id, name, photo_url, lora_id, appearance_data')
          .in('id', dream.dream_character_ids);

        if (data) {
          characters = data.map(c => ({
            id: c.id,
            userId: user.id,
            name: c.name,
            photoUrl: c.photo_url ?? undefined,
            loraId: c.lora_id ?? undefined,
            appearanceData: c.appearance_data as DreamCharacterReference['appearanceData'],
          }));
        }
      }

      const project = dreamToProject(dream, characters);
      const result = await exportDreamToSharedDb(project, user.id);

      if (result.success) {
        toast.success('Dream exported — opening Lucid Engine…', { duration: 3000 });
        const url = `${engineBaseUrl}/studio/${project.id}?source=lucid-repo&dreamId=${dream.id}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback: deep-link without DB write
        toast.info('Opening in Lucid Engine…', { duration: 2500 });
        const url = `${engineBaseUrl}/studio/${dream.id}?source=lucid-repo&dreamId=${dream.id}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error('[OpenInLucidEngine]', err);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (!canExport) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={`opacity-50 cursor-not-allowed border-white/10 text-white/40 ${className ?? ''}`}
        title="Upgrade to Dreamer to open in Lucid Engine"
      >
        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
        Open in Lucid Engine
        <span className="ml-1.5 text-[9px] font-bold text-amber-400 uppercase tracking-wide">
          Dreamer
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={exporting}
      className={`
        border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08]
        text-white/80 hover:text-white
        transition-all duration-150
        ${className ?? ''}
      `}
    >
      {exporting ? (
        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[hsl(var(--primary))]" />
      )}
      {exporting ? 'Exporting…' : 'Open in Lucid Engine'}
      {!exporting && <ExternalLink className="w-3 h-3 ml-1.5 opacity-50" />}
    </Button>
  );
};
