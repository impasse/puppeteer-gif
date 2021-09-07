
import puppeteer, { Page } from 'puppeteer';
import record from './index';
import fsPromises from 'fs/promises';
import process from 'process';


async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({ width: 1920, height: 1080 });
  await page.goto('https://v.qq.com');
  const buf = await record(page, { duration: 10000 });
  await fsPromises.writeFile('out.gif', buf);
  await page.close();
  await browser.close();
}

main()
  .then(() => console.log('ok'))
  .catch(console.error);