const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Samman Nidhi',
    name_hi: 'पीएम-किसान सम्मान निधि',
    benefit: '₹6,000 per year in 3 installments directly to bank account',
    benefit_hi: 'सालाना ₹6,000, तीन किस्तों में सीधे बैंक खाते में',
    category: 'Income Support',
    maxLandAcres: null,
    minLandAcres: 0,
    crops: ['all'],
    states: ['all'],
    link: 'https://pmkisan.gov.in',
    docs: ['Aadhaar', 'Bank account', 'Land records']
  },
  {
    id: 'pmfby',
    name: 'PM Fasal Bima Yojana (Crop Insurance)',
    name_hi: 'पीएम फसल बीमा योजना',
    benefit: 'Crop insurance against natural calamities; premium 1.5-2% for farmers',
    benefit_hi: 'प्राकृतिक आपदा के विरुद्ध फसल बीमा; किसानों के लिए प्रीमियम 1.5-2%',
    category: 'Insurance',
    maxLandAcres: null,
    minLandAcres: 0,
    crops: ['all'],
    states: ['all'],
    link: 'https://pmfby.gov.in',
    docs: ['Aadhaar', 'Bank account', 'Sowing certificate', 'Land records']
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    name_hi: 'किसान क्रेडिट कार्ड',
    benefit: 'Crop loans up to ₹3 lakh at 4% interest (with timely repayment)',
    benefit_hi: '₹3 लाख तक का फसल ऋण 4% ब्याज पर (समय पर चुकौती पर)',
    category: 'Credit',
    maxLandAcres: null,
    minLandAcres: 0,
    crops: ['all'],
    states: ['all'],
    link: 'https://www.myscheme.gov.in/schemes/kcc',
    docs: ['Aadhaar', 'Land records', 'Passport photo']
  },
  {
    id: 'soil-health',
    name: 'Soil Health Card Scheme',
    name_hi: 'मृदा स्वास्थ्य कार्ड योजना',
    benefit: 'Free soil testing and nutrient recommendations every 2 years',
    benefit_hi: 'हर 2 साल में मुफ्त मिट्टी जांच और पोषक तत्व सिफारिश',
    category: 'Advisory',
    maxLandAcres: null,
    minLandAcres: 0,
    crops: ['all'],
    states: ['all'],
    link: 'https://soilhealth.dac.gov.in',
    docs: ['Aadhaar', 'Land records']
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM (Solar Pump)',
    name_hi: 'पीएम-कुसुम (सोलर पंप)',
    benefit: 'Up to 60% subsidy on solar pumps + grid-connected solar power income',
    benefit_hi: 'सोलर पंप पर 60% तक सब्सिडी + सोलर बिजली से आय',
    category: 'Subsidy',
    maxLandAcres: null,
    minLandAcres: 1,
    crops: ['all'],
    states: ['all'],
    link: 'https://pmkusum.mnre.gov.in',
    docs: ['Aadhaar', 'Land records', 'Bank account', 'Electricity connection']
  },
  {
    id: 'enam',
    name: 'eNAM (National Agriculture Market)',
    name_hi: 'ई-नाम (राष्ट्रीय कृषि बाजार)',
    benefit: 'Sell produce online across India at competitive prices, transparent bidding',
    benefit_hi: 'पूरे भारत में ऑनलाइन उपज बेचें, पारदर्शी बोली',
    category: 'Market Access',
    maxLandAcres: null,
    minLandAcres: 0,
    crops: ['all'],
    states: ['all'],
    link: 'https://www.enam.gov.in',
    docs: ['Aadhaar', 'Bank account', 'Mobile number']
  },
  {
    id: 'pmksy',
    name: 'PM Krishi Sinchai Yojana (Micro Irrigation)',
    name_hi: 'पीएम कृषि सिंचाई योजना (सूक्ष्म सिंचाई)',
    benefit: 'Subsidy on drip/sprinkler irrigation (up to 55% for small farmers)',
    benefit_hi: 'ड्रिप/स्प्रिंकलर सिंचाई पर सब्सिडी (छोटे किसानों के लिए 55% तक)',
    category: 'Subsidy',
    maxLandAcres: null,
    minLandAcres: 0,
    crops: ['all'],
    states: ['all'],
    link: 'https://pmksy.gov.in',
    docs: ['Aadhaar', 'Land records', 'Bank account']
  },
  {
    id: 'small-farmer',
    name: 'Small & Marginal Farmer Support',
    name_hi: 'लघु एवं सीमांत किसान सहायता',
    benefit: 'Extra input subsidy and priority in schemes for holdings under 5 acres',
    benefit_hi: '5 एकड़ से कम जोत वालों को अतिरिक्त इनपुट सब्सिडी और योजनाओं में प्राथमिकता',
    category: 'Income Support',
    maxLandAcres: 5,
    minLandAcres: 0,
    crops: ['all'],
    states: ['all'],
    link: 'https://www.myscheme.gov.in',
    docs: ['Aadhaar', 'Land records', 'Income certificate']
  }
];

router.get('/list', auth, (req, res) => {
  try {
    const { landAcres, crop } = req.query;
    const land = landAcres != null && landAcres !== '' ? Number(landAcres) : null;

    const matched = SCHEMES.map((s) => {
      let eligible = true;
      const reasons = [];
      if (land != null) {
        if (s.maxLandAcres != null && land > s.maxLandAcres) {
          eligible = false;
          reasons.push(`For holdings up to ${s.maxLandAcres} acres`);
        }
        if (s.minLandAcres != null && land < s.minLandAcres) {
          eligible = false;
          reasons.push(`Requires at least ${s.minLandAcres} acre`);
        }
      }
      if (crop && crop !== 'all' && !s.crops.includes('all') && !s.crops.includes(crop)) {
        eligible = false;
        reasons.push(`For specific crops: ${s.crops.join(', ')}`);
      }
      return { ...s, eligible, ineligibleReason: reasons.join('; ') };
    });

    matched.sort((a, b) => (b.eligible === a.eligible ? 0 : b.eligible ? 1 : -1));
    res.json({ schemes: matched });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load schemes.' });
  }
});

module.exports = router;
