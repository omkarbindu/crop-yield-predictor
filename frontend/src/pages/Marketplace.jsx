import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './Marketplace.css';

const GRAIN_TYPES = ['all', 'Wheat', 'Rice', 'Maize', 'Sorghum', 'Soybeans'];

const DEFAULT_GRAIN_IMG = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80';
const DEFAULT_FARMER_IMG = 'https://images.unsplash.com/photo-1560493676-04071c5f467d?w=200&q=80';

const imgFallback = (fallback) => (e) => {
  if (e.target.src !== fallback) {
    e.target.onerror = null;
    e.target.src = fallback;
  }
};

export default function Marketplace() {
  const { farmer } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState('browse');
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectModal, setConnectModal] = useState(null);
  const [connectQty, setConnectQty] = useState('');
  const [connectMsg, setConnectMsg] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(null);
  const [sellForm, setSellForm] = useState({
    grainType: 'Wheat',
    quantityQuintals: '',
    pricePerQuintal: '',
    storageMonths: 12,
    description: '',
    location: farmer?.location?.address || '',
    grainImage: '',
    farmerPhoto: ''
  });
  const [selling, setSelling] = useState(false);

  const loadBrowse = async () => {
    const params = {};
    if (filter !== 'all') params.grainType = filter;
    if (search) params.search = search;
    const { data } = await api.get('/api/marketplace/listings', { params });
    setListings(data.listings);
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadBrowse();
      const [mine, conn, inc] = await Promise.all([
        api.get('/api/marketplace/listings/mine'),
        api.get('/api/marketplace/connections/mine'),
        api.get('/api/marketplace/connections/incoming')
      ]);
      setMyListings(mine.data.listings);
      setMyConnections(conn.data.connections);
      setIncoming(inc.data.connections);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => {
    if (tab === 'browse') loadBrowse().catch(() => {});
  }, [filter, search]);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!connectModal) return;
    setConnecting(true);
    setError(null);
    try {
      const { data } = await api.post('/api/marketplace/connect', {
        listingId: connectModal._id,
        quantityNeeded: Number(connectQty),
        message: connectMsg
      });
      setConnectSuccess({
        farmerName: data.farmer?.name || connectModal.farmer?.name,
        farmerPhone: data.farmer?.phone
      });
      setConnectModal(null);
      setConnectQty('');
      setConnectMsg('');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    setSelling(true);
    setError(null);
    try {
      await api.post('/api/marketplace/listings', sellForm);
      setSellForm({
        grainType: 'Wheat',
        quantityQuintals: '',
        pricePerQuintal: '',
        storageMonths: 12,
        description: '',
        location: farmer?.location?.address || '',
        grainImage: '',
        farmerPhoto: ''
      });
      setTab('sell');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSelling(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/api/marketplace/connections/${id}`, { status });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/marketplace/listings/${id}`);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="marketplace-page">
      <section className="market-hero glass">
        <div className="market-hero-content">
          <span className="market-badge">{t('marketBadge')}</span>
          <h1>{t('marketTitle')}</h1>
          <p>{t('marketSubtitle')}</p>
          <div className="market-hero-stats">
            <div className="market-stat">
              <span className="market-stat-num">{listings.length}+</span>
              <span className="market-stat-label">{t('marketStatListings')}</span>
            </div>
            <div className="market-stat">
              <span className="market-stat-num">0%</span>
              <span className="market-stat-label">{t('marketStatCommission')}</span>
            </div>
            <div className="market-stat">
              <span className="market-stat-num">{t('marketStatDirect')}</span>
              <span className="market-stat-label">{t('marketStatFarmToYou')}</span>
            </div>
          </div>
        </div>
        <div className="market-hero-visual">
          <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&q=80" alt="Farm" className="market-hero-img main" loading="lazy" onError={imgFallback(DEFAULT_GRAIN_IMG)} />
          <img src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&q=80" alt="Grain" className="market-hero-img float grain" loading="lazy" onError={imgFallback(DEFAULT_GRAIN_IMG)} />
          <img src="https://images.unsplash.com/photo-1560493676-04071c5f467d?w=200&q=80" alt="Farmer" className="market-hero-img float farmer" loading="lazy" onError={imgFallback(DEFAULT_FARMER_IMG)} />
        </div>
      </section>

      <div className="market-tabs glass">
        <button type="button" className={tab === 'browse' ? 'active' : ''} onClick={() => setTab('browse')}>
          {t('marketBrowse')}
        </button>
        <button type="button" className={tab === 'sell' ? 'active' : ''} onClick={() => setTab('sell')}>
          {t('marketSell')}
        </button>
        <button type="button" className={tab === 'connections' ? 'active' : ''} onClick={() => setTab('connections')}>
          {t('marketConnections')}
          {incoming.filter((c) => c.status === 'pending').length > 0 && (
            <span className="market-tab-badge">{incoming.filter((c) => c.status === 'pending').length}</span>
          )}
        </button>
      </div>

      {error && <p className="market-error glass">{error}</p>}

      {connectSuccess && (
        <div className="market-success glass">
          <div className="market-success-icon">✓</div>
          <h3>{t('marketConnected')}</h3>
          <p>{t('marketConnectedMsg')} <strong>{connectSuccess.farmerName}</strong></p>
          {connectSuccess.farmerPhone && (
            <p className="market-success-phone">{t('marketFarmerPhone')}: {connectSuccess.farmerPhone}</p>
          )}
          <button type="button" className="btn-primary" onClick={() => setConnectSuccess(null)}>
            {t('marketGotIt')}
          </button>
        </div>
      )}

      {tab === 'browse' && (
        <>
          <div className="market-filters glass">
            <input
              type="text"
              className="input-field market-search"
              placeholder={t('marketSearch')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="market-chips">
              {GRAIN_TYPES.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`market-chip ${filter === g ? 'active' : ''}`}
                  onClick={() => setFilter(g)}
                >
                  {g === 'all' ? t('marketAll') : g}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="market-loading">{t('loading')}</p>
          ) : (
            <div className="market-grid">
              {listings.map((listing) => (
                <article key={listing._id} className="market-card glass">
                  <div className="market-card-image-wrap">
                    <img
                      src={listing.grainImage || DEFAULT_GRAIN_IMG}
                      alt={listing.grainType}
                      className="market-card-grain"
                      loading="lazy"
                      onError={imgFallback(DEFAULT_GRAIN_IMG)}
                    />
                    <span className="market-storage-badge">
                      {listing.storageMonths} {t('marketMonthsStorage')}
                    </span>
                  </div>
                  <div className="market-card-body">
                    <div className="market-farmer-row">
                      <img
                        src={listing.farmerPhoto || DEFAULT_FARMER_IMG}
                        alt={listing.farmer?.name}
                        className="market-farmer-avatar"
                        loading="lazy"
                        onError={imgFallback(DEFAULT_FARMER_IMG)}
                      />
                      <div>
                        <h3 className="market-farmer-name">{listing.farmer?.name}</h3>
                        <p className="market-location">📍 {listing.location}</p>
                      </div>
                    </div>
                    <h2 className="market-grain-type">{listing.grainType}</h2>
                    <p className="market-desc">{listing.description}</p>
                    <div className="market-meta">
                      <div>
                        <span className="market-meta-label">{t('marketQuantity')}</span>
                        <span className="market-meta-value">{listing.quantityQuintals} q</span>
                      </div>
                      <div>
                        <span className="market-meta-label">{t('marketPrice')}</span>
                        <span className="market-meta-value price">{formatPrice(listing.pricePerQuintal)}/q</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-connect"
                      onClick={() => {
                        setConnectModal(listing);
                        setConnectQty('');
                        setConnectMsg('');
                        setConnectSuccess(null);
                      }}
                      disabled={listing.farmer?._id === farmer?._id}
                    >
                      <span className="btn-connect-pulse" />
                      {listing.farmer?._id === farmer?._id ? t('marketYourListing') : t('marketConnect')}
                    </button>
                  </div>
                </article>
              ))}
              {listings.length === 0 && (
                <p className="market-empty">{t('marketNoListings')}</p>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'sell' && (
        <div className="market-sell-section">
          <div className="market-sell-form glass">
            <h2>{t('marketSellTitle')}</h2>
            <p className="market-sell-hint">{t('marketSellHint')}</p>
            <form onSubmit={handleSell}>
              <label>{t('crop')}</label>
              <select
                className="input-field"
                value={sellForm.grainType}
                onChange={(e) => setSellForm((f) => ({ ...f, grainType: e.target.value }))}
              >
                {GRAIN_TYPES.filter((g) => g !== 'all').map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <label>{t('marketQuantity')} (quintals)</label>
              <input
                type="number"
                className="input-field"
                required
                min="1"
                value={sellForm.quantityQuintals}
                onChange={(e) => setSellForm((f) => ({ ...f, quantityQuintals: e.target.value }))}
              />
              <label>{t('marketPrice')} (₹/quintal)</label>
              <input
                type="number"
                className="input-field"
                required
                min="1"
                value={sellForm.pricePerQuintal}
                onChange={(e) => setSellForm((f) => ({ ...f, pricePerQuintal: e.target.value }))}
              />
              <label>{t('marketStorageDuration')}</label>
              <input
                type="number"
                className="input-field"
                required
                min="1"
                value={sellForm.storageMonths}
                onChange={(e) => setSellForm((f) => ({ ...f, storageMonths: e.target.value }))}
              />
              <label>{t('location')}</label>
              <input
                type="text"
                className="input-field"
                value={sellForm.location}
                onChange={(e) => setSellForm((f) => ({ ...f, location: e.target.value }))}
              />
              <label>{t('marketDescription')}</label>
              <textarea
                className="input-field market-textarea"
                rows={3}
                value={sellForm.description}
                onChange={(e) => setSellForm((f) => ({ ...f, description: e.target.value }))}
              />
              <label>{t('marketGrainImageUrl')}</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://..."
                value={sellForm.grainImage}
                onChange={(e) => setSellForm((f) => ({ ...f, grainImage: e.target.value }))}
              />
              <button type="submit" className="btn-primary" disabled={selling}>
                {selling ? t('loading') : t('marketListGrain')}
              </button>
            </form>
          </div>

          {myListings.length > 0 && (
            <div className="market-my-listings glass">
              <h2>{t('marketMyListings')}</h2>
              <div className="market-my-grid">
                {myListings.map((l) => (
                  <div key={l._id} className="market-my-card">
                    <img src={l.grainImage || DEFAULT_GRAIN_IMG} alt={l.grainType} loading="lazy" onError={imgFallback(DEFAULT_GRAIN_IMG)} />
                    <div>
                      <strong>{l.grainType}</strong>
                      <span>{l.quantityQuintals} q · {formatPrice(l.pricePerQuintal)}/q</span>
                      <span className={`market-status ${l.status}`}>{l.status}</span>
                    </div>
                    <button type="button" className="btn-secondary" onClick={() => handleDelete(l._id)}>
                      {t('marketRemove')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'connections' && (
        <div className="market-connections-section">
          {incoming.length > 0 && (
            <div className="market-incoming glass">
              <h2>{t('marketIncoming')}</h2>
              {incoming.map((c) => (
                <div key={c._id} className="market-conn-card">
                  <img src={c.listing?.grainImage || DEFAULT_GRAIN_IMG} alt="" className="market-conn-img" loading="lazy" onError={imgFallback(DEFAULT_GRAIN_IMG)} />
                  <div className="market-conn-info">
                    <strong>{c.buyerName}</strong> · {c.buyerPhone}
                    <p>{c.listing?.grainType} — {c.quantityNeeded} q needed</p>
                    {c.message && <p className="market-conn-msg">"{c.message}"</p>}
                    <span className={`market-status ${c.status}`}>{c.status}</span>
                  </div>
                  {c.status === 'pending' && (
                    <div className="market-conn-actions">
                      <button type="button" className="btn-primary" onClick={() => handleStatus(c._id, 'accepted')}>
                        {t('marketAccept')}
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => handleStatus(c._id, 'rejected')}>
                        {t('marketReject')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="market-outgoing glass">
            <h2>{t('marketMyRequests')}</h2>
            {myConnections.length === 0 ? (
              <p className="market-empty">{t('marketNoConnections')}</p>
            ) : (
              myConnections.map((c) => (
                <div key={c._id} className="market-conn-card">
                  <img
                    src={c.listing?.grainImage || DEFAULT_GRAIN_IMG}
                    alt=""
                    className="market-conn-img"
                    loading="lazy"
                    onError={imgFallback(DEFAULT_GRAIN_IMG)}
                  />
                  <div className="market-conn-info">
                    <strong>{c.listing?.farmer?.name}</strong>
                    <p>{c.listing?.grainType} · {c.quantityNeeded} q</p>
                    <span className={`market-status ${c.status}`}>{c.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {connectModal && (
        <div className="market-modal-overlay" onClick={() => setConnectModal(null)}>
          <div className="market-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="market-modal-header">
              <img src={connectModal.farmerPhoto || DEFAULT_FARMER_IMG} alt="" className="market-farmer-avatar large" onError={imgFallback(DEFAULT_FARMER_IMG)} />
              <div>
                <h3>{t('marketConnectTo')} {connectModal.farmer?.name}</h3>
                <p>{connectModal.grainType} · {connectModal.location}</p>
              </div>
            </div>
            <div className="market-modal-route">
              <div className="market-route-point farmer">
                <span>🌾</span>
                <small>{connectModal.farmer?.name}</small>
              </div>
              <div className="market-route-line">
                <span className="market-route-pulse" />
              </div>
              <div className="market-route-point customer">
                <span>🛒</span>
                <small>{farmer?.name}</small>
              </div>
            </div>
            <form onSubmit={handleConnect}>
              <label>{t('marketQtyNeeded')} (quintals)</label>
              <input
                type="number"
                className="input-field"
                required
                min="1"
                max={connectModal.quantityQuintals}
                value={connectQty}
                onChange={(e) => setConnectQty(e.target.value)}
              />
              <label>{t('marketMessage')}</label>
              <textarea
                className="input-field market-textarea"
                rows={2}
                placeholder={t('marketMessagePlaceholder')}
                value={connectMsg}
                onChange={(e) => setConnectMsg(e.target.value)}
              />
              <div className="market-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setConnectModal(null)}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-connect" disabled={connecting}>
                  {connecting ? t('marketConnecting') : t('marketConnectNow')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
