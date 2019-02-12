module.exports = {
    extends: 'airbnb-base',
    parserOptions: {
        ecmaVersion: '2018',
    },
    env: {
        browser: false,
        node: true,
        commonjs: true,
        mocha: true,
    },
    rules: {
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'consistent-return': 'off',
        'max-len': [
            'error',
            {
                code: 100,
                comments: 160,
            },
        ],
        'prefer-destructuring': 'off',
        'prefer-template': 'off',
        'comma-dangle': ['error', 'only-multiline'],
        'arrow-parens': 'off',
    },
};
