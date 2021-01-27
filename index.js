import { createServer } from 'http';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const stealth = StealthPlugin();
stealth.enabledEvasions.delete('chrome.runtime');
stealth.enabledEvasions.delete('iframe.contentWindow');

const bet365 = {
  token: undefined,
};

// other bookmaker

const server = createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write(bet365.token);
    res.end();
  }
});

server.listen(5000);
console.log('Node.js web server at port 5000 is running..');

function generateBet365Token() {
  puppeteer
    .use(stealth)
    .launch({ headless: false })
    .then(async (browser) => {
      const [page] = await browser.pages();
      await page.setUserAgent(userAgent);
      await page.goto('https://www.bet365.com');
      await page.waitForRequest((req) => {
        if (req.url().includes('SportsBook')) {
          bet365.token = req.headers()['x-net-sync-term'];
          console.log('bet365 token updated');
          return true;
        }
      });
      await browser.close();
    });
}

generateBet365Token();
// setInterval(generateBet365Token, 10 * 60 * 1000);
