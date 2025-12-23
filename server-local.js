import app from './app.js';

const port = process.env.PORT || 5000;

// Mock database for local testing
app.locals.db = {
    prepare: (query) => ({
        bind: (...args) => ({
            first: async () => null,
            all: async () => ({ results: [] }),
            run: async () => ({ success: true, meta: { last_row_id: 1 } })
        })
    })
};

app.listen(port, () => {
    console.log(`\n✅ Server is running on http://localhost:${port}`);
    console.log(`📁 Serving static files from: public/`);
    console.log(`\n🔗 Open http://localhost:${port}/index.html in your browser\n`);
});
