
var Engine = (function(global) {

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    var border_size = 10;
    var elem_width = 15;
    var elem_height = 15;
    var field_width = 40;
    var field_height = 30;
    var stone_percentage = 0.05;
    
    var canvas_width = elem_width * field_width + 2 * border_size;
    var canvas_height = elem_height * field_height + 2 * border_size;
    var playing = true;
    
    var field = {};
    var snake = {};

    canvas.width = canvas_width;
    canvas.height = canvas_height;
    doc.body.appendChild(canvas);

    function main() {

        var now = Date.now();

        var dt = (now - lastTime) / 1000.0;

        update(dt);
        render();

        if (!snake.isAlive()) {
            playing = false;
        }

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
        snake.update(dt);
        field.update(dt);
    }

    function renderSquare(x, y, w, h, col) {
        ctx.fillStyle = col;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle='black';
    }

    function renderCircle(x, y, w, h, col) {
        ctx.fillStyle = col;
        ctx.fillCircle(x, y, w, h);
        ctx.fillStyle='black';
    }

    function render() {
        // draw background
        ctx.fillStyle='#CCCCCC';
        ctx.fillRect(0, 0, canvas_width, canvas_height);
        ctx.fillStyle='black';

        // draw field border
        var bottom_line_y = border_size + field_height * elem_height;
        var right_line_x = border_size + field_width * elem_width;
        ctx.beginPath();
        ctx.moveTo(border_size, border_size);
        ctx.lineTo(border_size, bottom_line_y);
        ctx.lineTo(border_size + field_width * elem_width, bottom_line_y);
        ctx.lineTo(right_line_x, border_size);
        ctx.lineTo(border_size, border_size);
        ctx.stroke();

        // draw field elements
        for (row = 0; row < field_height; row++) {
            for (col = 0; col < field_width; col++) {
                var elem_name = field.getValue(col, row);
                switch (elem_name) {
                case 'stone': 
                    renderSquare(border_size + col * elem_width,
                                 border_size + row * elem_height,
                                 elem_width,
                                 elem_height,
                                 '#000000');
                    break;
                case 'snake':
                    renderSquare(border_size + col * elem_width,
                                 border_size + row * elem_height,
                                 elem_width,
                                 elem_height,
                                 '#884400');
                    break;
                case 'food':
                    renderSquare(border_size + col * elem_width,
                                 border_size + row * elem_height,
                                 elem_width,
                                 elem_height,
                                 '#00FF00');
                    break;
                }
            }
        }

        // draw snake head
        var head = snake.getHead();
        var snake_color = '#FFFF00';
        if (!snake.isAlive()) {
            snake_color = '#FF0000';
        }
        renderSquare(border_size + head.x * elem_width,
                     border_size + head.y * elem_height,
                     elem_width,
                     elem_height,
                     snake_color);
    }

    function reset() {
        field = new Field(field_width, field_height, stone_percentage);
        snake = new Snake(field);
    }

    document.addEventListener('keydown', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
        };

        // move
        if (allowedKeys[e.keyCode]) {
            snake.turn(allowedKeys[e.keyCode]);
        }

    });

    win.requestAnimationFrame(init);

})(this);
