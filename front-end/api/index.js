export default async (req, res) => {
  const { reqHandler } = await import('../dist/front-end/server/server.mjs');
  return reqHandler(req, res);
};
