var tower = require('./index')({});

tower.on('network update', function(port) {
    console.log(port)
})