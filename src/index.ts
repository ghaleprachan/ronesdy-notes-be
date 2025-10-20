import config from './config.js';
import app from './app.js';

// server listening
app.listen(config.PORT, () => {
  console.log(`APP LISTENING ON http://${config.HOST}:${config.PORT}`);
});
