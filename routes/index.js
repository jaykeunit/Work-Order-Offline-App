var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/manifest', function(req, res, next){
	res.header('Content-type', 'text/cache-manifest');
	res.end('CACHE MANIFEST');
});

router.get('/test', function(req, res, next) {
  res.send("works");
});

router.post('/add', function(req, res, next) {
  console.log(req.body);
  res.send('got it');
});


module.exports = router;
