
/**
 * Module dependencies.
 */

var object = require('object'),
    each = require('each'),
    value = require('value'),
    query = require('query'),
    type = require('type');

/**
 * Module exports.
 */

module.exports = syncModel;

function syncModel (form, model) {
  this.form = form;
  if (type(model) === 'function') {
    model = new model();
  }
  this.model = model;
  this.attrs = model.model.attrs;
  each(attrs, updateAttr);
  return model;
};

function updateAttr (key, meta) {
  var val,
      el,
      part,
      obj,
      i = 0;

  if (key === 'type' || key === 'required')
    return;

  if (type(meta) === 'array' && meta.length >= 1) {
    while (query('[name^="' + key + '.' + i + '"]', this.form) !== null) {
      each(meta[0], function (k, v) {
        updateAttr(key + '.' + i + '.' + k, v);
      });
      i++;
    }
    return;
  }

  if (type(meta) === 'object' && !object.isEmpty(meta)) {
    each(meta, function (k, v) {
      updateAttr(key + '.' + k, v);
    });
    return;
  }

  el = query('[name="'+key+'"]', this.form);
  if (!el)
    return;
  val = value(el);

  key = key.split('.');
  obj = this.model[key[0]]();
  if (obj === undefined)
    obj = {};
  if (key.length === 1) {
    obj = val;
  } else {
    part = obj;
    for (var i = 1; i < key.length-1; i++) {
      if (part[key[i]] === undefined)
        part[key[i]] = {};
      part = part[key[i]];
    }
    part[key[key.length-1]] = val;
  }
  this.model[key[0]](obj);

};
