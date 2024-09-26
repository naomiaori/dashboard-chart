module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [0, "always", []],
    "type-case": [2, "always", "lower-case"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 72],
    "header-min-length": [2, "always", 10],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)(?:\(([^)]+)\))?!?:\s(.+)$/,
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },
};
