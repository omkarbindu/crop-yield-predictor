const axios = require('axios');
const Alert = require('../models/Alert');
const CropPlan = require('../models/CropPlan');
const { buildCalendar } = require('../data/cropCalendar');

const WEATHER_BASE = 'https://api.weatherapi.com/v1';

async function upsertAlert(farmerId, payload) {
  try {
    await Alert.findOneAndUpdate(
      { farmer: farmerId, dedupeKey: payload.dedupeKey },
      { $setOnInsert: { farmer: farmerId, read: false, createdAt: new Date() }, $set: payload },
      { upsert: true, new: true },
    );
  } catch {
    // duplicate dedupeKey race — ignore
  }
}

async function generateWeatherAlerts(farmer) {
  const lat = farmer?.location?.coordinates?.[1];
  const lon = farmer?.location?.coordinates?.[0];
  const key = process.env.WEATHER_API_KEY;
  if (!lat || !lon || !key) return;

  const q = `${lat},${lon}`;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const { data: current } = await axios.get(
      `${WEATHER_BASE}/current.json?key=${key}&q=${q}`,
    );
    const temp = current?.current?.temp_c;
    const condition = current?.current?.condition?.text || '';

    if (temp >= 38) {
      await upsertAlert(farmer._id, {
        type: 'weather',
        dedupeKey: `weather-heat-${today}`,
        title: 'High temperature alert',
        title_hi: 'उच्च तापमान चेतावनी',
        message: `Farm temperature is ${temp}°C. Increase irrigation frequency and avoid midday field work.`,
        message_hi: `खेत का तापमान ${temp}°C है। सिंचाई बढ़ाएं और दोपहर में खेत का काम कम करें।`,
      });
    }

    const { data: forecast } = await axios.get(
      `${WEATHER_BASE}/forecast.json?key=${key}&q=${q}&days=3`,
    );
    const days = forecast?.forecast?.forecastday || [];
    const heavyRain = days.some((d) => (d.day?.daily_chance_of_rain || 0) >= 70);

    if (heavyRain) {
      await upsertAlert(farmer._id, {
        type: 'irrigation',
        dedupeKey: `irrigation-rain-${today}`,
        title: 'Skip irrigation — rain expected',
        title_hi: 'सिंचाई रोकें — बारिश की संभावना',
        message:
          'Heavy rain is forecast in the next 3 days. Skip irrigation to save water and prevent waterlogging.',
        message_hi:
          'अगले 3 दिन भारी बारिश का अनुमान है। पानी बचाने और जलभराव से बचने के लिए सिंचाई न करें।',
      });
    } else if (condition.toLowerCase().includes('clear') && temp > 32) {
      await upsertAlert(farmer._id, {
        type: 'irrigation',
        dedupeKey: `irrigation-dry-${today}`,
        title: 'Irrigation reminder',
        title_hi: 'सिंचाई अनुस्मारक',
        message: 'Dry and warm conditions. Check soil moisture and irrigate if needed.',
        message_hi: 'शुष्क और गर्म मौसम। मिट्टी की नमी जांचें और जरूरत हो तो सिंचाई करें।',
      });
    }
  } catch (e) {
    console.error('[alerts] weather fetch failed:', e.message);
  }
}

async function generateMandiAlert(farmer) {
  const today = new Date().toISOString().slice(0, 10);
  await upsertAlert(farmer._id, {
    type: 'mandi',
    dedupeKey: `mandi-weekly-${today.slice(0, 7)}`,
    title: 'Check mandi prices this week',
    title_hi: 'इस सप्ताह मंडी भाव देखें',
    message:
      'Open Mandi Prices to compare rates with MSP and see sell/hold signals for your crop.',
    message_hi:
      'मंडी भाव पेज खोलें, MSP से तुलना करें और अपनी फसल के लिए बेचने/रुकने के संकेत देखें।',
  });
}

async function generateCalendarAlerts(farmerId) {
  const plan = await CropPlan.findOne({ farmer: farmerId });
  if (!plan) return;

  const calendar = buildCalendar(plan.crop, plan.sowingDate);
  const today = new Date().toISOString().slice(0, 10);

  for (const item of calendar) {
    if (item.status !== 'today' && item.status !== 'soon') continue;
    const dayKey = item.date.slice(0, 10);
    await upsertAlert(farmerId, {
      type: 'calendar',
      dedupeKey: `calendar-${plan.crop}-${item.daysAfterSowing}-${dayKey}`,
      title:
        item.status === 'today'
          ? `Today: ${item.stage}`
          : `Coming up: ${item.stage}`,
      title_hi:
        item.status === 'today'
          ? `आज: ${item.stage_hi}`
          : `जल्द: ${item.stage_hi}`,
      message: item.task,
      message_hi: item.task_hi,
    });
  }
}

async function refreshAlertsForFarmer(farmer) {
  await generateWeatherAlerts(farmer);
  await generateMandiAlert(farmer);
  await generateCalendarAlerts(farmer._id);
}

module.exports = { refreshAlertsForFarmer };
