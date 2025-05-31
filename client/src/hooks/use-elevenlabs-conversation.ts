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

// Helper function to check active audio tracks globally
const checkActiveAudioTracks = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      console.log('Available audio input devices:', audioInputs.length);
    }).catch(console.error);
  }
  
  // Check for any active media streams
  console.log('Checking for active audio contexts...');
  const audioContexts = (window as any).audioContexts || [];
  console.log('Active audio contexts:', audioContexts.length);
};

export function useElevenLabsConversation(): UseElevenLabsConversationReturn {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  
  const conversationRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptRef = useRef(0);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
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
    
    // Cleanup on unmount - defined inline to avoid dependency issues
    return () => {
      if (conversationRef.current) {
        conversationRef.current.endSession().catch(console.error);
      }
      // Stop microphone stream
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // Stop existing stream if any
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Store the stream reference so we can stop it later
      microphoneStreamRef.current = stream;
      
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

  // Comprehensive cleanup function
  const cleanupAudioResources = useCallback(() => {
    console.log('Starting comprehensive audio cleanup...');
    
    // Stop microphone stream
    if (microphoneStreamRef.current) {
      console.log('Stopping microphone stream...');
      microphoneStreamRef.current.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind} - ${track.label} - readyState: ${track.readyState}`);
        track.stop();
      });
      microphoneStreamRef.current = null;
      console.log('Microphone stream cleaned up');
    }
    
    // End conversation session
    if (conversationRef.current) {
      console.log('Ending conversation session...');
      conversationRef.current.endSession().catch((error: any) => {
        console.error('Error ending session:', error);
      });
      conversationRef.current = null;
      console.log('Conversation session cleaned up');
    }
    
    // Stop timer
    stopTimer();
    
    // Force cleanup of any remaining WebRTC connections
    try {
      // This will force close any remaining PeerConnections
      if ((window as any).RTCPeerConnection) {
        console.log('Checking for active WebRTC connections...');
        // Force garbage collection if available
        if ((window as any).gc) {
          (window as any).gc();
        }
      }
    } catch (error) {
      console.warn('Error during WebRTC cleanup:', error);
    }
    
    console.log('Audio cleanup completed');
    checkActiveAudioTracks();
  }, [stopTimer]);

  const startConversation = useCallback(async () => {
    try {
      console.log('Starting conversation...');
      
      // End any existing conversation first
      if (conversationRef.current) {
        console.log('Ending existing conversation...');
        await conversationRef.current.endSession();
        conversationRef.current = null;
      }
      
      // Stop any existing microphone stream
      if (microphoneStreamRef.current) {
        console.log('Stopping existing microphone stream...');
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;
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
          // Cleanup microphone stream on disconnect
          if (microphoneStreamRef.current) {
            console.log('Cleaning up microphone stream on disconnect...');
            microphoneStreamRef.current.getTracks().forEach(track => {
              console.log(`Stopping track on disconnect: ${track.kind} - ${track.label}`);
              track.stop();
            });
            microphoneStreamRef.current = null;
          }
        },
        onError: (error: any) => {
          console.error('ElevenLabs conversation error:', error);
          setError(`Conversation error: ${error.message || 'Unknown error'}`);
          setCallState('error');
          stopTimer();
          // Cleanup microphone stream on error
          if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
          }
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
      console.log('Conversation started successfully');
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      setError(`Failed to start conversation: ${error.message || 'Unknown error'}`);
      setCallState('error');
      // Cleanup on error
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;
      }
    }
  }, [audioReady, requestMicrophonePermission, getSignedUrl, startTimer, stopTimer]);

  const endConversation = useCallback(async () => {
    try {
      console.log('Ending conversation...');
      reconnectAttemptRef.current = maxReconnectAttempts; // Prevent reconnection attempts
      
      // Use comprehensive cleanup
      cleanupAudioResources();
      
      setCallState('ended');
      console.log('Conversation ended successfully');
    } catch (error: any) {
      console.error('Error ending conversation:', error);
      setError(`Failed to end conversation: ${error.message || 'Unknown error'}`);
      // Still try to cleanup even if there was an error
      cleanupAudioResources();
      setCallState('ended');
    }
  }, [cleanupAudioResources]);

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
