import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Volume2, Grid3X3, AlertCircle } from "lucide-react";
import PhoneMock from "./ui/phone-mock";
import { useOpenAIRealtime } from "@/hooks/use-openai-realtime";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CallState = 'incoming' | 'active' | 'ended';

export default function VoiceCallModal({ isOpen, onClose }: VoiceCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  
  const {
    callState: openAIState,
    isConnected,
    isSpeaking,
    callDuration,
    error,
    startConversation,
    endConversation,
    resetConversation,
  } = useOpenAIRealtime();

  // Map OpenAI states to our modal states
  const getCallState = (): CallState => {
    if (openAIState === 'idle' || openAIState === 'connecting') return 'incoming';
    if (openAIState === 'connected' || openAIState === 'speaking' || openAIState === 'listening') return 'active';
    return 'ended';
  };

  const callState = getCallState();

  const getCallStatus = (): string => {
    if (isEnding) return 'Terminando chiamata...';
    
    switch (openAIState) {
      case 'idle':
        return 'In attesa di chiamata...';
      case 'connecting':
        return 'Connessione in corso...';
      case 'connected':
        return 'Chiamata attiva';
      case 'speaking':
        return 'AI sta parlando...';
      case 'listening':
        return 'In ascolto...';
      case 'ended':
        return 'Chiamata terminata';
      case 'error':
        return error || 'Errore di connessione';
      default:
        return 'Chiamata in arrivo...';
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, resetting conversation state...');
      resetConversation();
      resetCallState();
    } else {
      // When modal closes, ensure conversation is reset for next time
      console.log('Modal closed, ensuring conversation is reset...');
      resetConversation();
      resetCallState();
    }
  }, [isOpen, resetConversation]);

  const resetCallState = () => {
    setIsMuted(false);
    setIsSpeakerOn(false);
    setIsEnding(false);
  };

  const acceptCall = async () => {
    try {
      await startConversation();
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const endCall = async () => {
    if (isEnding) return; // Prevent multiple calls
    
    try {
      console.log('Ending call from UI...');
      setIsEnding(true);
      await endConversation();
      // Give a short delay to ensure the conversation is properly ended
      setTimeout(() => {
        console.log('Closing modal after ending call');
        setIsEnding(false);
        resetConversation(); // Ensure clean state for next open
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to end conversation:', error);
      setIsEnding(false);
      resetConversation(); // Reset even on error
      // Close modal anyway if there's an error
      onClose();
    }
  };

  const rejectCall = async () => {
    if (isEnding) return; // Prevent multiple calls
    
    try {
      console.log('Rejecting incoming call...');
      setIsEnding(true);
      // If there's any active conversation, end it
      if (openAIState !== 'idle') {
        await endConversation();
      }
      resetConversation(); // Ensure clean state
      setIsEnding(false);
      onClose();
    } catch (error) {
      console.error('Failed to reject call:', error);
      resetConversation(); // Reset even on error
      setIsEnding(false);
      onClose();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackdropClick = () => {
    if (callState === 'incoming' || callState === 'ended') {
      resetConversation();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="p-0 border-0 bg-transparent shadow-none max-w-none w-full h-full md:w-96 md:h-auto md:max-h-[80vh] flex items-center justify-center"
        onClick={handleBackdropClick}
      >
        <div 
          className="w-full h-full md:w-96 md:h-auto md:max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <PhoneMock>
            {/* Call Header */}
            <div className="relative p-6 pt-12 md:pt-6 text-center bg-gradient-to-b from-gray-900 to-black text-white">
              {/* Close button for desktop */}
              <button 
                onClick={() => {
                  resetConversation();
                  onClose();
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full items-center justify-center hover:bg-white/30 transition-colors hidden md:flex"
              >
                ×
              </button>
              
              {/* Mobile status bar */}
              <div className="md:hidden mb-4 flex justify-between items-center text-xs">
                <span>9:41</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs">●●●</span>
                  <span className="text-xs">📶</span>
                  <span>100%</span>
                  <span className="text-xs">🔋</span>
                </div>
              </div>

              <div className="text-sm text-white/60 mb-2">{getCallStatus()}</div>
              <h3 className="text-xl font-medium mb-1">Belli Capelli AI</h3>
              <p className="text-white/80 text-sm">Consulente Esperto</p>
            </div>

            {/* Avatar */}
            <div className="flex justify-center py-8 bg-gradient-to-b from-black to-gray-900">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" 
                  alt="AI Beauty Consultant" 
                  className="w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl" 
                />
                {/* Call indicator ring */}
                {(isSpeaking) && (
                  <div className="absolute top-0 left-0 w-32 h-32 rounded-full border-4 border-ios-green animate-ping-center"></div>
                )}
              </div>
            </div>

            {/* Call Controls */}
            <div className="p-8 bg-gray-900 text-white">
              {/* Call timer */}
              {callState === 'active' && (
                <div className="text-center text-white/60 text-sm mb-8">
                  {formatTime(callDuration)}
                </div>
              )}
              
              {/* Incoming call buttons */}
              {callState === 'incoming' && (
                <div className="flex justify-center space-x-8">
                  <Button
                    onClick={acceptCall}
                    disabled={isEnding}
                    className="w-16 h-16 bg-ios-green hover:bg-green-600 rounded-full p-0 pulse-call disabled:bg-green-300 disabled:cursor-not-allowed"
                  >
                    <Phone className="w-6 h-6" />
                  </Button>
                </div>
              )}

              {/* Active call controls */}
              {callState === 'active' && (
                <div>
                  <div className="flex justify-center gap-10 mb-8">
                    <Button
                      onClick={toggleMute}
                      className={`w-14 h-14 rounded-full p-0 ${
                        isMuted ? 'bg-vibrant-coral' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={toggleSpeaker}
                      className={`w-14 h-14 rounded-full p-0 ${
                        isSpeakerOn ? 'bg-vibrant-coral' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </Button>
                    <Button className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full p-0">
                      <Grid3X3 className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <Button
                      onClick={endCall}
                      disabled={isEnding}
                      className={`w-16 h-16 rounded-full p-0 ${
                        isEnding 
                          ? 'bg-red-300 cursor-not-allowed' 
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      <PhoneOff className={`w-6 h-6 ${isEnding ? 'animate-pulse' : ''}`} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Call ended state */}
              {(callState === 'ended' || openAIState === 'error') && (
                <div className="text-center space-y-4">
                  <p className="text-white/80 mb-4">
                    {openAIState === 'error' ? 'Errore nella chiamata' : 'Chiamata terminata'}
                  </p>
                  {error && (
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                  )}
                  <Button 
                    onClick={() => {
                      resetConversation();
                      onClose();
                    }}
                    className="bg-vibrant-coral hover:bg-vibrant-coral/90 text-white px-8 py-3 rounded-full font-medium"
                  >
                    Chiudi
                  </Button>
                </div>
              )}
            </div>

            {/* iOS-style swipe indicator for mobile */}
            <div className="md:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full"></div>
          </PhoneMock>
        </div>
      </DialogContent>
    </Dialog>
  );
}
