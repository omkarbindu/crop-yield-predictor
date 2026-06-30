import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './Features.css';

const TYPES = ['all', 'Tractor', 'Harvester', 'Tiller', 'Sprayer', 'Seeder', 'Thresher', 'Other'];
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1605338803155-8b46c2c8f6f5?w=600&q=80';

export default function Equipment() {
  const { farmer } = useAuth();
  const { t } = useLanguage();
  const [equipment, setEquipment] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [bookModal, setBookModal] = useState(null);
  const [bookDays, setBookDays] = useState(1);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(null);
  const [addForm, setAddForm] = useState({
    name: '', type: 'Tractor', pricePerDay: '', location: farmer?.location?.address || '', description: '', image: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const { data } = await api.get('/api/equipment/list', { params });
      setEquipment(data.equipment);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  const book = async (e) => {
    e.preventDefault();
    if (!bookModal) return;
    setBooking(true);
    setError(null);
    try {
      const { data } = await api.post('/api/equipment/book', {
        equipmentId: bookModal._id,
        days: Number(bookDays)
      });
      setSuccess({ owner: data.owner, total: data.total });
      setBookModal(null);
      setBookDays(1);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setBooking(false);
    }
  };

  const addEquipment = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/api/equipment/list', addForm);
      setShowAdd(false);
      setAddForm({ name: '', type: 'Tractor', pricePerDay: '', location: farmer?.location?.address || '', description: '', image: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="feature-page">
      <div className="feature-header glass">
        <span className="feature-badge">{t('equipBadge')}</span>
        <h1>{t('equipTitle')}</h1>
        <p>{t('equipSubtitle')}</p>
      </div>

      {error && <p className="feature-error glass">{error}</p>}

      {success && (
        <div className="feature-success glass">
          <div className="feature-success-icon">✓</div>
          <h3>{t('equipBooked')}</h3>
          <p>{t('equipBookedMsg')} <strong>{success.owner?.name}</strong></p>
          <p className="feature-success-phone">{t('marketFarmerPhone')}: {success.owner?.phone}</p>
          <p>{t('equipTotal')}: <strong>{fmt(success.total)}</strong></p>
          <button type="button" className="btn-primary" onClick={() => setSuccess(null)}>{t('marketGotIt')}</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div className="chip-row" style={{ marginBottom: 0 }}>
          {TYPES.map((ty) => (
            <button key={ty} type="button" className={`chip ${filter === ty ? 'active' : ''}`} onClick={() => setFilter(ty)}>
              {ty === 'all' ? t('mandiAll') : ty}
            </button>
          ))}
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowAdd((s) => !s)}>
          {showAdd ? t('cancel') : `+ ${t('equipAdd')}`}
        </button>
      </div>

      {showAdd && (
        <div className="community-new glass">
          <form className="tool-form" onSubmit={addEquipment}>
            <label>{t('equipName')}</label>
            <input className="input-field" required value={addForm.name}
              onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} />
            <label>{t('equipType')}</label>
            <select className="input-field" value={addForm.type}
              onChange={(e) => setAddForm((f) => ({ ...f, type: e.target.value }))}>
              {TYPES.filter((x) => x !== 'all').map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <label>{t('equipPrice')} (₹/day)</label>
            <input type="number" className="input-field" required value={addForm.pricePerDay}
              onChange={(e) => setAddForm((f) => ({ ...f, pricePerDay: e.target.value }))} />
            <label>{t('location')}</label>
            <input className="input-field" value={addForm.location}
              onChange={(e) => setAddForm((f) => ({ ...f, location: e.target.value }))} />
            <label>{t('marketDescription')}</label>
            <textarea className="input-field feature-textarea" value={addForm.description}
              onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))} />
            <button type="submit" className="btn-primary">{t('equipList')}</button>
          </form>
        </div>
      )}

      {loading ? (
        <p className="feature-loading">{t('loading')}</p>
      ) : (
        <div className="feature-grid">
          {equipment.map((eq) => (
            <div key={eq._id} className="equip-card glass">
              <img
                className="equip-img"
                src={eq.image || DEFAULT_IMG}
                alt={eq.name}
                loading="lazy"
                onError={(e) => { if (e.target.src !== DEFAULT_IMG) { e.target.onerror = null; e.target.src = DEFAULT_IMG; } }}
              />
              <div className="equip-body">
                <span className="equip-type">{eq.type}</span>
                <div className="equip-name">{eq.name}</div>
                <div className="equip-loc">📍 {eq.location} · {eq.ownerName}</div>
                <div className="equip-desc">{eq.description}</div>
                <div className="equip-price">{fmt(eq.pricePerDay)}<small>/{t('equipDay')}</small></div>
                <button type="button" className="btn-primary" style={{ width: '100%' }}
                  disabled={eq.owner === farmer?._id}
                  onClick={() => { setBookModal(eq); setBookDays(1); setSuccess(null); }}>
                  {eq.owner === farmer?._id ? t('marketYourListing') : t('equipBook')}
                </button>
              </div>
            </div>
          ))}
          {equipment.length === 0 && <p className="feature-empty">{t('equipEmpty')}</p>}
        </div>
      )}

      {bookModal && (
        <div className="feature-modal-overlay" onClick={() => setBookModal(null)}>
          <div className="feature-modal glass" onClick={(e) => e.stopPropagation()}>
            <h3>{t('equipBook')}: {bookModal.name}</h3>
            <form onSubmit={book}>
              <label>{t('equipDays')}</label>
              <input type="number" className="input-field" min="1" required value={bookDays}
                onChange={(e) => setBookDays(e.target.value)} />
              <div className="tool-result-row" style={{ marginTop: 8 }}>
                <span>{t('equipTotal')}</span>
                <strong>{fmt(bookModal.pricePerDay * Number(bookDays || 0))}</strong>
              </div>
              <div className="feature-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setBookModal(null)}>{t('cancel')}</button>
                <button type="submit" className="btn-primary" disabled={booking}>
                  {booking ? t('loading') : t('equipConfirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
