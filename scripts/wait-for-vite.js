import http from 'http';

const url = 'http://localhost:5173';
const maxRetries = 30;
let retries = 0;

function checkVite() {
  http
    .get(url, (res) => {
      console.log('Vite dev server is ready! Launching Electron...');
      process.exit(0);
    })
    .on('error', () => {
      retries++;
      if (retries >= maxRetries) {
        console.error('Timed out waiting for Vite server.');
        process.exit(1);
      }
      setTimeout(checkVite, 1000);
    });
}

checkVite();
