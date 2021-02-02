import { createServer } from 'http';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const bet365 = {
  headers: undefined,
  cookies: undefined,
};

const server = createServer((req, res) => {
  if (req.url === '/bet365') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(bet365));
    res.end();
  }
});

server.listen(5000);
console.log('Node.js web server at port 5000 is running..');

function generateBet365Token() {
  const stealth = StealthPlugin();
  stealth.enabledEvasions.delete('chrome.runtime');
  stealth.enabledEvasions.delete('iframe.contentWindow');
  puppeteer
    .use(stealth)
    .launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    .then(async (browser) => {
      const page = await browser.newPage();

      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'maxTouchPoints', {
          get() {
            return 1;
          },
        });
      });

      await page.goto('https://www.bet365.com');
      await page.waitForRequest((req) => {
        if (req.url().includes('SportsBook')) {
          bet365.headers = {
            'User-Agent': req.headers()['user-agent'],
            Referer: req.headers().referer,
            'X-Net-Sync-Term': req.headers()['x-net-sync-term'],
          };
          return true;
        }
      });
      bet365.cookies = await page.cookies();
      console.log(`${new Date()} - generate bet365 values`);
      await browser.close();
    });
}

generateBet365Token();
setInterval(generateBet365Token, 5 * 60 * 1000);
