
/**
 * Module dependencies.
 */

var object = require('object'),
    each = require('each'),
    value = require('value'),
    query = require('query'),
    attr = require('attr'),
    type = require('type'),
    Batch = require('batch'),
    validator = require('amanda')('json');

/**
 * Module exports.
 */

module.exports = syncModel;

function syncModel (form, model, callback, callbackScope, opt) {
  var batch = new Batch;
  this.form = form;
  if (type(model) === 'function') {
    model = new model();
  }
  this.model = model;
  this.attrs = model.model.attrs;
  each(attrs, function (key, meta) {
    var data;
    search(key, meta);

    if (!opt || opt.validate === true) {
      data = this.model[key]();
      batch.push(function (done) {
        validator.validate(data, meta, { singleError: false }, function (err) {
          var errors = [],
              i;
          if (err && err.length)
            for (i = 0; i < err.length; i++) {
              if (err[i].property === undefined || err[i].property == '')
                err[i].property = key;
              else
                err[i].property = key + '.' + err[i].property;
              errors.push(err[i]);
            }
          done(null, errors);
        });
      });
    }
  });
  batch.end(function (_, _errors) {
    var errors = [];
    each(_errors, function (err, index) {
      if (err.length > 0)
        errors = errors.concat(err);
    });
    if (errors.length === 0)
      errors = null;
    callback.call(callbackScope, errors);
  });
  return model;
};

function search (key, meta) {
  var val,
      el,
      part,
      obj,
      i = 0,
      amount = 0,
      count = 0,
      tmp = {},
      allElements,
      index;

  if (!meta || type(meta) === 'string' || meta.type === 'boolean' || meta.type === 'integer' || meta.type === 'number' || meta.type === 'string' || meta.type === 'null') {
    el = query('[name="'+key+'"]', this.form);
    if (!el)
      return;
    val = value(el);
    if (meta.type === 'integer' || meta.type === 'number')
      val = val*1;
    updateValue(key, val);

  } else if (meta.type === 'object') {
    each(meta.properties, function (k, v) {
      search(key + '.' + k, v);
    });

  } else if (meta.type === 'array') {
    updateValue(key, []);
    allElements = query.all('[name^="' + key + '."]', this.form);
    each(allElements, function (el) {
      var name,
          nameParts;
      name = attr(el).get('name');
      nameParts = name.split('.');
      if (nameParts.length >= 1 && nameParts[1]*1 == nameParts[1])
        tmp[nameParts[0] + '.' + nameParts[1]] = true;
    });
    amount = object.length(tmp);

    while (amount > count) {
      if (query('[name^="' + key + '.' + i + '"]', this.form) !== null) {
        search(key + '.' + i, meta.items);
        count++;
      }
      i++;
    }

    //rearrange array, make it continuous
    tmp = this.model[key.split('.')[0]]();
    obj = [];
    for(index in tmp)
      if (tmp[index])
        obj.push(tmp[index]);
    this.model[key.split('.')[0]](obj);
    return;
  }
};

function updateValue (key, val) {
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