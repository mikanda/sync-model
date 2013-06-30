
/**
 * Module dependencies.
 */

var chai = require('chaijs-chai'),
    model = require('component-model'),
    domify = require('component-domify'),
    syncModel = require('sync-model'),
  
  // symbol imports
  
    should = chai.should();

/**
 * Tests.
 */

describe('sync-model', function(){
  var Model,
      object,
      el;
  before(function(){
    var html;
    html = [
      '<html>',
      '  <head></head>',
      '  <body>',
      '    <form>',
      '      <input name="simplevalue" type="text"',
      '             value="simplevalue : value" />',
      '      <input name="objectvalue.nested.value" type="text"',
      '             value="objectvalue -> nested -> value : value" />',
      '      <input name="arrayvalue.0.nested.value"',
      '             value="arrayvalue -> 0 -> nested -> value : value" />',
      '      <input name="arrayvalue.1.nested.value"',
      '             value="arrayvalue -> 1 -> nested -> value : value" />',
      '    </form>',
      '  </body>',
      '</html>'
    ].join('\n');
    el = domify(html);

    // initialize model

    Model = model('Entity')
      .attr('simplevalue')
      .attr('objectvalue', {
        nested: {
          value: 'string'
        }
      })
      .attr('arrayvalue', [{
        nested: {
          value: 'string'
        }
      }]);

    // use model to instantiate object

    object = new Model({
      simplevalue: 'string',
      objectvalue: {
        nested: {
          value: 'string'
        }
      },
      arrayvalue: [
        {
          nested: {
            value: 'string'
          }
        }, {
          nested: {
            value: 'string'
          }
        }
      ]
    });
    syncModel(el, object);
  });
  it('should have synchronized the simple value', function(){
    object.simplevalue().should.eql('simplevalue : value');
  });
  it('should have synchronized the object value', function(){
    should.exist(object.objectvalue().nested);
    should.exist(object.objectvalue().nested.value);
    object
      .objectvalue()
      .nested
      .value
      .should
      .equal('objectvalue -> nested -> value : value');
  });
  it('should have synchronized the array value', function(){
    for (var i = 0; i < 2; ++i) {
      object
        .arrayvalue()
        [i]
        .nested
        .value
        .should
        .equal('arrayvalue -> ' + i + ' -> nested -> value : value');
    }
  });
});
