import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;

// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
