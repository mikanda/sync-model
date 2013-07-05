
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
      i = 0,
      keyParts = key.split('.');

  if (key === 'type' || key === 'required')
    return;

  if (type(meta) === 'array' && meta.length >= 1) {
    this.model[keyParts[0]]([]);
    var amount = 0;
    var tmp = {};
    var allElements = query.all('[name^="' + key + '."]', this.form);
    each(allElements, function (el) {
      var name,
          nameParts;
      name = attr(el).get('name');
      nameParts = name.split('.');
      if (nameParts.length >= 1 && nameParts[1]*1 == nameParts[1])
        tmp[nameParts[0] + '.' + nameParts[1]] = true;
    });
    amount = object.length(tmp);
    var count = 0;
    while (amount > count) {
      if (query('[name^="' + key + '.' + i + '"]', this.form) !== null) {
        each(meta[0], function (k, v) {
          updateAttr(key + '.' + i + '.' + k, v);
        });
        count++;
      }
      i++;
    }
    //rearrange array
    var newArray = this.model[keyParts[0]]();
    obj = [];
    for(var index in newArray)
      if (newArray[index])
        obj.push(newArray[index]);
    this.model[keyParts[0]](obj);
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

  obj = this.model[keyParts[0]]();
  if (obj === undefined)
    obj = {};
  if (keyParts.length === 1) {
    obj = val;
  } else {
    part = obj;
    for (var i = 1; i < keyParts.length-1; i++) {
      if (part[keyParts[i]] === undefined)
        part[keyParts[i]] = {};
      part = part[keyParts[i]];
    }
    part[keyParts[keyParts.length-1]] = val;
  }
  this.model[keyParts[0]](obj);

};
