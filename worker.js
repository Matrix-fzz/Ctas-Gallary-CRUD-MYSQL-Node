import serverless from 'serverless-http';
import app from './app.js';

export default {
  async fetch(request, env, ctx) {
    try {
      // Attach the database binding to the app before processing the request
      app.locals.db = env.DB;
      
      return await serverless(app)(request, env, ctx);
    } catch (e) {
      return new Response(e.stack || e.message, { status: 500 });
    }
  }
};
