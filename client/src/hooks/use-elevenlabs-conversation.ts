import { useState, useCallback, useRef, useEffect } from 'react';
import { Conversation } from '@elevenlabs/client';

export type CallState = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'ended' | 'error';

interface UseElevenLabsConversationReturn {
  callState: CallState;
  isConnected: boolean;
  isSpeaking: boolean;
  callDuration: number;
  error: string | null;
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
  requestMicrophonePermission: () => Promise<boolean>;
}

// Helper function to ensure the audio context is resumed
const ensureAudioContext = async () => {
  // Create a temporary audio context just to ensure it's in a running state
  const tempContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (tempContext.state !== 'running') {
    console.log('Resuming audio context...');
    await tempContext.resume();
    // Add a small delay to ensure the audio context is fully activated
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return tempContext.state === 'running';
};

export function useElevenLabsConversation(): UseElevenLabsConversationReturn {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  
  const conversationRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 3;

  // Check and prepare audio context when component mounts
  useEffect(() => {
    const prepareAudio = async () => {
      try {
        const ready = await ensureAudioContext();
        setAudioReady(ready);
      } catch (err) {
        console.error('Error preparing audio context:', err);
        setAudioReady(false);
      }
    };
    
    prepareAudio();
    
    // Cleanup on unmount
    return () => {
      if (conversationRef.current) {
        conversationRef.current.endSession().catch(console.error);
      }
      stopTimer();
    };
  }, []);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Keep the stream active to maintain microphone access
      const tracks = stream.getAudioTracks();
      if (tracks.length > 0) {
        console.log('Microphone access granted');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setError('Microphone permission is required for the conversation.');
      return false;
    }
  }, []);

  const getSignedUrl = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/signed-url');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw new Error('Failed to get signed URL from server');
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startConversation = useCallback(async () => {
    try {
      // End any existing conversation first
      if (conversationRef.current) {
        await conversationRef.current.endSession();
        conversationRef.current = null;
      }
      
      setError(null);
      setCallState('connecting');

      // Request microphone permission first (just like in example.js)
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setError('Microphone permission is required for the conversation.');
        setCallState('error');
        return;
      }

      // Get signed URL from our API
      const signedUrl = await getSignedUrl();
      console.log('Got signed URL:', signedUrl);

      // Start ElevenLabs conversation with minimal configuration (like example.js)
      const conversation = await Conversation.startSession({
        signedUrl: signedUrl,
        onConnect: () => {
          console.log('Connected to ElevenLabs');
          setCallState('connected');
          setCallDuration(0);
          startTimer();
        },
        onDisconnect: () => {
          console.log('Disconnected from ElevenLabs');
          setCallState('ended');
          stopTimer();
        },
        onError: (error: any) => {
          console.error('ElevenLabs conversation error:', error);
          setError(`Conversation error: ${error.message || 'Unknown error'}`);
          setCallState('error');
          stopTimer();
        },
        onModeChange: (mode: { mode: string }) => {
          console.log('Mode changed:', mode);
          if (mode.mode === 'speaking') {
            setCallState('speaking');
          } else if (mode.mode === 'listening') {
            setCallState('listening');
          }
        }
      });

      conversationRef.current = conversation;
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      setError(`Failed to start conversation: ${error.message || 'Unknown error'}`);
      setCallState('error');
    }
  }, [audioReady, requestMicrophonePermission, getSignedUrl, startTimer, stopTimer]);

  const endConversation = useCallback(async () => {
    try {
      reconnectAttemptRef.current = maxReconnectAttempts; // Prevent reconnection attempts
      if (conversationRef.current) {
        await conversationRef.current.endSession();
        conversationRef.current = null;
      }
      setCallState('ended');
      stopTimer();
    } catch (error: any) {
      console.error('Error ending conversation:', error);
      setError(`Failed to end conversation: ${error.message || 'Unknown error'}`);
    }
  }, [stopTimer]);

  return {
    callState,
    isConnected: callState === 'connected' || callState === 'speaking' || callState === 'listening',
    isSpeaking: callState === 'speaking',
    callDuration,
    error,
    startConversation,
    endConversation,
    requestMicrophonePermission
  };
}

export default useElevenLabsConversation;
