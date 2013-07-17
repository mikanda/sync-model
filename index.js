
/**
 * Module dependencies.
 */

var object = require('object'),
    each = require('each'),
    value = require('value'),
    query = require('query'),
    attr = require('attr'),
    type = require('type'),
    bind = require('bind');

/**
 * Module exports.
 */

module.exports = function(handlers){
  return function(Model){

    // inject new method

    Model.prototype.syncWith = function(el){
      SyncModel(el, this, handlers);
    };
  };
};

/**
 * Create/initialize a new synchronizer instance.
 */

function SyncModel(el, model, handlers) {
  if (!(this instanceof SyncModel))
    return new SyncModel(el, model, handlers);

  var self = this;
  this.typeHandlers = {
    'integer': bind(this, this.toNumber),
    'number': bind(this, this.toNumber)
  };
  this.formatHandlers = handlers || {};
  this.el = el;
  this.model = model;

  each(model.model.attrs, function (key, meta) {
    self.sync(key, meta);
  });
  return model;
};

/**
 * Synchronize the model at `key` with the data from the DOM.
 *
 * @param {String} key
 * @param {Object} schema
 */

SyncModel.prototype.sync = function (key, schema) {

  // dispatch the the handling to the appropriate function

  if (!schema) return;
  switch (schema.type) {
    case 'object': return this.syncObject(key, schema);
    case 'array': return this.syncArray(key, schema);
    default: return this.syncValue(key, schema);
  }
};

/**
 * Synchronize a single value.
 *
 * @param {String} key the key to the value
 * @param {Object} schema the schema of the affected attr
 * @param {Object} value
 */

SyncModel.prototype.syncValue = function(key, schema){
  var el,
      val,
      handler = null;
  el = query('[name=' + JSON.stringify(key) + ']', this.el);
  if (!el) return;
  val = value(el);

  // apply type handler if available

  handler = this.typeHandlers[schema.type];
  if (handler) val = handler(val);

  // apply format handler if available

  if (schema.format) {
    handler = this.formatHandlers[schema.format];
    if (handler) val = handler(val);
  }

  // update the modified value

  this.updateValue(key, val);
};

/**
 * Synchronize an object.
 *
 * @param {String} key the key to the object
 * @param {Object} schema the schema of the affected attr
 */

SyncModel.prototype.syncObject = function(key, schema){
  var self = this;
  each(schema.properties, function (k, v) {
    self.sync(key + '.' + k, v);
  });
};

/**
 * Synchronize an array.
 *
 * @param {String} key the key to the array
 * @param {Object} schema the schema of the affected attr
 */

SyncModel.prototype.syncArray = function(key, schema){
  var queryFn;

  // function to generate the next query string

  queryFn = function(i){
    return '[name^=' + JSON.stringify(key + '.' + i) + ']';
  };

  // set initial to empty array

  this.updateValue(key, []);
  for (var i = 0; query(queryFn(i), this.el); ++i) {
    this.sync(key + '.' + i, schema.items);
  }
};

/**
 * Converts the value to a number.
 */

SyncModel.prototype.toNumber = function(value){
  return Number(value);
};

/**
 * Update the value at `key`.
 *
 * @param {String} key
 * @param {Object} val
 */

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
