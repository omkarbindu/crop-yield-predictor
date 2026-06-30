const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://sweet-jalebi-4fe432.netlify.app',
];

function buildAllowedOrigins() {
  const origins = new Set(DEFAULT_ORIGINS);
  const fromEnv = process.env.FRONTEND_URL || process.env.CORS_ORIGINS || '';
  for (const entry of fromEnv.split(',')) {
    const trimmed = entry.trim();
    if (trimmed) origins.add(trimmed);
  }
  return origins;
}

const allowedOrigins = buildAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    // Non-browser clients (curl, Render health checks) send no Origin header.
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

module.exports = { corsOptions, allowedOrigins };
