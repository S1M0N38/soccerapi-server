import { createServer } from 'http';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const bet365 = {
  token: undefined,
};

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
  const stealth = StealthPlugin();
  // stealth.enabledEvasions.delete('chrome.runtime');
  // stealth.enabledEvasions.delete('iframe.contentWindow');
  puppeteer
    .use(stealth)
    .launch({ headless: false })
    .then(async (browser) => {
      const [page] = await browser.pages();
      await page.goto('https://www.bet365.com');
      await page.waitForRequest((req) => {
        if (req.url().includes('SportsBook')) {
          bet365.token = req.headers()['x-net-sync-term'];
          console.log(`${new Date()} - new token ${bet365.token}`);
          return true;
        }
      });
      await browser.close();
    });
}

generateBet365Token();
setInterval(generateBet365Token, 10 * 60 * 1000);

// function testHeadless() {
//   const stealth = StealthPlugin();
//   puppeteer
//     .use(stealth)
//     .launch({ headless: true })
//     .then(async (browser) => {
//       const page = await browser.newPage();
//       await page.goto('https://bot.sannysoft.com');
//       await page.waitFor(5000);
//       await page.screenshot({ path: './stealth.png', fullPage: true });
//       await browser.close();
//     });
// }

// testHeadless();
