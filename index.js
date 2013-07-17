
/**
 * Module dependencies.
 */

var object = require('object'),
    each = require('each'),
    value = require('value'),
    query = require('query'),
    attr = require('attr'),
    type = require('type');

/**
 * Module exports.
 */

module.exports = SyncModel;

function SyncModel (form, model) {
  if (!(this instanceof SyncModel))
    return new SyncModel(form, model);

  var self = this;
  this.form = form;
  this.model = model;
  if (type(model) === 'function')
    this.model = model = new model();

  each(model.model.attrs, function (key, meta) {
    self.search(key, meta);
  });
  return model;
};
SyncModel.prototype.search = function (key, meta) {
  var val,
      el,
      i,
      self = this;

  if (!meta
      || type(meta) === 'string'
      || meta.type.match(/^boolean|integer|number|string|null$/g) !== null) {
    el = query('[name="'+key+'"]', this.form);
    if (!el)
      return;
    val = value(el);
    if (meta.type === 'integer' || meta.type === 'number')
      val = val*1;
    this.updateValue(key, val);

  } else if (meta.type === 'object') {
    each(meta.properties, function (k, v) {
      self.search(key + '.' + k, v);
    });

  } else if (meta.type === 'array') {
    this.updateValue(key, []);
    i = 0;
    while (query('[name^="' + key + '.' + i + '"]', this.form) !== null) {
      self.search(key + '.' + i, meta.items);
      i++;
    }
  }
};
SyncModel.prototype.updateValue = function (key, val) {
  var obj,
      part,
      i,
      keyParts = key.split('.');
  obj = this.model[keyParts[0]]();
  if (obj === undefined)
    obj = {};
  if (keyParts.length === 1) {
    obj = val;
  } else {
    part = obj;
    for (i = 1; i < keyParts.length-1; i++) {
      if (part[keyParts[i]] === undefined)
        part[keyParts[i]] = {};
      part = part[keyParts[i]];
    }
    part[keyParts[keyParts.length-1]] = val;
  }
  this.model[keyParts[0]](obj);
};