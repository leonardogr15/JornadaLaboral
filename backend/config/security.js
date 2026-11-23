const JWT_ALGORITHM = 'HS256';
const JWT_MIN_SECRET_LENGTH = 32;
const JWT_EXPIRES_IN = '8h';

/**
 * Returns the JWT secret or throws if it is missing or too short.
 * Called at startup so a misconfigured deployment fails fast.
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < JWT_MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be set and be at least ${JWT_MIN_SECRET_LENGTH} characters long`
    );
  }
  return secret;
}

module.exports = { JWT_ALGORITHM, JWT_MIN_SECRET_LENGTH, JWT_EXPIRES_IN, getJwtSecret };
