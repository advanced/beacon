var tower = require('./index')();

tower.register('alpha', function(err, port) {
    console.log(port)
})

tower.register('beta', function(err, port) {
    console.log(port)
})

tower.registred('beta', function(err, port) {
    console.log(port)
})

tower.on('new', function(port) {
    console.log(port)
})

setTimeout(function() {
    tower.registred('beta', function(err, port) {
        console.log(port)
    })

}, 1000)