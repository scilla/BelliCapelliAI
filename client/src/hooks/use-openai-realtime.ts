import { useState, useCallback, useRef, useEffect } from 'react';

export type CallState = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'ended' | 'error';

interface UseOpenAIRealtimeReturn {
  callState: CallState;
  isConnected: boolean;
  isSpeaking: boolean;
  callDuration: number;
  error: string | null;
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
  resetConversation: () => void;
  requestMicrophonePermission: () => Promise<boolean>;
}

export function useOpenAIRealtime(): UseOpenAIRealtimeReturn {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Create and start the timer for tracking call duration
  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  // Stop the timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // Stop existing stream if any
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Store the stream reference so we can stop it later
      micStreamRef.current = stream;
      
      const tracks = stream.getAudioTracks();
      if (tracks.length > 0) {
        // Microphone access granted
        return true;
      }
      return false;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setError('Microphone permission is required for the conversation.');
      return false;
    }
  }, []);

  // Clean up all WebRTC resources
  const cleanupResources = useCallback(() => {
    // Close data channel if open
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    // Close peer connection if open
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Stop microphone stream if active
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    // Stop audio element if playing
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.srcObject = null;
    }
    
    // Stop timer
    stopTimer();
  }, [stopTimer]);

  // Handle SDP negotiation according to OpenAI's documentation
  const negotiate = useCallback(async (token: string, rtcUrl: string, model?: string) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;
    
    try {

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Send the SDP offer to OpenAI realtime API
      const realTimeUrl = `${rtcUrl}?model=${model || 'gpt-4o-realtime-preview'}`;
      const sdp = pc.localDescription?.sdp || '';
      
      const sdpResponse = await fetch(realTimeUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/sdp'
        },
        body: sdp
      });
      
      if (!sdpResponse.ok) {
        throw new Error(`HTTP error! Status: ${sdpResponse.status}`);
      }
      
      // Get the SDP answer as raw text
      const sdpAnswer = await sdpResponse.text();
      
      // Create and set remote description from the SDP answer
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription({
          type: 'answer',
          sdp: sdpAnswer
        });
      }
    } catch (error: any) {
      console.error('Negotiation failed:', error);
      setError(`Failed to establish connection with OpenAI: ${error?.message || 'Unknown error'}`);
      setCallState('error');
      cleanupResources();
    }
  }, [cleanupResources]);

  // Start the conversation
  const startConversation = useCallback(async () => {
    try {
      console.log('Starting OpenAI conversation...');
      
      // Reset state
      setError(null);
      setCallState('connecting');
      setIsSpeaking(false);
      
      // Clean up any existing resources
      cleanupResources();
      
      // Request microphone permission
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setError('Microphone permission is required for the conversation.');
        setCallState('error');
        return;
      }

      // Get ephemeral token from the backend
      const response = await fetch('/api/realtime-session', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const { token, sessionId, model } = await response.json();
      if (!token) {
        throw new Error('No token received from server');
      }
      
      // Define OpenAI Realtime URL
      const rtcUrl = 'https://api.openai.com/v1/realtime';
      
      // Create new peer connection with default STUN servers
      const pc = new RTCPeerConnection({
        iceServers: [{
          urls: 'stun:stun.l.google.com:19302'
        }]
      });
      peerConnectionRef.current = pc;
      
      // Add microphone stream to peer connection
      if (micStreamRef.current) {
        console.log('Adding microphone stream to peer connection...');
        micStreamRef.current.getTracks().forEach(track => pc.addTrack(track, micStreamRef.current!));
      }
      
      // Create data channel for tool communication
      console.log('Creating data channel...');
      const dc = pc.createDataChannel('tool');
      dataChannelRef.current = dc;
      
      // Handle data channel messages (function calls from the model)
      dc.onmessage = async ({ data }) => {
        try {
          console.log('Received message from data channel:', data);
          const msg = JSON.parse(data);
          
          if (msg.type === 'tool' && msg.name === 'google_calendar_create_event') {
            console.log('Processing calendar event creation:', msg.args);
            
            // Convert from OpenAI's format to our API's format
            const calendarData = {
              summary: msg.args.summary,
              startTime: msg.args.start,
              endTime: msg.args.end
            };
            
            // Call our existing calendar API
            const result = await fetch('/api/calendar/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(calendarData)
            }).then(r => r.json());
            
            // Send the result back to OpenAI
            console.log('Sending calendar creation result back to OpenAI:', result);
            dc.send(JSON.stringify({ tool_result_id: msg.id, result }));
          }
        } catch (error) {
          console.error('Error processing data channel message:', error);
        }
      };
      
      // Handle incoming audio
      pc.ontrack = ({ streams }) => {
        console.log('Received audio track from OpenAI');
        setIsSpeaking(true);
        
        // Create audio element for playback if it doesn't exist
        if (!audioElementRef.current) {
          const audio = new Audio();
          audio.autoplay = true;
          audioElementRef.current = audio;
        }
        
        // Set the stream as the source for the audio element
        audioElementRef.current.srcObject = streams[0];
        audioElementRef.current.play().catch(console.error);
        
        // Track when OpenAI is speaking or not
        const audioTrack = streams[0].getAudioTracks()[0];
        
        if (audioTrack) {
          // Create a silent audio context to detect when model stops speaking
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(streams[0]);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          
          const checkAudioActivity = () => {
            if (!analyser) return;
            
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);
            
            // Check if there's any audio activity
            const sum = dataArray.reduce((a, b) => a + b, 0);
            const isActive = sum > 10; // Threshold for activity
            
            setIsSpeaking(isActive);
            
            if (pc.connectionState === 'connected') {
              requestAnimationFrame(checkAudioActivity);
            }
          };
          
          requestAnimationFrame(checkAudioActivity);
        }
      };
      
      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        switch (pc.connectionState) {
          case 'connected':
            setCallState('connected');
            startTimer();
            break;
            
          case 'disconnected':
          case 'failed':
          case 'closed':
            setCallState('ended');
            stopTimer();
            cleanupResources();
            break;
        }
      };
      
      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {};
      
      // Disable automatic renegotiation to prevent m-line order conflicts
      // WebRTC with OpenAI doesn't need renegotiation for our use case
      pc.onnegotiationneeded = () => {
        // Do not call negotiate here to avoid the m-line ordering issue
      };
      
      // ICE candidate handler
      pc.onicecandidate = () => {};
      
      // Start negotiation
      await negotiate(token, rtcUrl, model);
      
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      setError(`Failed to start conversation: ${error?.message || 'Unknown error'}`);
      setCallState('error');
      cleanupResources();
    }
  }, [cleanupResources, negotiate, requestMicrophonePermission, startTimer, stopTimer]);

  // End the conversation
  const endConversation = useCallback(async () => {
    try {
      setCallState('ended');
      cleanupResources();
    } catch (error: any) {
      setError(`Failed to end conversation: ${error.message || 'Unknown error'}`);
      setCallState('ended');
      cleanupResources();
    }
  }, [cleanupResources]);

  // Reset the conversation state
  const resetConversation = useCallback(() => {
    cleanupResources();
    setCallState('idle');
    setCallDuration(0);
    setError(null);
    setIsSpeaking(false);
  }, [cleanupResources]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  return {
    callState,
    isConnected: callState === 'connected' || callState === 'speaking' || callState === 'listening',
    isSpeaking,
    callDuration,
    error,
    startConversation,
    endConversation,
    resetConversation,
    requestMicrophonePermission
  };
}

export default useOpenAIRealtime;
