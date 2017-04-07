//===================================
// Field - current status of game field

var Field = function(cols, rows, stone_percentage) {
    console.assert(rows > 0 && cols > 0);
    console.assert(rows < 1000 && cols < 1000);
    console.assert(stone_percentage >- 0.0 && stone_percentage <= 20.0);

    this.rows = rows;
    this.cols = cols;
    this.elems = new Array(rows);
    for (var i = 0; i < rows; ++i) {
        this.elems[i] = new Array(cols);
        for (var j = 0; j < cols; ++j) {
            this.elems[i][j] = 'none';
        }
    }

    this.stones_num = Math.floor(rows * cols * stone_percentage);
    for (var i = 0; i < this.stones_num; ++i) {
        do {
            var x = Math.floor((Math.random() * cols));
            var y = Math.floor((Math.random() * rows));
        } while (this.elems[y][x] != 'none');
        this.elems[y][x] = 'stone';

    }

    this.food_elems = 0;
    this.max_food_elems = 5;
    this.foods = [];
}

Field.prototype.getWidth = function() {
    return this.cols;
}

Field.prototype.getHeight = function() {
    return this.rows;
}

Field.prototype.getValue = function(x, y) {
    console.assert(x >= 0 && x < this.cols);
    console.assert(y >= 0 && y < this.rows);
    return this.elems[y][x];
}

Field.prototype.putElem = function(x, y, value) {
    console.assert(x >= 0 && x < this.cols);
    console.assert(y >= 0 && y < this.rows);

    this.elems[y][x] = value;
}

Field.prototype.update = function(dt) {
    if (this.food_elems < this.max_food_elems && Math.floor(Math.random() * 50) == 0) {
        for (var i = 0; i < 20; ++i) {
            var food_x = Math.floor((Math.random() * this.cols));
            var food_y = Math.floor((Math.random() * this.rows));
            if (this.elems[food_y][food_x] == 'none') {
                this.elems[food_y][food_x] = 'food';
                var ttl = Math.floor(Math.random() * 50) + 10;
                this.foods.push({'x': food_x, 'y':food_y, 'ttl': ttl});
                this.food_elems++;
                break;
            }
        }
    }

    var new_foods = [];
    for (var i in this.foods) {
        this.foods[i].ttl -= dt;
        if (this.foods[i].ttl > 0) {
            new_foods.push(this.foods[i]);
        } else {
            this.putElem(this.foods[i].x, this.foods[i].y, 'none');
            this.food_elems--;
        }
    }

    this.foods = new_foods;
}

Field.prototype.eatFood = function(x, y) {
    var result = 0;
    var new_foods = [];
    for (var i in this.foods) {
        if (this.foods[i].x == x && this.foods[i].y == y) {
            this.food_elems--;
            result = Math.floor(this.foods[i].ttl / 10) + 1;
        } else {
            new_foods.push(this.foods[i]);
        }
    }

    this.foods = new_foods;
    return result;
}

Field.prototype.getFoodStrength = function(x, y) {
    var result = 0;
    for (var i in this.foods) {
        if (this.foods[i].x == x && this.foods[i].y == y) {
            result = this.foods[i].ttl;
        }
    }

    return result;
}





//===================================
// Snake - moving sequence of squares
var Snake = function(field) {
    this.curlen = 2;
    this.feedlen = 2;
    this.field = field;
    this.cols = field.getWidth();
    this.rows = field.getHeight();

    do {
        var x = Math.floor((Math.random() * (this.cols - 1)));
        var y = Math.floor((Math.random() * this.rows));
        var x1 = x + 1;
    } while (field.getValue(x, y) != 'none' || field.getValue(x1, y) != 'none');

    this.points = [ {'x': x, 'y': y}, {'x': x1, 'y': y} ];
    this.head = 1;
    this.tail = 0;

    field.putElem(x, y, 'snake');
    field.putElem(x1, y, 'snake');

    this.dir = 'right';
    this.next_dir = 'right';
    this.pos = 0.0;
    this.speed = 5;
    this.alive = true;
}

Snake.prototype.getHead = function() {
    return this.points[this.head];
}

Snake.prototype.isAlive = function() {
    return this.alive;
}


Snake.prototype.update = function(dt) {
    if (!this.alive) {
        return;
    }

    this.pos += this.speed * dt;
    while (this.pos >= 1) {
        dir = {'x': 0, 'y': 0};
        switch (this.next_dir) {
        case 'right':
            dir.x = 1;
            this.dir = 'right';
            break;
        case 'left':
            dir.x = -1;
            this.dir = 'left';
            break;
        case 'down':
            dir.y = 1;
            this.dir = 'down';
            break;
        case 'up':
            dir.y = -1;
            this.dir = 'up';
            break;
        }

        var new_x = (this.points[this.head].x + dir.x) % this.cols;
        var new_y = (this.points[this.head].y + dir.y) % this.rows;
        if (new_x < 0) {
            new_x = this.cols + new_x;
        }
        if (new_y < 0) {
            new_y = this.rows + new_y;
        }

        var new_value = this.field.getValue(new_x, new_y);
        if (new_value == 'food') {
            var inc = this.field.eatFood(new_x, new_y);
            this.feedlen += inc;
        }

        this.points.push({ 'x' : new_x, 'y' : new_y});
        this.head++;

        var old_tail = this.points[this.tail];
        if (this.feedlen > this.curlen) {
            this.curlen++;
        } else {
            this.field.putElem(old_tail.x, old_tail.y, 'none');
            this.tail++;
        }

        if (new_value == 'stone' || new_value == 'snake') {
            this.alive = false;
            return;
        }

        this.field.putElem(new_x, new_y, 'snake');
        this.pos -= 1;
    }
}


Snake.prototype.turn = function(dirname) {
    if (dirname == this.dir) {
        this.next_dir = dirname;
        return;
    }

    if (dirname == 'left' && this.dir != 'right' || 
        dirname == 'right' && this.dir != 'left' ||
        dirname == 'up' && this.dir != 'down' ||
        dirname == 'down' && this.dir != 'up') {
        this.next_dir = dirname;
    }
}

Snake.prototype.getLength = function() {
    return this.head - this.tail + 1;
}

