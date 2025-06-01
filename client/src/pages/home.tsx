import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MicOff, CheckCircle, MessageSquare, PhoneCall, Users, Star, Clock, MapPin, Mail, Instagram, Facebook } from "lucide-react";
import VoiceCallModal from "@/components/voice-call-modal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Header */}
      <header className="bg-cream-white/95 backdrop-blur-md fixed w-full top-0 z-40 border-b border-warm-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-espresso rounded-full flex items-center justify-center">
                <div className="w-6 h-6 text-warm-gold flex items-center justify-center">✂</div>
              </div>
              <span className="font-playfair text-2xl font-semibold text-espresso">Bella Vita</span>
            </div>
            <Button onClick={openModal} className="bg-vibrant-coral hover:bg-vibrant-coral/90 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
              <Phone className="w-4 h-4 mr-2" />
              Chiamaci Ora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cream-white to-warm-gold/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="fade-in">
            <h1 className="font-playfair text-5xl md:text-7xl font-bold text-espresso mb-8 leading-tight">
              Trasforma i Tuoi Capelli<br />
              <span className="text-warm-gold">con Eleganza Italiana</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Scopri l'arte della bellezza italiana nel nostro salone esclusivo. 
              Parla direttamente con il nostro esperto AI per una consulenza personalizzata.
            </p>
            
            <div className="space-y-6 mb-16">
              <Button 
                onClick={openModal} 
                className="bg-vibrant-coral hover:bg-vibrant-coral/90 text-white px-12 py-5 rounded-full text-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl pulse-call"
              >
                <MicOff className="w-6 h-6 mr-3" />
                Parla con il Nostro Esperto AI
              </Button>
              <p className="text-sm text-foreground/60">✨ Consulenza gratuita in tempo reale</p>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="slide-up">
                <div className="text-3xl font-bold text-espresso mb-2">500+</div>
                <div className="text-foreground/70">Clienti Soddisfatti</div>
              </div>
              <div className="slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-3xl font-bold text-espresso mb-2">15</div>
                <div className="text-foreground/70">Anni di Esperienza</div>
              </div>
              <div className="slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-3xl font-bold text-espresso mb-2">4.9★</div>
                <div className="text-foreground/70">Valutazione Media</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-espresso mb-6">
              I Nostri Servizi Esclusivi
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
              Ogni servizio è un'esperienza di bellezza italiana, personalizzata per esaltare la tua unicità
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Service 1 */}
            <Card className="bg-cream-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0">
              <CardContent className="p-8">
                <img 
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Taglio e styling professionale" 
                  className="w-full h-48 object-cover rounded-xl mb-6" 
                />
                <h3 className="font-playfair text-2xl font-semibold text-espresso mb-4">Taglio & Styling</h3>
                <p className="text-foreground/70 mb-6">Tagli personalizzati che esaltano la tua personalità con tecniche innovative italiane</p>
                <div className="text-2xl font-bold text-warm-gold mb-4">€85-120</div>
                <Button 
                  onClick={openModal} 
                  className="w-full bg-espresso hover:bg-espresso/90 text-white py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Consulenza Vocale
                </Button>
              </CardContent>
            </Card>

            {/* Service 2 */}
            <Card className="bg-cream-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0">
              <CardContent className="p-8">
                <img 
                  src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Colorazione capelli" 
                  className="w-full h-48 object-cover rounded-xl mb-6" 
                />
                <h3 className="font-playfair text-2xl font-semibold text-espresso mb-4">Colorazione</h3>
                <p className="text-foreground/70 mb-6">Colori ricchi e luminosi con prodotti premium italiani per risultati duraturi</p>
                <div className="text-2xl font-bold text-warm-gold mb-4">€95-180</div>
                <Button 
                  onClick={openModal} 
                  className="w-full bg-espresso hover:bg-espresso/90 text-white py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Consulenza Vocale
                </Button>
              </CardContent>
            </Card>

            {/* Service 3 */}
            <Card className="bg-cream-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0">
              <CardContent className="p-8">
                <img 
                  src="https://images.unsplash.com/photo-1559599101-f09722fb4948?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                  alt="Trattamenti luxury" 
                  className="w-full h-48 object-cover rounded-xl mb-6" 
                />
                <h3 className="font-playfair text-2xl font-semibold text-espresso mb-4">Trattamenti Luxury</h3>
                <p className="text-foreground/70 mb-6">Rituali di bellezza esclusivi per nutrire e rigenerare i tuoi capelli</p>
                <div className="text-2xl font-bold text-warm-gold mb-4">€65-150</div>
                <Button 
                  onClick={openModal} 
                  className="w-full bg-espresso hover:bg-espresso/90 text-white py-3 rounded-xl font-medium transition-all duration-300"
                >
                  Consulenza Vocale
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={openModal} 
              className="bg-vibrant-coral hover:bg-vibrant-coral/90 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              Parla con un Esperto per Tutti i Servizi
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-warm-gold/10 to-cream-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold text-espresso mb-6">
              Cosa Dicono i Nostri Clienti
            </h2>
            <p className="text-lg text-foreground/70">Storie di trasformazione e bellezza</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Testimonial 1 */}
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Maria Rossi" 
                    className="w-16 h-16 rounded-full object-cover mr-4" 
                  />
                  <div>
                    <div className="font-semibold text-espresso">Maria Rossi</div>
                    <div className="text-warm-gold flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-foreground/80 italic">"L'esperienza più incredibile! Il consulto vocale mi ha aiutato a scegliere il colore perfetto. Sono rinata!"</p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Giulia Bianchi" 
                    className="w-16 h-16 rounded-full object-cover mr-4" 
                  />
                  <div>
                    <div className="font-semibold text-espresso">Giulia Bianchi</div>
                    <div className="text-warm-gold flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-foreground/80 italic">"Professionalità italiana autentica. La consulenza vocale è geniale - così comodo e personale!"</p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="bg-white rounded-2xl shadow-lg border-0">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" 
                    alt="Sofia Verdi" 
                    className="w-16 h-16 rounded-full object-cover mr-4" 
                  />
                  <div>
                    <div className="font-semibold text-espresso">Sofia Verdi</div>
                    <div className="text-warm-gold flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-foreground/80 italic">"Atmosfera elegante e risultati straordinari. Il team è fantastico e la tecnologia AI è rivoluzionaria!"</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={openModal} 
              className="bg-espresso hover:bg-espresso/90 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Inizia la Tua Conversazione
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold text-espresso mb-8">
                Tradizione Italiana<br />
                <span className="text-warm-gold">Innovazione Moderna</span>
              </h2>
              <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                Nel cuore di Milano, uniamo l'arte della bellezza italiana con tecnologie all'avanguardia. 
                Il nostro assistente AI ti guida verso la scelta perfetta, mentre i nostri maestri parrucchieri 
                trasformano la tua visione in realtà.
              </p>
              <div className="space-y-4 mb-10">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-ios-green" />
                  <span className="text-foreground/80">Consulenza AI personalizzata 24/7</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-ios-green" />
                  <span className="text-foreground/80">Prodotti premium italiani certificati</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-ios-green" />
                  <span className="text-foreground/80">Maestri parrucchieri con 15+ anni esperienza</span>
                </div>
              </div>
              <Button 
                onClick={openModal} 
                className="bg-vibrant-coral hover:bg-vibrant-coral/90 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Phone className="w-5 h-5 mr-2" />
                Scopri la Differenza
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=700" 
                alt="Salone Bella Vita" 
                className="rounded-2xl shadow-2xl w-full h-auto" 
              />
              <div className="absolute -bottom-6 -right-6 bg-warm-gold text-white p-6 rounded-2xl shadow-xl">
                <div className="text-2xl font-bold mb-1">15+</div>
                <div className="text-sm">Anni di Eccellenza</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-espresso to-espresso/90 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-4xl md:text-6xl font-bold text-espresso mb-8">
            La Tua Trasformazione<br />
            <span className="text-warm-gold">Inizia Qui</span>
          </h2>
          <p className="text-xl mb-12 text-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Non aspettare. Parla subito con il nostro esperto AI e scopri 
            come possiamo esaltare la tua bellezza naturale con l'eleganza italiana.
          </p>
          
          <div className="space-y-6">
            <Button 
              onClick={openModal} 
              className="bg-vibrant-coral hover:bg-vibrant-coral/90 text-white px-16 py-6 rounded-full text-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl pulse-call"
            >
              <MicOff className="w-6 h-6 mr-3" />
              Chiama Ora - È Gratuito
            </Button>
            <p className="text-foreground/70 text-sm">
              ⚡ Risposta immediata • 🎯 Consulenza personalizzata • 💎 Risultati garantiti
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-warm-gold rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 text-espresso flex items-center justify-center">✂</div>
                </div>
                <span className="font-playfair text-3xl font-semibold">Bella Vita</span>
              </div>
              <p className="text-white/70 mb-6 max-w-md">
                Il salone di bellezza che unisce tradizione italiana e innovazione tecnologica 
                per un'esperienza unica e personalizzata.
              </p>
              <Button 
                onClick={openModal} 
                className="bg-vibrant-coral hover:bg-vibrant-coral/90 text-white px-6 py-3 rounded-full font-medium transition-all duration-300"
              >
                <Phone className="w-4 h-4 mr-2" />
                Parla con Noi
              </Button>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Contatti</h4>
              <div className="space-y-3 text-white/70">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Via Montenapoleone 12, Milano</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Lun-Sab: 9:00-19:00</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@bellavitasalon.it</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Seguici</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-vibrant-coral transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-vibrant-coral transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-vibrant-coral transition-colors">
                  <Users className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-8 text-center text-white/60">
            <p>&copy; 2024 Bella Vita Salon. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>

      {/* Voice Call Modal */}
      <VoiceCallModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
