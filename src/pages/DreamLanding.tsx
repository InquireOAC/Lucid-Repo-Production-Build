import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DreamEntry } from '@/types/dream';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Eye, Heart, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const DreamLanding = () => {
  const { dreamId } = useParams();
  const navigate = useNavigate();
  const [dream, setDream] = useState<DreamEntry | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    // Check if running in app or browser
    const userAgent = navigator.userAgent || navigator.vendor;
    const isCapacitorApp = window.location.protocol === 'capacitor:' || 
                          /capacitor/i.test(userAgent);
    setIsApp(isCapacitorApp);

    if (dreamId) {
      fetchDream();
    }
  }, [dreamId]);

  const fetchDream = async () => {
    try {
      if (!dreamId) return;

      // Fetch dream data
      const { data: dreamData, error: dreamError } = await supabase
        .from('dream_entries')
        .select('*')
        .eq('id', dreamId)
        .eq('is_public', true)
        .single();

      if (dreamError) throw dreamError;

      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_symbol, avatar_color')
        .eq('id', dreamData.user_id)
        .single();

      if (profileError) throw profileError;

      setDream(dreamData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching dream:', error);
      toast.error('Dream not found or no longer accessible');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApp = () => {
    // Try to open the app with deep link
    const appScheme = 'lucidrepo://';
    const deepLink = `${appScheme}dream/${dreamId}`;
    
    // Create a hidden iframe to trigger the app
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = deepLink;
    document.body.appendChild(iframe);
    
    // Clean up after a short delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
    
    // Fallback to app store after a delay if app didn't open
    setTimeout(() => {
      window.location.href = getAppStoreUrl();
    }, 2500);
  };

  const getAppStoreUrl = () => {
    const userAgent = navigator.userAgent || navigator.vendor;
    
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      // iOS App Store URL
      return 'https://apps.apple.com/app/lucid-repo/id123456789'; // Replace with actual App Store ID
    } else if (/android/i.test(userAgent)) {
      // Google Play Store URL
      return 'https://play.google.com/store/apps/details?id=app.dreamweaver.LucidRepo';
    }
    
    // Default to web version
    return window.location.origin;
  };

  const handleDownloadApp = () => {
    window.location.href = getAppStoreUrl();
  };

  if (loading) {
    return (
      <div className="min-h-screen starry-background flex items-center justify-center p-4">
        <div className="glass-card rounded-xl p-8 border border-white/10 backdrop-blur-xl max-w-md w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/20 rounded-lg"></div>
            <div className="h-4 bg-white/10 rounded-lg w-3/4"></div>
            <div className="h-32 bg-white/10 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dream || !profile) {
    return (
      <div className="min-h-screen starry-background flex items-center justify-center p-4">
        <div className="glass-card rounded-xl p-8 border border-white/10 backdrop-blur-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Eye className="h-6 w-6 text-white/50" />
          </div>
          <h2 className="text-xl font-semibold text-white/90 mb-2">Dream Not Found</h2>
          <p className="text-white/60 mb-6">This dream is no longer accessible or doesn't exist.</p>
          <Button onClick={handleDownloadApp} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Lucid Repo
          </Button>
        </div>
      </div>
    );
  }

  // If already in app, navigate to the dream
  if (isApp) {
    navigate(`/dream/${dreamId}`);
    return null;
  }

  return (
    <div className="min-h-screen starry-background p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* App Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Lucid Repo</h1>
          <p className="text-white/70">Discover and share lucid dreams</p>
        </div>

        {/* Dream Card */}
        <div className="glass-card rounded-xl p-6 border border-white/10 backdrop-blur-xl mb-6">
          {/* Profile Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center">
              {profile.avatar_symbol ? (
                <span className="text-lg">{profile.avatar_symbol}</span>
              ) : (
                <span className="text-white/90 font-semibold text-sm">
                  {(profile.display_name || profile.username)?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">
                {profile.display_name || profile.username}
              </p>
              <p className="text-xs text-white/60">shared a dream</p>
            </div>
          </div>

          {/* Dream Content */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white/95">{dream.title}</h2>
            
            {dream.image_url && (
              <div className="rounded-lg overflow-hidden border border-white/10">
                <img
                  src={dream.image_url}
                  alt="Dream visualization"
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <p className="text-white/80 leading-relaxed line-clamp-3">
              {dream.content}
            </p>

            {/* Tags */}
            {dream.tags && dream.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dream.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-white/60">
              <span>{new Date(dream.date).toLocaleDateString()}</span>
              <div className="flex items-center gap-3">
                {dream.like_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{dream.like_count}</span>
                  </div>
                )}
                {dream.comment_count !== undefined && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{dream.comment_count}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="glass-card rounded-xl p-6 border border-white/10 backdrop-blur-xl text-center">
          <h3 className="text-lg font-semibold text-white/90 mb-2">
            View Full Dream in Lucid Repo
          </h3>
          <p className="text-white/60 mb-6">
            Download the app to explore this dream and thousands more from the lucid dreaming community.
          </p>
          
          <div className="space-y-3">
            <Button onClick={handleOpenApp} className="w-full" size="lg">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in App
            </Button>
            
            <Button 
              onClick={handleDownloadApp} 
              variant="outline" 
              className="w-full"
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Lucid Repo
            </Button>
          </div>
        </div>

        {/* App Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Dream Journal",
              description: "Record and analyze your dreams",
              icon: "📖"
            },
            {
              title: "Lucid Training",
              description: "Learn techniques for lucid dreaming",
              icon: "🧠"
            },
            {
              title: "Community",
              description: "Share dreams with fellow dreamers",
              icon: "👥"
            }
          ].map((feature, index) => (
            <div key={index} className="glass-card rounded-lg p-4 border border-white/10 backdrop-blur-xl text-center">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <h4 className="font-semibold text-white/90 text-sm mb-1">{feature.title}</h4>
              <p className="text-xs text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DreamLanding;