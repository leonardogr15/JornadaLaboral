/**
 * Validates and normalizes req.body / req.params with zod schemas.
 * Express 5 forwards the thrown ZodError to the error handler (400).
 * Express 5 makes req.query a getter, so only body and params are replaced.
 */
function validate({ body, params } = {}) {
  return (req, res, next) => {
    if (params) req.params = params.parse(req.params);
    if (body) req.body = body.parse(req.body ?? {});
    next();
  };
}

module.exports = validate;
