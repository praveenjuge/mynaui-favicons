import { generateFavicons } from '../';

try {
  generateFavicons(`./tests/favicon.svg`, 20, 'APP NAME');
} catch (e) {
  console.error(e);
}
