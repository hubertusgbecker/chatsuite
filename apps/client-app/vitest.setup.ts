// Vitest setup for client-app
// TextEncoder/TextDecoder polyfill needed by react-router in jsdom
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, { TextEncoder, TextDecoder });
