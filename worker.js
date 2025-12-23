import serverless from 'serverless-http';
import app from './app.js';

export default {
  fetch(request, env, ctx) {
    return serverless(app, {
      request: (req) => {
        req.db = env.DB;
      }
    })(request, env, ctx);
  }
};
