import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import './Features.css';

const CATS = ['all', 'question', 'tip', 'success', 'alert'];

export default function Community() {
  const { farmer } = useAuth();
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', category: 'question' });
  const [posting, setPosting] = useState(false);
  const [replyText, setReplyText] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const { data } = await api.get('/api/community/posts', { params });
      setPosts(data.posts);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const submitPost = async (e) => {
    e.preventDefault();
    if (!form.title || !form.body) return;
    setPosting(true);
    setError(null);
    try {
      await api.post('/api/community/posts', form);
      setForm({ title: '', body: '', category: 'question' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setPosting(false);
    }
  };

  const like = async (id) => {
    try {
      await api.post(`/api/community/posts/${id}/like`);
      load();
    } catch (err) { setError(err.response?.data?.error || err.message); }
  };

  const reply = async (id) => {
    const text = replyText[id];
    if (!text) return;
    try {
      await api.post(`/api/community/posts/${id}/reply`, { text });
      setReplyText((r) => ({ ...r, [id]: '' }));
      load();
    } catch (err) { setError(err.response?.data?.error || err.message); }
  };

  const initials = (name) => (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="feature-page">
      <div className="feature-header glass">
        <span className="feature-badge">{t('communityBadge')}</span>
        <h1>{t('communityTitle')}</h1>
        <p>{t('communitySubtitle')}</p>
      </div>

      {error && <p className="feature-error glass">{error}</p>}

      <div className="community-new glass">
        <h2 style={{ color: 'var(--farm-green)', marginBottom: 14 }}>{t('communityAsk')}</h2>
        <form className="tool-form" onSubmit={submitPost}>
          <select className="input-field" value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            <option value="question">{t('cat_question')}</option>
            <option value="tip">{t('cat_tip')}</option>
            <option value="success">{t('cat_success')}</option>
            <option value="alert">{t('cat_alert')}</option>
          </select>
          <input className="input-field" placeholder={t('communityTitlePlaceholder')}
            value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <textarea className="input-field feature-textarea" placeholder={t('communityBodyPlaceholder')}
            value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          <button type="submit" className="btn-primary" disabled={posting}>
            {posting ? t('loading') : t('communityPost')}
          </button>
        </form>
      </div>

      <div className="chip-row">
        {CATS.map((c) => (
          <button key={c} type="button" className={`chip ${filter === c ? 'active' : ''}`}
            onClick={() => setFilter(c)}>
            {c === 'all' ? t('mandiAll') : t('cat_' + c)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="feature-loading">{t('loading')}</p>
      ) : posts.length === 0 ? (
        <p className="feature-empty glass">{t('communityEmpty')}</p>
      ) : (
        posts.map((p) => (
          <div key={p._id} className="post-card glass">
            <div className="post-head">
              <div className="post-avatar">{initials(p.authorName)}</div>
              <div style={{ flex: 1 }}>
                <strong>{p.authorName}</strong>
                {p.author === farmer?._id && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}> · {t('communityYou')}</span>}
              </div>
              <span className={`post-cat ${p.category}`}>{t('cat_' + p.category)}</span>
            </div>
            <div className="post-title">{p.title}</div>
            <div className="post-body">{p.body}</div>
            <div className="post-actions">
              <button type="button" className="post-btn" onClick={() => like(p._id)}>👍 {p.likes}</button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                💬 {p.replies?.length || 0} {t('communityReplies')}
              </span>
            </div>
            {p.replies?.length > 0 && (
              <div className="post-replies">
                {p.replies.map((r) => (
                  <div key={r._id} className="post-reply">
                    <strong>{r.authorName}:</strong> {r.text}
                  </div>
                ))}
              </div>
            )}
            <div className="reply-row">
              <input className="input-field" placeholder={t('communityReplyPlaceholder')}
                value={replyText[p._id] || ''}
                onChange={(e) => setReplyText((rt) => ({ ...rt, [p._id]: e.target.value }))} />
              <button type="button" className="btn-secondary" onClick={() => reply(p._id)}>
                {t('communityReply')}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
