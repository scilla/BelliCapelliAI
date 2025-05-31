import { useState, useCallback, useRef } from 'react';
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

export function useElevenLabsConversation(): UseElevenLabsConversationReturn {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const conversationRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
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
      setError(null);
      setCallState('connecting');

      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setCallState('error');
        return;
      }

      // Get signed URL from our API
      const signedUrl = await getSignedUrl();

      // Start ElevenLabs conversation
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
  }, [requestMicrophonePermission, getSignedUrl, startTimer, stopTimer]);

  const endConversation = useCallback(async () => {
    try {
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

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (conversationRef.current) {
      conversationRef.current.endSession().catch(console.error);
    }
    stopTimer();
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
