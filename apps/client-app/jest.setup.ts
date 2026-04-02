// Polyfill for react-router v7 which requires TextEncoder/TextDecoder in jsdom
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextEncoder, TextDecoder });
