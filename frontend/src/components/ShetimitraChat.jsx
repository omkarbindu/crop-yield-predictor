import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import '../pages/Shetimitra.css';

const QUICK_KEYS = [
  'shetimitraQuickCrop',
  'shetimitraQuickWheatRust',
  'shetimitraQuickPMKisan',
  'shetimitraQuickSellRice',
];

function buildApiHistory(messages) {
  return messages
    .filter(
      (m) =>
        !m.localOnly &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim() &&
        !m.content.startsWith('⚠️'),
    )
    .slice(-10)
    .map((m) => ({
      role: m.role,
      content: m.content.trim(),
    }));
}

export default function ShetimitraChat({ compact = false }) {
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const resetWelcome = useCallback(() => {
    setMessages([
      { role: 'assistant', content: t('shetimitraWelcome'), localOnly: true },
    ]);
  }, [t]);

  useEffect(() => {
    resetWelcome();
  }, [resetWelcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput('');

    const userMsg = { role: 'user', content: trimmed };
    const historyForApi = buildApiHistory(messages);

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post('/api/shetimitra/chat', {
        message: trimmed,
        history: historyForApi,
        lang,
      });

      const reply =
        data?.reply?.trim() ||
        'Sorry, I could not generate a response. Please try again.';

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply },
      ]);
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.message ||
        t('shetimitraUnavailable');
      setError(errMsg);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const showQuickChips =
    messages.filter((m) => m.role === 'user').length === 0 && !loading;

  return (
    <div className={`shetimitra-chat ${compact ? 'shetimitra-chat--compact' : ''}`}>
      <div className="shetimitra-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`shetimitra-msg ${msg.role === 'user' ? 'shetimitra-msg--user' : 'shetimitra-msg--bot'}`}
          >
            {msg.role === 'assistant' && (
              <div className="shetimitra-avatar" aria-hidden="true">🌾</div>
            )}
            <div className="shetimitra-bubble glass">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="shetimitra-msg shetimitra-msg--bot">
            <div className="shetimitra-avatar" aria-hidden="true">🌾</div>
            <div className="shetimitra-bubble glass shetimitra-bubble--typing">
              <span className="shetimitra-dot" />
              <span className="shetimitra-dot" />
              <span className="shetimitra-dot" />
              <span className="shetimitra-thinking-text">{t('shetimitraThinking')}</span>
            </div>
          </div>
        )}

        {showQuickChips && (
          <div className="shetimitra-quick">
            {QUICK_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                className="shetimitra-quick-chip chip"
                onClick={() => sendMessage(t(key))}
                disabled={loading}
              >
                {t(key)}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="shetimitra-error" role="alert">{error}</div>
      )}

      <form className="shetimitra-input-row" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="input-field shetimitra-input"
          placeholder={t('shetimitraPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          aria-label={t('shetimitraPlaceholder')}
        />
        <button
          type="submit"
          className="btn-primary shetimitra-send"
          disabled={loading || !input.trim()}
        >
          {t('shetimitraSend')}
        </button>
      </form>
    </div>
  );
}
