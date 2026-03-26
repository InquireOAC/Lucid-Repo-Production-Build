import React from 'react';
import { ModuleWithProgress } from '@/hooks/useAcademyModules';
import { ChevronRight, Lock } from 'lucide-react';

interface ModuleListProps {
  modules: ModuleWithProgress[];
  onModuleClick: (moduleId: string) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({ modules, onModuleClick }) => {
  const ldModules = modules.filter(m => m.track === 'lucid_dreaming');
  const apModules = modules.filter(m => m.track === 'astral_projection');

  return (
    <div className="space-y-6">
      <TrackSection
        title="Lucid Dreaming"
        modules={ldModules}
        onModuleClick={onModuleClick}
      />
      {apModules.length > 0 && (
        <TrackSection
          title="Astral Projection"
          modules={apModules}
          onModuleClick={onModuleClick}
        />
      )}
    </div>
  );
};

const TrackSection: React.FC<{
  title: string;
  modules: ModuleWithProgress[];
  onModuleClick: (id: string) => void;
}> = ({ title, modules, onModuleClick }) => {
  const completed = modules.filter(m => m.is_completed).length;
  const total = modules.length;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground font-medium">{completed} / {total} MODULES</span>
      </div>
      <div className="rounded-2xl bg-[#0d1425] border border-border/20 overflow-hidden divide-y divide-border/10">
        {modules.map(m => (
          <ModuleRow key={m.id} module={m} onClick={() => onModuleClick(m.id)} />
        ))}
      </div>
    </div>
  );
};

const ModuleRow: React.FC<{ module: ModuleWithProgress; onClick: () => void }> = ({ module, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={!module.is_unlocked}
      className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-colors ${
        module.is_unlocked
          ? 'hover:bg-primary/5'
          : 'opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">
        {module.icon || '📘'}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-foreground truncate">{module.title}</h3>
        <p className="text-[11px] text-primary/60 font-medium uppercase tracking-wide mt-0.5">
          Tier {module.tier_required}
        </p>
      </div>
      {module.is_unlocked ? (
        <ChevronRight size={18} className="text-muted-foreground shrink-0" />
      ) : (
        <Lock size={14} className="text-muted-foreground shrink-0" />
      )}
    </button>
  );
};
