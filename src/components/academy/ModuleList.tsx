import React from 'react';
import { ModuleWithProgress } from '@/hooks/useAcademyModules';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle2, ChevronRight } from 'lucide-react';

interface ModuleListProps {
  modules: ModuleWithProgress[];
  onModuleClick: (moduleId: string) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({ modules, onModuleClick }) => {
  const ldModules = modules.filter(m => m.track === 'lucid_dreaming');
  const apModules = modules.filter(m => m.track === 'astral_projection');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">🌙 Lucid Dreaming</h2>
        <div className="space-y-2">
          {ldModules.map(m => (
            <ModuleCard key={m.id} module={m} onClick={() => onModuleClick(m.id)} />
          ))}
        </div>
      </div>

      {apModules.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">🔮 Astral Projection</h2>
          <div className="space-y-2">
            {apModules.map(m => (
              <ModuleCard key={m.id} module={m} onClick={() => onModuleClick(m.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ModuleCard: React.FC<{ module: ModuleWithProgress; onClick: () => void }> = ({ module, onClick }) => {
  const progress = module.lesson_count > 0
    ? (module.lessons_completed / module.lesson_count) * 100
    : 0;

  return (
    <button
      onClick={onClick}
      disabled={!module.is_unlocked}
      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-colors text-left ${
        module.is_unlocked
          ? 'bg-card border-border/50 hover:border-primary/30 hover:bg-card/80'
          : 'bg-muted/20 border-border/20 opacity-60 cursor-not-allowed'
      }`}
    >
      <span className="text-2xl shrink-0">{module.icon || '📘'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground truncate">{module.title}</h3>
          {module.is_completed && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Tier {module.tier_required} • {module.lesson_count} lessons
        </p>
        {module.is_unlocked && module.lessons_completed > 0 && !module.is_completed && (
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={progress} className="h-1.5 flex-1 bg-muted/30" />
            <span className="text-[10px] text-muted-foreground">
              {module.lessons_completed}/{module.lesson_count}
            </span>
          </div>
        )}
      </div>
      {module.is_unlocked ? (
        <ChevronRight size={16} className="text-muted-foreground shrink-0" />
      ) : (
        <Lock size={14} className="text-muted-foreground shrink-0" />
      )}
    </button>
  );
};
