const { ZodError } = require("zod");

function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.issues });
      }
      return next(error);
    }
  };
}

module.exports = validate;
