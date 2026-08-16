import app from './src/app';
import { config } from './src/config/index';

const port = config.port;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});