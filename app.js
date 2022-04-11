const express = require('express');
const app = express();
const api = require('./routes');
const PORT = 3000 || process.env.PORT;

app.use(api);

module.exports = app;

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});