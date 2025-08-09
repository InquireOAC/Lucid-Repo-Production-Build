import { useState, useRef, useCallback } from 'react';

interface AudioTrack {
  id: string;
  name: string;
  frequency: number;
  audioContext?: AudioContext;
  gainNode?: GainNode;
  oscillators?: OscillatorNode[];
}

export const useAudioManager = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);

  const initializeAudioContext = useCallback(async () => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      
      // Create gain node for volume control
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      gainNode.gain.value = 0.3; // Default volume
      
      audioContextRef.current = audioContext;
      gainNodeRef.current = gainNode;
      
      return audioContext;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw error;
    }
  }, []);

  const generateBinauralBeat = useCallback(async (frequency: number) => {
    const audioContext = await initializeAudioContext();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Stop any existing oscillators
    oscillatorsRef.current.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    oscillatorsRef.current = [];

    // Create binaural beat
    const baseFrequency = 200; // Base frequency in Hz
    const beatFrequency = frequency; // The desired binaural beat frequency
    
    // Left ear: base frequency
    const leftOsc = audioContext.createOscillator();
    leftOsc.frequency.value = baseFrequency;
    leftOsc.type = 'sine';
    
    // Right ear: base frequency + beat frequency
    const rightOsc = audioContext.createOscillator();
    rightOsc.frequency.value = baseFrequency + beatFrequency;
    rightOsc.type = 'sine';
    
    // Create stereo panner for each ear
    const leftPanner = audioContext.createStereoPanner();
    leftPanner.pan.value = -1; // Full left
    
    const rightPanner = audioContext.createStereoPanner();
    rightPanner.pan.value = 1; // Full right
    
    // Connect the audio graph
    leftOsc.connect(leftPanner);
    rightOsc.connect(rightPanner);
    
    if (gainNodeRef.current) {
      leftPanner.connect(gainNodeRef.current);
      rightPanner.connect(gainNodeRef.current);
    }
    
    oscillatorsRef.current = [leftOsc, rightOsc];
    
    const track: AudioTrack = {
      id: `binaural_${frequency}`,
      name: `${frequency}Hz Binaural Beat`,
      frequency,
      audioContext,
      gainNode: gainNodeRef.current || undefined,
      oscillators: [leftOsc, rightOsc]
    };
    
    setCurrentTrack(track);
    return track;
  }, [initializeAudioContext]);

  const play = useCallback(async () => {
    if (!currentTrack || !currentTrack.oscillators) {
      return;
    }

    try {
      const audioContext = audioContextRef.current;
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      currentTrack.oscillators.forEach(osc => {
        osc.start();
      });
      
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [currentTrack]);

  const pause = useCallback(async () => {
    if (audioContextRef.current) {
      await audioContextRef.current.suspend();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    try {
      oscillatorsRef.current.forEach(osc => {
        osc.stop();
        osc.disconnect();
      });
      oscillatorsRef.current = [];
      setIsPlaying(false);
      setCurrentTrack(null);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      // Use exponential scaling for more natural volume control
      const gainValue = Math.pow(volume, 2);
      gainNodeRef.current.gain.value = gainValue;
    }
  }, []);

  const generateNatureSounds = useCallback(async (soundType: 'rain' | 'ocean' | 'forest' | 'white-noise') => {
    const audioContext = await initializeAudioContext();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Stop any existing oscillators
    oscillatorsRef.current.forEach(osc => {
      osc.stop();
      osc.disconnect();
    });
    oscillatorsRef.current = [];

    // Generate nature sounds using Web Audio API
    let oscillators: OscillatorNode[] = [];

    switch (soundType) {
      case 'white-noise':
        // Create white noise using multiple oscillators
        for (let i = 0; i < 10; i++) {
          const osc = audioContext.createOscillator();
          osc.frequency.value = 100 + Math.random() * 2000;
          osc.type = 'square';
          
          const gain = audioContext.createGain();
          gain.gain.value = 0.05; // Very low volume for each oscillator
          
          osc.connect(gain);
          if (gainNodeRef.current) {
            gain.connect(gainNodeRef.current);
          }
          
          oscillators.push(osc);
        }
        break;
      
      case 'rain':
        // Simulate rain with filtered noise
        for (let i = 0; i < 8; i++) {
          const osc = audioContext.createOscillator();
          osc.frequency.value = 1000 + Math.random() * 3000;
          osc.type = 'sawtooth';
          
          const filter = audioContext.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 2000;
          
          const gain = audioContext.createGain();
          gain.gain.value = 0.03;
          
          osc.connect(filter);
          filter.connect(gain);
          if (gainNodeRef.current) {
            gain.connect(gainNodeRef.current);
          }
          
          oscillators.push(osc);
        }
        break;

      default:
        // Default to simple white noise
        const osc = audioContext.createOscillator();
        osc.frequency.value = 200;
        osc.type = 'sine';
        if (gainNodeRef.current) {
          osc.connect(gainNodeRef.current);
        }
        oscillators = [osc];
    }

    oscillatorsRef.current = oscillators;
    
    const track: AudioTrack = {
      id: `nature_${soundType}`,
      name: `${soundType.charAt(0).toUpperCase() + soundType.slice(1)} Sounds`,
      frequency: 0,
      audioContext,
      gainNode: gainNodeRef.current || undefined,
      oscillators
    };
    
    setCurrentTrack(track);
    return track;
  }, [initializeAudioContext]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    stop();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    gainNodeRef.current = null;
  }, [stop]);

  return {
    isPlaying,
    currentTrack,
    generateBinauralBeat,
    generateNatureSounds,
    play,
    pause,
    stop,
    setVolume,
    cleanup
  };
};