const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const TRAVELPAYOUTS_TOKEN = 'ef6200524726e2aedfc17208020a9eaa';
const TRAVELPAYOUTS_MARKER = '489503';

const cityToIATA = {
  // ESPAÑA
  'madrid': 'MAD',
  'barcelona': 'BCN',
  'sevilla': 'SVQ',
  'valencia': 'VLC',
  'málaga': 'AGP',
  'malaga': 'AGP',
  'bilbao': 'BIO',
  'alicante': 'ALC',
  'santiago': 'SCQ',
  'palma': 'PMI',
  'palma de mallorca': 'PMI',
  'mallorca': 'PMI',
  'ibiza': 'IBZ',
  'menorca': 'MAH',
  'mahón': 'MAH',
  'tenerife': 'TFS',
  'gran canaria': 'LPA',
  'las palmas': 'LPA',
  'lanzarote': 'ACE',
  'fuerteventura': 'FUE',
  'santander': 'SDR',
  'asturias': 'OVD',
  'oviedo': 'OVD',
  'vigo': 'VGO',
  'a coruña': 'LCG',
  'la coruña': 'LCG',
  'coruña': 'LCG',
  'jerez': 'XRY',
  'almería': 'LEI',
  'almeria': 'LEI',
  'granada': 'GRX',
  'murcia': 'RMU',
  'zaragoza': 'ZAZ',
  'pamplona': 'PNA',
  'san sebastián': 'EAS',
  'san sebastian': 'EAS',
  'vitoria': 'VIT',
  'badajoz': 'BJZ',
  'salamanca': 'SLM',
  'valladolid': 'VLL',
  'burgos': 'RGS',
  'león': 'LEN',
  'leon': 'LEN',
  
  // ITALIA
  'roma': 'FCO',
  'milán': 'MXP',
  'milan': 'MXP',
  'venecia': 'VCE',
  'florencia': 'FLR',
  'nápoles': 'NAP',
  'napoles': 'NAP',
  'bolonia': 'BLQ',
  'turín': 'TRN',
  'turin': 'TRN',
  'palermo': 'PMO',
  'catania': 'CTA',
  'bari': 'BRI',
  'pisa': 'PSA',
  'verona': 'VRN',
  'génova': 'GOA',
  'genova': 'GOA',
  'trieste': 'TRS',
  'bergamo': 'BGY',
  'ancona': 'AOI',
  'perugia': 'PEG',
  'cagliari': 'CAG',
  'olbia': 'OLB',
  'alghero': 'AHO',
  'rimini': 'RMI',
  'pescara': 'PSR',
  'brindisi': 'BDS',
  'lamezia': 'SUF',
  
  // FRANCIA
  'parís': 'CDG',
  'paris': 'CDG',
  'lyon': 'LYS',
  'marsella': 'MRS',
  'niza': 'NCE',
  'toulouse': 'TLS',
  'burdeos': 'BOD',
  'bordeaux': 'BOD',
  'nantes': 'NTE',
  'estrasburgo': 'SXB',
  'lille': 'LIL',
  'rennes': 'RNS',
  'montpellier': 'MPL',
  'ajaccio': 'AJA',
  'bastia': 'BIA',
  'biarritz': 'BIQ',
  'perpignan': 'PGF',
  'clermont-ferrand': 'CFE',
  'pau': 'PUF',
  'la rochelle': 'LRH',
  'poitiers': 'PIS',
  'limoges': 'LIG',
  'tours': 'TUF',
  'brest': 'BES',
  'mulhouse': 'MLH',
  
  // REINO UNIDO E IRLANDA
  'londres': 'LON',
  'manchester': 'MAN',
  'edimburgo': 'EDI',
  'glasgow': 'GLA',
  'birmingham': 'BHX',
  'liverpool': 'LPL',
  'bristol': 'BRS',
  'newcastle': 'NCL',
  'belfast': 'BFS',
  'leeds': 'LBA',
  'cardiff': 'CWL',
  'aberdeen': 'ABZ',
  'inverness': 'INV',
  'southampton': 'SOU',
  'exeter': 'EXT',
  'east midlands': 'EMA',
  'dublín': 'DUB',
  'dublin': 'DUB',
  'cork': 'ORK',
  'shannon': 'SNN',
  'knock': 'NOC',
  'kerry': 'KIR',
  
  // ALEMANIA
  'berlín': 'BER',
  'berlin': 'BER',
  'múnich': 'MUC',
  'munich': 'MUC',
  'fráncfort': 'FRA',
  'frankfurt': 'FRA',
  'hamburgo': 'HAM',
  'colonia': 'CGN',
  'düsseldorf': 'DUS',
  'dusseldorf': 'DUS',
  'stuttgart': 'STR',
  'dortmund': 'DTM',
  'hannover': 'HAJ',
  'nuremberg': 'NUE',
  'dresde': 'DRS',
  'leipzig': 'LEJ',
  'bremen': 'BRE',
  'karlsruhe': 'FKB',
  'münster': 'FMO',
  'munster': 'FMO',
  
  // PORTUGAL
  'lisboa': 'LIS',
  'oporto': 'OPO',
  'porto': 'OPO',
  'faro': 'FAO',
  'funchal': 'FNC',
  'madeira': 'FNC',
  'ponta delgada': 'PDL',
  'azores': 'PDL',
  
  // PAÍSES BAJOS Y BÉLGICA
  'ámsterdam': 'AMS',
  'amsterdam': 'AMS',
  'eindhoven': 'EIN',
  'rotterdam': 'RTM',
  'maastricht': 'MST',
  'groningen': 'GRQ',
  'bruselas': 'BRU',
  'charleroi': 'CRL',
  'amberes': 'ANR',
  'lieja': 'LGG',
  'ostende': 'OST',
  
  // EUROPA DEL ESTE
  'praga': 'PRG',
  'budapest': 'BUD',
  'varsovia': 'WAW',
  'cracovia': 'KRK',
  'viena': 'VIE',
  'bratislava': 'BTS',
  'bucarest': 'OTP',
  'sofía': 'SOF',
  'sofia': 'SOF',
  'zagreb': 'ZAG',
  'liubliana': 'LJU',
  'belgrado': 'BEG',
  'sarajevo': 'SJJ',
  'skopie': 'SKP',
  'tirana': 'TIA',
  'podgorica': 'TGD',
  'pristina': 'PRN',
  'ostrava': 'OSR',
  
  // GRECIA
  'atenas': 'ATH',
  'tesalónica': 'SKG',
  'tesalonica': 'SKG',
  'heraklion': 'HER',
  'creta': 'HER',
  'rodas': 'RHO',
  'corfú': 'CFU',
  'corfu': 'CFU',
  'santorini': 'JTR',
  'mykonos': 'JMK',
  'zakynthos': 'ZTH',
  'kos': 'KGS',
  'chania': 'CHQ',
  
  // ESCANDINAVIA
  'estocolmo': 'ARN',
  'copenhague': 'CPH',
  'oslo': 'OSL',
  'helsinki': 'HEL',
  'reikiavik': 'KEF',
  'reykjavik': 'KEF',
  'gotemburgo': 'GOT',
  'malmö': 'MMX',
  'malmo': 'MMX',
  'bergen': 'BGO',
  'trondheim': 'TRD',
  'stavanger': 'SVG',
  'aarhus': 'AAR',
  'billund': 'BLL',
  'turku': 'TKU',
  'tampere': 'TMP',
  'oulu': 'OUL',
  
  // SUIZA Y AUSTRIA
  'zurich': 'ZRH',
  'zúrich': 'ZRH',
  'ginebra': 'GVA',
  'basilea': 'BSL',
  'berna': 'BRN',
  'lugano': 'LUG',
  'salzburgo': 'SZG',
  'innsbruck': 'INN',
  'graz': 'GRZ',
  'klagenfurt': 'KLU',
  'linz': 'LNZ',
  
  // POLONIA
  'katowice': 'KTW',
  'gdansk': 'GDN',
  'wroclaw': 'WRO',
  'poznan': 'POZ',
  'lodz': 'LCJ',
  'rzeszow': 'RZE',
  'lublin': 'LUZ',
  
  // REPÚBLICA CHECA Y ESLOVAQUIA
  'brno': 'BRQ',
  'kosice': 'KSC',
  
  // PAÍSES BÁLTICOS
  'riga': 'RIX',
  'tallinn': 'TLL',
  'vilnius': 'VNO',
  'kaunas': 'KUN',
  
  // TURQUÍA
  'estambul': 'IST',
  'ankara': 'ESB',
  'antalya': 'AYT',
  'izmir': 'ADB',
  'bodrum': 'BJV',
  'dalaman': 'DLM',
  
  // MARRUECOS
  'marrakech': 'RAK',
  'casablanca': 'CMN',
  'agadir': 'AGA',
  'tánger': 'TNG',
  'tanger': 'TNG',
  'fez': 'FEZ',
  'rabat': 'RBA',
  
  // CHIPRE Y MALTA
  'larnaca': 'LCA',
  'paphos': 'PFO',
  'malta': 'MLA',
  'la valeta': 'MLA',
  
  // RUMANIA Y BULGARIA
  'cluj': 'CLJ',
  'timisoara': 'TSR',
  'iasi': 'IAS',
  'varna': 'VAR',
  'burgas': 'BOJ',
  'plovdiv': 'PDV'
};

function parseUserQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  const fromPatterns = [
    /desde\s+([a-záéíóúñ\s]+?)\s+(?:a|hacia|para)\s+/i,
    /de\s+([a-záéíóúñ\s]+?)\s+(?:a|hacia|para)\s+/i,
    /^([a-záéíóúñ\s]+?)\s+a\s+/i,
    /vuelo\s+(?:de\s+)?([a-záéíóúñ\s]+?)\s+a\s+/i
  ];
  
  let origin = null;
  for (const pattern of fromPatterns) {
    const match = query.match(pattern);
    if (match) {
      origin = match[1].trim();
      break;
    }
  }
  
  const toPatterns = [
    /\s+(?:a|hacia|para)\s+([a-záéíóúñ\s]+?)(?:\s|$)/i,
    /\s+a\s+([a-záéíóúñ\s]+?)$/i
  ];
  
  let destination = null;
  for (const pattern of toPatterns) {
    const match = query.match(pattern);
    if (match) {
      destination = match[1].trim();
      break;
    }
  }
  
  const anywherePatterns = [
    /cualquier\s+sitio/i,
    /cualquier\s+lugar/i
  ];
  
  const isAnywhere = anywherePatterns.some(pattern => pattern.test(query));
  if (isAnywhere) {
    destination = 'anywhere';
  }
  
  const budgetMatch = query.match(/(\d+)\s*€|presupuesto\s+(?:de\s+)?(\d+)|máximo\s+(\d+)/i);
  const budget = budgetMatch ? parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3]) : null;
  
  return {
    origin,
    destination,
    isAnywhere,
    budget,
    originalQuery: query
  };
}

function getCityCode(cityName) {
  const normalized = cityName.toLowerCase().trim();
  return cityToIATA[normalized] || null;
}

async function searchFlights(params) {
  const { origin, destination, departureDate, returnDate } = params;
  
  try {
    const url = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';
    
    const response = await axios.get(url, {
      params: {
        origin: origin,
        destination: destination,
        departure_at: departureDate,
        return_at: returnDate,
        currency: 'EUR',
        token: TRAVELPAYOUTS_TOKEN,
        limit: 30,
        sorting: 'price'
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching flights:', error.message);
    throw error;
  }
}

async function searchPopularDestinations(origin) {
  try {
    const url = 'https://api.travelpayouts.com/aviasales/v3/prices_for_calendar';
    
    const response = await axios.get(url, {
      params: {
        origin: origin,
        currency: 'EUR',
        token: TRAVELPAYOUTS_TOKEN,
        limit: 50
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching popular destinations:', error.message);
    throw error;
  }
}

function calculateDates() {
  const today = new Date();
  let departureDate = new Date(today);
  departureDate.setDate(today.getDate() + 7);
  
  const returnDate = new Date(departureDate);
  returnDate.setDate(departureDate.getDate() + 3);
  
  return {
    departure: departureDate.toISOString().split('T')[0],
    return: returnDate.toISOString().split('T')[0]
  };
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NomadAI Backend is running!',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log('Received query:', query);
    
    const parsed = parseUserQuery(query);
    console.log('Parsed query:', parsed);
    
    if (!parsed.origin) {
      return res.status(400).json({ 
        error: 'No se pudo detectar la ciudad de origen. Por favor, especifica desde dónde quieres viajar.' 
      });
    }
    
    const originCode = getCityCode(parsed.origin);
    if (!originCode) {
      return res.status(400).json({ 
        error: `No se reconoce la ciudad "${parsed.origin}". Intenta con ciudades principales.` 
      });
    }
    
    const dates = calculateDates();
    
    let flights = [];
    
    if (parsed.isAnywhere || !parsed.destination) {
      console.log('Searching popular destinations from', originCode);
      flights = await searchPopularDestinations(originCode);
    } else {
      const destinationCode = getCityCode(parsed.destination);
      if (!destinationCode) {
        return res.status(400).json({ 
          error: `No se reconoce la ciudad de destino "${parsed.destination}". Intenta con ciudades principales.` 
        });
      }
      
      console.log(`Searching flights from ${originCode} to ${destinationCode}`);
      flights = await searchFlights({
        origin: originCode,
        destination: destinationCode,
        departureDate: dates.departure,
        returnDate: dates.return
      });
    }
    
    if (parsed.budget) {
      flights = flights.filter(flight => flight.price <= parsed.budget);
    }
    
    flights.sort((a, b) => a.price - b.price);
    flights = flights.slice(0, 10);
    
    const formattedFlights = flights.map(flight => {
      const searchLink = `https://www.aviasales.com/search/${flight.origin}${dates.departure}${flight.destination}${dates.return}1?marker=${TRAVELPAYOUTS_MARKER}`;
      
      return {
        origin: flight.origin,
        destination: flight.destination,
        airline: flight.airline || 'Multiple',
        price: Math.round(flight.price),
        currency: 'EUR',
        departureDate: flight.departure_at || dates.departure,
        returnDate: flight.return_at || dates.return,
        direct: flight.transfers === 0,
        transfers: flight.transfers || 0,
        link: searchLink,
        duration: flight.duration || 'N/A'
      };
    });
    
    res.json({
      query: query,
      parsed: parsed,
      dates: dates,
      results: formattedFlights,
      count: formattedFlights.length
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Error al buscar vuelos. Por favor, intenta de nuevo.',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 NomadAI Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Supported cities: ${Object.keys(cityToIATA).length}`);
});