import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './FMS.css';
import './Features.css';

const TABS = ['calendar', 'expenses', 'diary'];

export default function FMS() {
  const { t, lang } = useLanguage();
  const [tab, setTab] = useState('calendar');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calendar
  const [crops, setCrops] = useState([]);
  const [plan, setPlan] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [planForm, setPlanForm] = useState({
    crop: 'Rice, paddy',
    sowingDate: new Date().toISOString().slice(0, 10),
    areaAcres: 1,
  });

  // Expenses
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [expenseCategories, setExpenseCategories] = useState({
    expense: [],
    income: [],
  });
  const [expenseForm, setExpenseForm] = useState({
    kind: 'expense',
    category: 'Seeds',
    amount: '',
    description: '',
    crop: '',
    date: new Date().toISOString().slice(0, 10),
  });

  // Diary
  const [diary, setDiary] = useState([]);
  const [diaryForm, setDiaryForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    note: '',
    crop: '',
    photoUrl: '',
  });

  const loadCalendar = async () => {
    const { data } = await api.get('/api/fms/calendar');
    setPlan(data.plan);
    setCalendar(data.calendar || []);
    setCrops(data.crops || []);
    if (data.plan) {
      setPlanForm({
        crop: data.plan.crop,
        sowingDate: data.plan.sowingDate?.slice(0, 10),
        areaAcres: data.plan.areaAcres || 1,
      });
    }
  };

  const loadExpenses = async () => {
    const [listRes, sumRes] = await Promise.all([
      api.get('/api/fms/expenses'),
      api.get('/api/fms/expenses/summary'),
    ]);
    setExpenses(listRes.data.items || []);
    setExpenseCategories(listRes.data.categories || { expense: [], income: [] });
    setSummary(sumRes.data);
  };

  const loadDiary = async () => {
    const { data } = await api.get('/api/fms/diary');
    setDiary(data.entries || []);
  };

  const loadTab = async (activeTab) => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'calendar') await loadCalendar();
      if (activeTab === 'expenses') await loadExpenses();
      if (activeTab === 'diary') await loadDiary();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  const savePlan = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await api.post('/api/fms/calendar/plan', planForm);
      setPlan(data.plan);
      setCalendar(data.calendar || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/api/fms/expenses', {
        ...expenseForm,
        amount: Number(expenseForm.amount),
      });
      setExpenseForm((f) => ({ ...f, amount: '', description: '' }));
      await loadExpenses();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  const deleteExpense = async (id) => {
    await api.delete(`/api/fms/expenses/${id}`);
    await loadExpenses();
  };

  const addDiary = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/api/fms/diary', diaryForm);
      setDiaryForm((f) => ({ ...f, note: '', photoUrl: '' }));
      await loadDiary();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  const deleteDiary = async (id) => {
    await api.delete(`/api/fms/diary/${id}`);
    await loadDiary();
  };

  const stageLabel = (item) =>
    lang === 'hi' && item.stage_hi ? item.stage_hi : item.stage;
  const taskLabel = (item) =>
    lang === 'hi' && item.task_hi ? item.task_hi : item.task;

  return (
    <div className="feature-page fms-page">
      <header className="feature-header glass">
        <span className="feature-badge">{t('fmsNav')}</span>
        <h1>🚜 {t('fmsTitle')}</h1>
        <p>{t('fmsSubtitle')}</p>
      </header>

      <div className="fms-tabs glass">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >
            {t(`fmsTab_${key}`)}
          </button>
        ))}
      </div>

      {error && <div className="feature-error glass">{error}</div>}
      {loading && <div className="feature-loading glass">{t('loading')}</div>}

      {!loading && tab === 'calendar' && (
        <div className="fms-calendar-section">
          <div className="tool-card glass">
            <h2>{t('fmsPlanTitle')}</h2>
            <form className="tool-form" onSubmit={savePlan}>
              <label>{t('crop')}</label>
              <select
                className="input-field"
                value={planForm.crop}
                onChange={(e) =>
                  setPlanForm((f) => ({ ...f, crop: e.target.value }))
                }
              >
                {crops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label>{t('fmsSowingDate')}</label>
              <input
                type="date"
                className="input-field"
                value={planForm.sowingDate}
                onChange={(e) =>
                  setPlanForm((f) => ({ ...f, sowingDate: e.target.value }))
                }
              />
              <label>{t('fmsAreaAcres')}</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="input-field"
                value={planForm.areaAcres}
                onChange={(e) =>
                  setPlanForm((f) => ({ ...f, areaAcres: e.target.value }))
                }
              />
              <button type="submit" className="btn-primary">
                {t('fmsSavePlan')}
              </button>
            </form>
          </div>

          <div className="tool-card glass">
            <h2>{t('fmsTimeline')}</h2>
            {!plan ? (
              <p className="fms-empty-hint">{t('fmsNoPlan')}</p>
            ) : (
              <ul className="fms-timeline">
                {calendar.map((item) => (
                  <li
                    key={item.daysAfterSowing}
                    className={`fms-timeline-item status-${item.status}`}
                  >
                    <div className="fms-timeline-date">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <strong>{stageLabel(item)}</strong>
                    <p>{taskLabel(item)}</p>
                    <span className="fms-status-badge">{t(`fmsStatus_${item.status}`)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!loading && tab === 'expenses' && (
        <div className="tool-layout">
          <div className="tool-card glass">
            <h2>{t('fmsAddEntry')}</h2>
            <form className="tool-form" onSubmit={addExpense}>
              <label>{t('fmsEntryKind')}</label>
              <select
                className="input-field"
                value={expenseForm.kind}
                onChange={(e) =>
                  setExpenseForm((f) => ({
                    ...f,
                    kind: e.target.value,
                    category:
                      e.target.value === 'income'
                        ? expenseCategories.income[0] || 'Crop sale'
                        : expenseCategories.expense[0] || 'Seeds',
                  }))
                }
              >
                <option value="expense">{t('fmsExpense')}</option>
                <option value="income">{t('fmsIncome')}</option>
              </select>
              <label>{t('fmsCategory')}</label>
              <select
                className="input-field"
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {(expenseForm.kind === 'income'
                  ? expenseCategories.income
                  : expenseCategories.expense
                ).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label>{t('fmsAmount')}</label>
              <input
                type="number"
                min="0"
                step="1"
                className="input-field"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm((f) => ({ ...f, amount: e.target.value }))
                }
                required
              />
              <label>{t('fmsDate')}</label>
              <input
                type="date"
                className="input-field"
                value={expenseForm.date}
                onChange={(e) =>
                  setExpenseForm((f) => ({ ...f, date: e.target.value }))
                }
              />
              <label>{t('crop')} ({t('optional')})</label>
              <input
                className="input-field"
                value={expenseForm.crop}
                onChange={(e) =>
                  setExpenseForm((f) => ({ ...f, crop: e.target.value }))
                }
              />
              <label>{t('fmsDescription')}</label>
              <input
                className="input-field"
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm((f) => ({ ...f, description: e.target.value }))
                }
              />
              <button type="submit" className="btn-primary">
                {t('submit')}
              </button>
            </form>
          </div>

          <div className="tool-card glass">
            <h2>{t('fmsLedger')}</h2>
            {summary && (
              <div className="fms-summary">
                <div>
                  <span>{t('fmsTotalExpense')}</span>
                  <strong>₹{summary.totalExpense?.toLocaleString()}</strong>
                </div>
                <div>
                  <span>{t('fmsTotalIncome')}</span>
                  <strong>₹{summary.totalIncome?.toLocaleString()}</strong>
                </div>
                <div>
                  <span>{t('fmsBalance')}</span>
                  <strong className={summary.balance >= 0 ? 'positive' : 'negative'}>
                    ₹{summary.balance?.toLocaleString()}
                  </strong>
                </div>
              </div>
            )}
            <ul className="fms-ledger-list">
              {expenses.map((row) => (
                <li key={row._id} className="fms-ledger-row">
                  <div>
                    <strong>
                      {row.kind === 'income' ? '+' : '-'}₹{row.amount}
                    </strong>
                    <span>
                      {row.category} · {new Date(row.date).toLocaleDateString()}
                    </span>
                    {row.description && <p>{row.description}</p>}
                  </div>
                  <button
                    type="button"
                    className="btn-secondary fms-delete-btn"
                    onClick={() => deleteExpense(row._id)}
                  >
                    {t('delete')}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!loading && tab === 'diary' && (
        <div className="tool-layout">
          <div className="tool-card glass">
            <h2>{t('fmsNewDiary')}</h2>
            <form className="tool-form" onSubmit={addDiary}>
              <label>{t('fmsDate')}</label>
              <input
                type="date"
                className="input-field"
                value={diaryForm.date}
                onChange={(e) =>
                  setDiaryForm((f) => ({ ...f, date: e.target.value }))
                }
              />
              <label>{t('crop')} ({t('optional')})</label>
              <input
                className="input-field"
                value={diaryForm.crop}
                onChange={(e) =>
                  setDiaryForm((f) => ({ ...f, crop: e.target.value }))
                }
              />
              <label>{t('fmsDiaryNote')}</label>
              <textarea
                className="input-field feature-textarea"
                rows={4}
                value={diaryForm.note}
                onChange={(e) =>
                  setDiaryForm((f) => ({ ...f, note: e.target.value }))
                }
                required
              />
              <label>{t('fmsPhotoUrl')} ({t('optional')})</label>
              <input
                className="input-field"
                placeholder="https://..."
                value={diaryForm.photoUrl}
                onChange={(e) =>
                  setDiaryForm((f) => ({ ...f, photoUrl: e.target.value }))
                }
              />
              <button type="submit" className="btn-primary">
                {t('submit')}
              </button>
            </form>
          </div>

          <div className="tool-card glass">
            <h2>{t('fmsDiaryList')}</h2>
            {diary.length === 0 ? (
              <p className="fms-empty-hint">{t('fmsDiaryEmpty')}</p>
            ) : (
              <ul className="fms-diary-list">
                {diary.map((entry) => (
                  <li key={entry._id} className="fms-diary-item">
                    <div className="fms-diary-meta">
                      <strong>{new Date(entry.date).toLocaleDateString()}</strong>
                      {entry.crop && <span> · {entry.crop}</span>}
                    </div>
                    <p>{entry.note}</p>
                    {entry.photoUrl && (
                      <img src={entry.photoUrl} alt="" className="fms-diary-photo" />
                    )}
                    <button
                      type="button"
                      className="btn-secondary fms-delete-btn"
                      onClick={() => deleteDiary(entry._id)}
                    >
                      {t('delete')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
