export const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (error, _req, res, _next) => {
  console.error(error);
  const status = error.statusCode || 500;
  const message = error.message || "Internal server error";
  res.status(status).json({ message });
};
