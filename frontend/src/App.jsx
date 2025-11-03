import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, Plane, Sparkles, Loader2, MapPin, Calendar, Euro, 
  TrendingDown, Clock, Star, Users, Shield, Award, Filter,
  ChevronDown, X, Check, AlertCircle, Zap
} from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentFlights, setCurrentFlights] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [filters, setFilters] = useState({
    maxPrice: 1000,
    directOnly: false,
    maxStops: 3
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessage = {
      type: 'assistant',
      content: '¡Hola! 👋 Soy NomadAI, tu asistente de viajes inteligente. Dime a dónde quieres ir y te encuentro los mejores vuelos.',
      timestamp: new Date(),
      isWelcome: true
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setCurrentFlights([]);

    try {
      const response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: message })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al buscar vuelos');
      }

      const data = await response.json();

      let flights = data.results || [];
      
      flights = flights.filter(flight => {
        if (filters.directOnly && flight.transfers > 0) return false;
        if (flight.price > filters.maxPrice) return false;
        if (flight.transfers > filters.maxStops) return false;
        return true;
      });

      flights = sortFlights(flights, sortBy);
      flights = addFlightBadges(flights);

      setCurrentFlights(flights);

      const assistantMessage = {
        type: 'assistant',
        content: formatSearchResults(data, flights),
        flights: flights,
        parsed: data.parsed,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage = {
        type: 'assistant',
        content: `❌ ${error.message}`,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sortFlights = (flights, sortType) => {
    const sorted = [...flights];
    switch(sortType) {
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'duration':
        return sorted.sort((a, b) => (a.duration || 999) - (b.duration || 999));
      case 'stops':
        return sorted.sort((a, b) => a.transfers - b.transfers);
      default:
        return sorted;
    }
  };

  const addFlightBadges = (flights) => {
    if (flights.length === 0) return flights;

    const withBadges = flights.map((flight, index) => ({
      ...flight,
      badges: []
    }));

    const minPrice = Math.min(...flights.map(f => f.price));
    const cheapestIndex = flights.findIndex(f => f.price === minPrice);
    if (cheapestIndex !== -1) {
      withBadges[cheapestIndex].badges.push({ 
        type: 'best-price', 
        label: 'Mejor Precio',
        icon: '💰'
      });
    }

    const directFlights = flights.filter(f => f.direct);
    if (directFlights.length > 0) {
      const minDirectPrice = Math.min(...directFlights.map(f => f.price));
      const directIndex = flights.findIndex(f => f.direct && f.price === minDirectPrice);
      if (directIndex !== -1 && directIndex !== cheapestIndex) {
        withBadges[directIndex].badges.push({ 
          type: 'direct', 
          label: 'Directo',
          icon: '⚡'
        });
      }
    }

    if (flights.length > 1) {
      const secondIndex = 1;
      if (secondIndex !== cheapestIndex) {
        withBadges[secondIndex].badges.push({ 
          type: 'popular', 
          label: 'Más Popular',
          icon: '⭐'
        });
      }
    }

    return withBadges;
  };

  const formatSearchResults = (data, flights) => {
    if (!flights || flights.length === 0) {
      return `No encontré vuelos con esos criterios. 

💡 Intenta:
- Cambiar las fechas
- Elegir otra ciudad cercana
- Aumentar tu presupuesto
- Buscar con más flexibilidad`;
    }

    const { parsed } = data;
    let response = '✈️ **¡Encontré vuelos perfectos para ti!**\n\n';
    
    if (parsed.origin) {
      response += `📍 **Desde:** ${parsed.origin.toUpperCase()}\n`;
    }
    if (parsed.destination && !parsed.isAnywhere) {
      response += `📍 **Hasta:** ${parsed.destination.toUpperCase()}\n`;
    }
    if (parsed.budget) {
      response += `💰 **Presupuesto:** Hasta ${parsed.budget}€\n`;
    }
    
    response += `\n🎯 **${flights.length} opciones** encontradas`;
    
    return response;
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    
    if (currentFlights.length > 0) {
      const message = messages.find(m => m.flights && m.flights.length > 0);
      if (message) {
        let filtered = [...message.flights];
        
        const newFilters = { ...filters, [filterName]: value };
        filtered = filtered.filter(flight => {
          if (newFilters.directOnly && flight.transfers > 0) return false;
          if (flight.price > newFilters.maxPrice) return false;
          if (flight.transfers > newFilters.maxStops) return false;
          return true;
        });

        filtered = sortFlights(filtered, sortBy);
        filtered = addFlightBadges(filtered);
        setCurrentFlights(filtered);
      }
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    if (currentFlights.length > 0) {
      const sorted = sortFlights(currentFlights, newSortBy);
      const withBadges = addFlightBadges(sorted);
      setCurrentFlights(withBadges);
    }
  };

  const FlightCard = ({ flight, index }) => {
    const savings = index === 0 && currentFlights.length > 1 
      ? currentFlights[1].price - flight.price 
      : 0;

    return (
      <div className={`flight-card ${flight.badges.length > 0 ? 'featured' : ''}`}>
        {flight.badges.length > 0 && (
          <div className="flight-badges">
            {flight.badges.map((badge, idx) => (
              <span key={idx} className={`badge badge-${badge.type}`}>
                {badge.icon} {badge.label}
              </span>
            ))}
          </div>
        )}

        <div className="flight-header">
          <div className="flight-route">
            <div className="city-block">
              <span className="city-code">{flight.origin}</span>
              <span className="city-label">Origen</span>
            </div>
            <div className="route-line">
              <Plane className="plane-icon" size={20} />
              <div className="route-dots">
                {flight.transfers > 0 && (
                  <span className="stops-indicator">{flight.transfers} escala{flight.transfers > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
            <div className="city-block">
              <span className="city-code">{flight.destination}</span>
              <span className="city-label">Destino</span>
            </div>
          </div>
        </div>

        <div className="flight-details-grid">
          <div className="detail-item">
            <Calendar size={16} className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Salida</span>
              <span className="detail-value">
                {new Date(flight.departureDate).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </span>
            </div>
          </div>

          <div className="detail-item">
            <Calendar size={16} className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Regreso</span>
              <span className="detail-value">
                {new Date(flight.returnDate).toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </span>
            </div>
          </div>

          <div className="detail-item">
            <MapPin size={16} className="detail-icon" />
            <div className="detail-content">
              <span className="detail-label">Tipo</span>
              <span className="detail-value">
                {flight.direct ? '✈️ Directo' : `🔄 ${flight.transfers} parada${flight.transfers > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {flight.airline && (
            <div className="detail-item">
              <Plane size={16} className="detail-icon" />
              <div className="detail-content">
                <span className="detail-label">Aerolínea</span>
                <span className="detail-value">{flight.airline}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flight-footer">
          <div className="price-block">
            <div className="price-container">
              <span className="price-amount">{flight.price}€</span>
              <span className="price-label">por persona</span>
            </div>
            {savings > 0 && (
              <span className="savings">¡Ahorras {savings}€!</span>
            )}
          </div>
          
          <a 
            href={flight.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="book-button"
          >
            <span>Ver vuelo</span>
            <Zap size={16} />
          </a>
        </div>

        {index < 2 && (
          <div className="urgency-indicator">
            <AlertCircle size={14} />
            <span>Solo quedan pocas plazas a este precio</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="logo-section">
            <Sparkles className="logo-icon" />
            <h1 className="logo-title">NomadAI</h1>
          </div>
          <p className="hero-tagline">
            Encuentra los vuelos más baratos con inteligencia artificial
          </p>
          
          <div className="trust-indicators">
            <div className="trust-item">
              <Users size={20} />
              <span>10,000+ viajeros</span>
            </div>
            <div className="trust-item">
              <Star size={20} />
              <span>4.8/5 valoración</span>
            </div>
            <div className="trust-item">
              <Shield size={20} />
              <span>Pagos seguros</span>
            </div>
          </div>
        </div>
      </header>

      <div className="main-container">
        {currentFlights.length > 0 && (
          <div className="controls-bar">
            <div className="results-count">
              <Check className="check-icon" />
              <span>{currentFlights.length} vuelos encontrados</span>
            </div>
            
            <div className="controls-actions">
              <button 
                className="filter-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} />
                Filtros
                <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
              </button>

              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="price">Más barato</option>
                <option value="duration">Más rápido</option>
                <option value="stops">Menos escalas</option>
              </select>
            </div>
          </div>
        )}

        {showFilters && currentFlights.length > 0 && (
          <div className="filters-panel">
            <div className="filter-group">
              <label className="filter-label">
                <Euro size={16} />
                Precio máximo: {filters.maxPrice}€
              </label>
              <input 
                type="range"
                min="0"
                max="1000"
                step="10"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                className="filter-range"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <MapPin size={16} />
                Máximo de escalas
              </label>
              <select 
                value={filters.maxStops}
                onChange={(e) => handleFilterChange('maxStops', parseInt(e.target.value))}
                className="filter-select"
              >
                <option value="0">Solo directos</option>
                <option value="1">Hasta 1 escala</option>
                <option value="2">Hasta 2 escalas</option>
                <option value="3">Cualquiera</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-checkbox">
                <input 
                  type="checkbox"
                  checked={filters.directOnly}
                  onChange={(e) => handleFilterChange('directOnly', e.target.checked)}
                />
                <span>Solo vuelos directos</span>
              </label>
            </div>

            <button 
              className="filter-reset"
              onClick={() => {
                setFilters({
                  maxPrice: 1000,
                  directOnly: false,
                  maxStops: 3
                });
              }}
            >
              <X size={16} />
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="chat-section">
          <div className="messages-area">
            {messages.map((message, index) => (
              <div key={index} className={`message-wrapper ${message.type}`}>
                <div className={`message-bubble ${message.isWelcome ? 'welcome' : ''} ${message.isError ? 'error' : ''}`}>
                  <div className="message-content">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                {message.flights && message.flights.length > 0 && (
                  <div className="flights-container">
                    {currentFlights.map((flight, idx) => (
                      <FlightCard key={idx} flight={flight} index={idx} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="message-bubble">
                  <div className="loading-content">
                    <Loader2 className="spinner" size={20} />
                    <span>Buscando los mejores vuelos...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <div className="input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage(inputValue)}
                placeholder="Ej: Vuelo barato desde Madrid a Italia en diciembre..."
                disabled={isLoading}
                className="message-input"
              />
              
              <button
                onClick={handleVoiceInput}
                disabled={isLoading || isListening}
                className={`voice-button ${isListening ? 'listening' : ''}`}
                title="Usar voz"
              >
                <Mic size={20} />
              </button>
              
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className="send-button"
              >
                <Send size={20} />
              </button>
            </div>

            {messages.length === 1 && (
              <div className="quick-suggestions">
                <button 
                  onClick={() => setInputValue('Vuelo barato desde Madrid a Italia')}
                  className="suggestion-chip"
                >
                  <MapPin size={14} />
                  Madrid → Italia
                </button>
                <button 
                  onClick={() => setInputValue('Busca vuelos desde Barcelona a París este mes')}
                  className="suggestion-chip"
                >
                  <Calendar size={14} />
                  Barcelona → París
                </button>
                <button 
                  onClick={() => setInputValue('Vuelos baratos a playas de Europa, máximo 100€')}
                  className="suggestion-chip"
                >
                  <TrendingDown size={14} />
                  Playas baratas
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <Award size={20} />
            <span>Mejor precio garantizado</span>
          </div>
          <div className="footer-section">
            <Shield size={20} />
            <span>Pagos 100% seguros</span>
          </div>
          <div className="footer-section">
            <Users size={20} />
            <span>Soporte 24/7</span>
          </div>
        </div>
        <p className="footer-legal">
          Powered by Travelpayouts • Hecho con ❤️ por CarrascosaAI
        </p>
      </footer>
    </div>
  );
}

export default App;