module.exports = {
    "env": {
        "browser": false,
        "commonjs": false,
        "es6": true,
        "node":true

    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "no-extra-semi":0,
        "no-unused-vars":0,
        "require-atomic-updates":0,
        "prefer-const":2,
        'no-console':0
    }
};