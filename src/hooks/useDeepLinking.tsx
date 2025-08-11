import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';

export const useDeepLinking = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle app opening from deep link
    const handleAppUrlOpen = (event: any) => {
      const url = event.url;
      console.log('Deep link received:', url);
      
      // Parse the URL to extract dream ID
      const urlObj = new URL(url);
      const dreamId = urlObj.pathname.split('/dream/')[1];
      
      if (dreamId) {
        // Navigate to the dream detail page
        navigate(`/dream/${dreamId}`);
      }
    };

    // Add listener for app URL open events
    App.addListener('appUrlOpen', handleAppUrlOpen);

    // Handle initial app launch with URL
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        handleAppUrlOpen({ url: result.url });
      }
    });

    // Cleanup
    return () => {
      App.removeAllListeners();
    };
  }, [navigate]);
};