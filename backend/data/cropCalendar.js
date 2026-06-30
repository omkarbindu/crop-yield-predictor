/** Days from sowing → growth stage tasks (college FMS demo data). */
const CROP_STAGES = {
  'Rice, paddy': [
    { daysAfterSowing: 0, stage: 'Land prep & nursery', stage_hi: 'जमीन तैयारी और नर्सरी', task: 'Prepare field, sow seeds in nursery bed.', task_hi: 'खेत तैयार करें, नर्सरी में बीज बोएं।' },
    { daysAfterSowing: 21, stage: 'Transplanting', stage_hi: 'रोपाई', task: 'Transplant 20–25 day seedlings. Maintain 2–3 cm water.', task_hi: '20–25 दिन के पौधे रोपें। 2–3 सेमी पानी रखें।' },
    { daysAfterSowing: 45, stage: 'Tillering', stage_hi: 'कल्ले फूटना', task: 'Apply urea split dose. Watch for stem borer.', task_hi: 'यूरिया की खुराक दें। तना छेदक पर नज़र रखें।' },
    { daysAfterSowing: 75, stage: 'Panicle initiation', stage_hi: 'बाली बनना', task: 'Ensure water; avoid moisture stress.', task_hi: 'पानी सुनिश्चित करें; नमी की कमी न होने दें।' },
    { daysAfterSowing: 110, stage: 'Grain filling', stage_hi: 'दाना भरना', task: 'Drain field 7–10 days before harvest.', task_hi: 'कटाई से 7–10 दिन पहले खेत से पानी निकालें।' },
    { daysAfterSowing: 130, stage: 'Harvest', stage_hi: 'कटाई', task: 'Harvest when 80% grains turn golden yellow.', task_hi: '80% दाने सुनहरे हों तो कटाई करें।' },
  ],
  Wheat: [
    { daysAfterSowing: 0, stage: 'Sowing', stage_hi: 'बुवाई', task: 'Sow with seed drill; depth 4–5 cm.', task_hi: 'सीड ड्रिल से 4–5 सेमी गहराई पर बोएं।' },
    { daysAfterSowing: 25, stage: 'Crown root', stage_hi: 'जड़ विकास', task: 'First irrigation if no rain. Light weeding.', task_hi: 'बारिश न हो तो पहली सिंचाई। हल्की निराई।' },
    { daysAfterSowing: 55, stage: 'Tillering', stage_hi: 'फूटना', task: 'Apply nitrogen; monitor rust disease.', task_hi: 'नाइट्रोजन दें; रतुआ रोग देखें।' },
    { daysAfterSowing: 90, stage: 'Flowering', stage_hi: 'फूल आना', task: 'Avoid water stress; watch for aphids.', task_hi: 'पानी की कमी न होने दें; माहू पर नज़र रखें।' },
    { daysAfterSowing: 120, stage: 'Harvest', stage_hi: 'कटाई', task: 'Harvest when grains are hard and moisture ~20%.', task_hi: 'दाने सख्त हों और नमी ~20% हो तो कटाई करें।' },
  ],
  Maize: [
    { daysAfterSowing: 0, stage: 'Sowing', stage_hi: 'बुवाई', task: 'Sow 5–6 cm deep; spacing 60×20 cm.', task_hi: '5–6 सेमी गहराई; 60×20 सेमी दूरी।' },
    { daysAfterSowing: 30, stage: 'Vegetative', stage_hi: 'वनस्पति वृद्धि', task: 'Side dress nitrogen; earthing up.', task_hi: 'नाइट्रोजन दें; मिट्टी चढ़ाएं।' },
    { daysAfterSowing: 60, stage: 'Tasseling', stage_hi: 'मकई फूल', task: 'Ensure irrigation; check fall armyworm.', task_hi: 'सिंचाई करें; फॉल आर्मीवर्म जांचें।' },
    { daysAfterSowing: 95, stage: 'Harvest', stage_hi: 'कटाई', task: 'Harvest when husk turns brown and grains hard.', task_hi: 'भुट्टे भूरे और दाने सख्त हों तो कटाई।' },
  ],
  Potatoes: [
    { daysAfterSowing: 0, stage: 'Planting', stage_hi: 'रोपण', task: 'Plant tubers 10 cm deep in ridges.', task_hi: 'कंद 10 सेमी गहराई पर मेड़ में लगाएं।' },
    { daysAfterSowing: 30, stage: 'Earthing up', stage_hi: 'मिट्टी चढ़ाना', task: 'First earthing up; control late blight.', task_hi: 'पहली मिट्टी चढ़ाएं; लेट ब्लाइट नियंत्रण।' },
    { daysAfterSowing: 75, stage: 'Tuber bulking', stage_hi: 'कंद बढ़ना', task: 'Maintain soil moisture; avoid waterlogging.', task_hi: 'नमी बनाए रखें; जलभराव न होने दें।' },
    { daysAfterSowing: 100, stage: 'Harvest', stage_hi: 'कटाई', task: 'Harvest when vines dry; cure tubers in shade.', task_hi: 'बेल सूखे तो कटाई; छाया में सुखाएं।' },
  ],
};

const DEFAULT_CROP = 'Rice, paddy';

function getStagesForCrop(crop) {
  return CROP_STAGES[crop] || CROP_STAGES[DEFAULT_CROP];
}

function buildCalendar(crop, sowingDate) {
  const start = new Date(sowingDate);
  const stages = getStagesForCrop(crop);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return stages.map((s) => {
    const date = new Date(start);
    date.setDate(date.getDate() + s.daysAfterSowing);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    let status = 'upcoming';
    if (d.getTime() === today.getTime()) status = 'today';
    else if (d < today) status = 'done';
    else if (d - today <= 3 * 86400000) status = 'soon';

    return {
      ...s,
      date: date.toISOString(),
      status,
    };
  });
}

module.exports = { CROP_STAGES, getStagesForCrop, buildCalendar, DEFAULT_CROP };
