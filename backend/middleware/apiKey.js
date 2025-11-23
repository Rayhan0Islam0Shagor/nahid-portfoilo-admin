// Middleware to check API key for public gallery access
export const checkApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const allowedApiKey = process.env.GALLERY_API_KEY;

  // If no API key is configured, allow access
  if (!allowedApiKey) {
    return next();
  }

  // If API key is configured, require it
  if (!apiKey) {
    return res.status(401).json({
      message:
        'API key required. Provide it in header: x-api-key or query: ?apiKey=your-key',
    });
  }

  if (apiKey !== allowedApiKey) {
    return res.status(403).json({ message: 'Invalid API key' });
  }

  next();
};

// Middleware to check origin/referer for platform-specific access
export const checkOrigin = (req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : [];

  // If no origins configured, allow all
  if (allowedOrigins.length === 0) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;

  if (!origin) {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  const isAllowed = allowedOrigins.some((allowedOrigin) =>
    origin.startsWith(allowedOrigin),
  );

  if (!isAllowed) {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  next();
};
