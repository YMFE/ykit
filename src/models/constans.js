const ENTRY_EXTNAMES = {
    css: ['.css', 'sass', 'scss', 'less'],
    js: ['.js', '.jsx', '.ts', '.tsx']
};

const REQUIRE_RULES = ['fekit_modules|fekit.config:main|./src/index.js'];

const extraConfig = (cwd) => {
  return {
    cwd: cwd,
    entryExtNames: {
        css: ['.css', '.less', '.sass', '.scss'],
        js: ['.js', '.jsx', '.ts', '.tsx']
    },
    requireRules: ['fekit_modules|fekit.config:main|./src/index.js'],
    middleware: []
  }
};
module.exports = { ENTRY_EXTNAMES, REQUIRE_RULES, extraConfig };
