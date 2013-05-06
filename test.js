var tower = require('./index')({});


tower.register('alpha', function(err, port) {
    console.log(err, port)
})

tower.register('beta', function(err, port) {
    console.log(err, port)
});


cpt=0;
h = setInterval(function() {
    tower.register('gamma', function(err, port) {
        console.log(err, port)
    })
    cpt++
    if(cpt==7)
        clearInterval(h);
}, 1000)

tower.on('maxed', function(port) {
    console.log(port)
})

tower.on('new', function(port) {
    console.log(port)
})

tower.on('network update', function(port) {
    console.log(port)
})