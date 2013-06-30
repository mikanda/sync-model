
/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , express = require('express')
  , Builder = require('component-builder')
  
  // symbol imports
  
  , writeFile = fs.writeFileSync;

// create application

var app = express();
app.set('view engine', 'jade');
app.set('views', __dirname);

// use builder middleware

app.use(function(req, res, next){
  var builder = new Builder('.');
  builder.copyAssetsTo('build');
  builder.development();
  builder.build(function(err, res){
    if (err) return next(err);
    writeFile('build/build.js', res.require + res.js);
    writeFile('build/build.css', res.css);
    next();
  });
});
app.use(express.static(process.cwd()));

// deliver tests

app.get('/', function(req, res){
  res.render('index');
});
app.listen(3000);
