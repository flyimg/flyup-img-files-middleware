# Testing

In the beginning there was code ... then changes happend, change had to be validated.

`npm test`

voilá!

## Integration + Unit

### Unit

Unit tests are written for helpers other non transactional logic, just to debug faster and have cleaner functions.

They are defined next to each module, with the same name, but with a `.test` sufix, mocha will pick them up

### Integration

In this project integration tests define the API of the application, thay are stored in the `/tests` folder and are called specs.

## Watching

`npm run test-watch` will run both unit and integration tests in watch mode.

To have them running in watch mode as you develop, you need to have mocha installed globally.

`mocha tests/spec.js --watch`

or

`mocha server/**/*.test.js --watch`

---

Happy testing!
