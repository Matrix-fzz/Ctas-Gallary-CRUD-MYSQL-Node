import serverless from 'serverless-http';
import app from './app.js';

// Create the handler once so we don't recreate it on every request
const handler = serverless(app);

export default {
  async fetch(request, env, ctx) {
    try {
      // Attach the database and assets bindings to the app before processing the request
      app.locals.db = env.DB;
      app.locals.ASSETS = env.ASSETS;
      app.locals.envKeys = Object.keys(env || {});

      return await handler(request, env, ctx);
    } catch (e) {
      return new Response(e.stack || e.message, { status: 500 });
    }
  }
};
