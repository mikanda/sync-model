# sync-model

  Takes a model and updates its values using form fields

## Installation

  Install with [component(1)](http://component.io):

    $ component install luka5/sync-model

## Usage

```js
var syncModel = require('sync-model');
var model = require('model');

var el,
    entity,
    EntityClass;
el = document.querySelector('#my-form');
EntityClass = model(...).attr(...);
entity = syncModel(el, EntityClass);
//or
entity = new EntityClass(...);
entity = syncModel(el, entity);
```

## API

### syncModel(form, model)
Takes the ``form`` dom element and a ``model`` or model instance.
Returns a ``model`` instance.



## License

  MIT
