import { registerPlugin } from '@capacitor/core';

export interface DreamDataPluginInterface {
  /**
   * Write the latest saved dream to the shared App Group container
   * so the iOS WidgetKit extension can display it on the home/lock screen.
   */
  saveLatestDream(options: {
    title: string;
    /** Short preview of the dream content (first ~120 chars) */
    preview: string;
    /** Human-readable date string, e.g. "Today" or "Apr 7" */
    date: string;
  }): Promise<void>;

  /**
   * Update the consecutive-day streak and total dream count for
   * the streak widget.
   */
  updateStreak(options: {
    days: number;
    totalDreams: number;
  }): Promise<void>;

  /**
   * Explicitly request a WidgetKit timeline reload.
   * Usually not needed — saveLatestDream/updateStreak already trigger it.
   */
  reloadWidgets(): Promise<void>;
}

const DreamDataPlugin = registerPlugin<DreamDataPluginInterface>('DreamDataPlugin', {
  // No web implementation — widget data is iOS-only
  web: undefined,
});

export { DreamDataPlugin };
