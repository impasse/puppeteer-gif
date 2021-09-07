/// <reference types="node" />
import { Page } from 'puppeteer';
interface Options {
    duration: number;
}
export default function record(page: Page, options: Options): Promise<Buffer>;
export {};
