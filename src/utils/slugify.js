const slugifyLib = require('slugify');

const makeSlug = (text) => {
  if (!text) return '';
  return slugifyLib(text, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
};

module.exports = makeSlug;
