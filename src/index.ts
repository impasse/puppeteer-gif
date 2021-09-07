import { Page } from 'puppeteer';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import Bluebird from 'bluebird';
import GIFEncoder from 'gif-encoder';
import jimp from 'jimp';

interface Options {
  duration: number,
}

type Nullable<T> = T | null

interface TraceEvent {
  name: string,
  args: Nullable<{
    snapshot: Nullable<string>,
  }>,
  ts: number,
}

export default async function record(page: Page, options: Options): Promise<Buffer> {
  const tempDir = await fsPromises.mkdtemp('puppeteer-');
  const filePath = path.resolve(tempDir, 'tracing.json');
  const gifPath = path.resolve(tempDir, 'out.gif');
  try {
    await page.tracing.start({
      path: filePath,
      screenshots: true,
      categories: [
        'screenshot',
      ],
    });
    await Bluebird.delay(options.duration);
    const tracingData = await page.tracing.stop();
    const tracing = JSON.parse(tracingData.toString());
    const screenshots = tracing.traceEvents
      .filter((event: TraceEvent) => event.name === 'Screenshot' && !!event?.args?.snapshot)
      .sort((ea: TraceEvent, eb: TraceEvent) => ea.ts - eb.ts)
      .map((event: TraceEvent) => Buffer.from(event!.args!.snapshot!, 'base64'));
    const viewport = await page.viewport() ?? { width: 0, height: 0};
    const gif = new GIFEncoder(viewport.width, viewport.height);
    const out = fs.createWriteStream(gifPath);
    gif.pipe(out);
    gif.setFrameRate(options.duration / screenshots);
    gif.setQuality(1);
    gif.setRepeat(0);
    gif.writeHeader();
    await Bluebird.each(screenshots, async (screenshot: Buffer) => {
      gif.addFrame(await readPixmap(screenshot, viewport.width, viewport.height));
    });
    return await new Promise((resolve, reject) => {
      out.on('close', async () => {
        try {
          resolve(await fsPromises.readFile(gifPath, { encoding: null }));
        } catch (e) {
          reject(e);
        }
      });
      out.on('error', reject);
      gif.finish();
    });
  } finally {
    await fsPromises.rmdir(tempDir, { recursive: true });
  }
}

async function readPixmap(data: Buffer, w: number, h: number) {
  const image = await jimp.read(data);
  image.cover(w, h, jimp.HORIZONTAL_ALIGN_LEFT | jimp.VERTICAL_ALIGN_TOP);
  return image.bitmap.data;
}