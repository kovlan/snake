
var Engine = (function(global) {

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    var canvas_width = 320;
    var canvas_height = 550;
    var playing = true;

    canvas.width = canvas_width;
    canvas.height = canvas_height;
    doc.body.appendChild(canvas);

    function main() {

        var now = Date.now();
            
        var dt = (now - lastTime) / 1000.0;

        update(dt);
        render();

        lastTime = now;

        if (playing) {
            win.requestAnimationFrame(main);
        }
    }

    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    function update(dt) {
    }

    function render() {
    }

    function reset() {
    }

    document.addEventListener('keydown', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
        };

    });

    win.requestAnimationFrame(main);

})(this);
