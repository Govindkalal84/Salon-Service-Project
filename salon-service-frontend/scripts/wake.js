import http from 'https';

const urls = [
  'https://eureka-4.onrender.com/eureka/',
  'https://project-1-md39.onrender.com/actuator/health',
  'https://project-2-ltzu.onrender.com/actuator/health',
  'https://project-3-a32z.onrender.com/actuator/health',
  'https://project-gikt.onrender.com/actuator/health',
  'https://project-5-h6lp.onrender.com/actuator/health',
  'https://project-6-be0t.onrender.com/actuator/health',
  'https://project-7-wxtf.onrender.com/actuator/health',
  'https://project-8-mhyw.onrender.com/actuator/health',
  'https://project-10-mwki.onrender.com/actuator/health'
];

console.log('Sending concurrent wakeup pings to all Render services...');

urls.forEach((url) => {
  const req = http.get(url, { timeout: 3000 }, (res) => {
    console.log(`Pinged: ${url} -> Status: ${res.statusCode}`);
  });
  req.on('error', (err) => {
    console.log(`Pinged: ${url} -> Initiated connection (waking up...)`);
  });
  req.on('timeout', () => {
    req.destroy();
  });
});
