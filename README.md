# flyup-img-files-middleware

## WIP

Nodejs Express REST middleware for image file upload and simple storage handling.

Best used with [flyimg](https://github.com/flyimg/flyimg) and [flyup-ng](https://github.com/baamenabar/flyup-ng).

## Installation

```
npm install flyup-img-files-middleware
```

## Usage

```js
const express = require('express');
const imgRouter = require('flyup-img-files-middleware');

const app = epress();
app.use('api/media', imgRouter);
```

## Testing

The app has unit and integration tests, all of which are executed by running:

```
npm test
```

## License

[MIT](./LICENSE)
