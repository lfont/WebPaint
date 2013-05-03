/*
A simple drawing application for touch devices.
Loïc Fontaine - http://github.com/lfont - MIT Licensed
*/

var app  = require('./app');

app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log('Express server listening on port %d in %s mode',
                app.address().port, app.settings.env);
});
