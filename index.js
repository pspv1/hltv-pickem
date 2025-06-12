const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// HLTV'den veri çekme fonksiyonu
async function fetchPickemData() {
  try {
    const response = await axios.get('https://www.hltv.org/majors/12345/austin-major-2025/pickem');
    const $ = cheerio.load(response.data);
    
    // Verileri ayrıştırma
    const threeZeroTeams = parseTeams($, '.threeZero-section');
    const zeroThreeTeams = parseTeams($, '.zeroThree-section');
    const threeOneTeams = parseTeams($, '.threeOne-section');
    const threeTwoTeams = parseTeams($, '.threeTwo-section');
    
    return {
      '3-0': threeZeroTeams,
      '0-3': zeroThreeTeams,
      '3-1': threeOneTeams,
      '3-2': threeTwoTeams,
      totalParticipants: parseInt($('.total-participants').text().replace(/,/g, '')),
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('HLTV veri çekme hatası:', error);
    throw error;
  }
}

// Takım verilerini ayrıştırma yardımcı fonksiyonu
function parseTeams($, selector) {
  const teams = [];
  $(selector).find('.team-row').each((i, elem) => {
    const name = $(elem).find('.team-name').text().trim();
    const percentage = parseFloat($(elem).find('.percentage').text().replace('%', ''));
    teams.push({ name, percentage });
  });
  return teams;
}

// API endpoint
app.get('/api/pickem', async (req, res) => {
  try {
    const data = await fetchPickemData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Veri alınamadı' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend sunucusu ${PORT} portunda çalışıyor`);
});
