import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Volume2, Grid3X3, AlertCircle } from "lucide-react";
import PhoneMock from "./ui/phone-mock";
import { useElevenLabsConversation } from "@/hooks/use-elevenlabs-conversation";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CallState = 'incoming' | 'active' | 'ended';

export default function VoiceCallModal({ isOpen, onClose }: VoiceCallModalProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  
  const {
    callState: elevenLabsState,
    isConnected,
    isSpeaking,
    callDuration,
    error,
    startConversation,
    endConversation,
  } = useElevenLabsConversation();

  // Map ElevenLabs states to our modal states
  const getCallState = (): CallState => {
    if (elevenLabsState === 'idle' || elevenLabsState === 'connecting') return 'incoming';
    if (elevenLabsState === 'connected' || elevenLabsState === 'speaking' || elevenLabsState === 'listening') return 'active';
    return 'ended';
  };

  const callState = getCallState();

  const getCallStatus = (): string => {
    switch (elevenLabsState) {
      case 'idle':
        return 'Chiamata in arrivo...';
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
      resetCallState();
    }
  }, [isOpen]);

  const resetCallState = () => {
    setIsMuted(false);
    setIsSpeakerOn(false);
  };

  const acceptCall = async () => {
    try {
      await startConversation();
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const endCall = async () => {
    try {
      await endConversation();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to end conversation:', error);
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
                onClick={onClose}
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
              <h3 className="text-xl font-medium mb-1">Bella Vita AI</h3>
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
                {(callState === 'incoming' || isSpeaking) && (
                  <div className="absolute inset-0 rounded-full border-4 border-ios-green opacity-100 ripple"></div>
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
                    onClick={onClose}
                    className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full p-0"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                  <Button
                    onClick={acceptCall}
                    className="w-16 h-16 bg-ios-green hover:bg-green-600 rounded-full p-0 pulse-call"
                  >
                    <Phone className="w-6 h-6" />
                  </Button>
                </div>
              )}

              {/* Active call controls */}
              {callState === 'active' && (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-8">
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
                      className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full p-0"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Call ended state */}
              {(callState === 'ended' || elevenLabsState === 'error') && (
                <div className="text-center space-y-4">
                  <p className="text-white/80 mb-4">
                    {elevenLabsState === 'error' ? 'Errore nella chiamata' : 'Chiamata terminata'}
                  </p>
                  {error && (
                    <p className="text-red-400 text-sm mb-4">{error}</p>
                  )}
                  <Button 
                    onClick={onClose}
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
