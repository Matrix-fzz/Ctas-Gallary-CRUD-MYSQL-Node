import serverless from 'serverless-http';
import app from './app.js';

export default {
  async fetch(request, env, ctx) {
    try {
      return await serverless(app, {
        request: (req) => {
          req.db = env.DB;
        }
      })(request, env, ctx);
    } catch (e) {
      return new Response(e.stack || e.message, { status: 500 });
    }
  }
};
