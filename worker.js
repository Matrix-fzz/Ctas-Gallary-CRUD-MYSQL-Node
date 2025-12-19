import serverless from 'serverless-http';
import app from './app.js';

export default {
  fetch: serverless(app)
};
