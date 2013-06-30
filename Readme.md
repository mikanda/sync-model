
# sync-model

  Takes a model and updates its values using form fields

## Installation

  Install with [component(1)](http://component.io):

    $ component install luka5/sync-model

## Usage

```js
var syncModel = require('sync-model');

var el
  , inst;
el = document.querySelector('#my-form');
inst = new Model(...);
syncModel(el, inst);
```

## API

### syncModel(form, model)
Takes the ``form`` dom element and a ``model`` or model instance.
Returns a ``model`` instance.



## License

  MIT
