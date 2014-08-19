var canvas = document.getElementById('fuTris');
var context = canvas.getContext('2d');
canvas.width = 200;
canvas.height = 320;

var field = [];
var background = [];

var speed = 100;
var pos = {left: 4, top: 0};
var angle = 0;
var shapes = [
    // J
    [[[0,1], [0,1], [1,1]],
    [[1,0,0], [1,1,1]],
    [[1,1], [1,0], [1,0]],
    [[1,1,1], [0,0,1]]],
    
    // []
    [[[2,2], [2,2]]],
    
    // T
    [[[3,3,3], [0,3,0]],
    [[0,3], [3,3], [0,3]],
    [[0,3,0], [3,3,3]],
    [[3,0], [3,3], [3,0]]],
   
    // L
    [[[4,4], [0,4], [0,4]],
    [[0,0,4], [4,4,4]],
    [[4,0], [4,0], [4,4]],
    [[4,4,4], [4,0,0]]],
    
    // 5
    [[[0,5,5], [5,5,0]],
    [[5,0], [5,5], [0,5]]],
   
    // Z
    [[[6,6,0], [0,6,6]],
    [[0,6], [6,6], [6,0]]],

    // ----
    [[[7,7,7,7]], [[7], [7], [7], [7]]]
];
var current_shape_type = 0;
var current_shape = shapes[current_shape_type];
function shape(_angle) {
    switch (current_shape.length) {
        case 1: return current_shape[0];
        case 2: return current_shape[_angle%2];
        case 4: return current_shape[_angle];
    }
}

colors = ['f5b905', 'a67d00', 'bf4904', '803a10', '000'];
function draw_brick(x, y, number) {
    var i = number-1;
    var color_offset = i > 1 ? 2 : 0;
    rect(x*20+1, y*20+1, 18, 18, colors[color_offset+1]);
    rect(x*20+2, y*20+2, 16, 16, colors[color_offset]);
    
    // J, L, Z
    if ([0, 3, 5].indexOf(i) != -1) {
        rect(x*20+5, y*20+5, 10, 10, colors[{0: 2, 3: 0, 5: 4}[i]]);
        rect(x*20+8, y*20+8, 4, 4, colors[{0: 0, 3: 2, 5: 0}[i]]);
    }
    
    // []
    if (i == 1) rect(x*20+5, y*20+5, 10, 10, colors[4]);
    
    // 5
    if (i ==4) rect(x*20+8, y*20+8, 4, 4, colors[4]);
    
    // T
    if (i == 2) {
        rect(x*20+5, y*20+5, 8, 8, colors[0]);
        rect(x*20+7, y*20+7, 8, 8, colors[4]);
        rect(x*20+7, y*20+7, 6, 6, colors[2]);
    }
    
    // ----
    if (i == 6) {
        rect(x*20+5, y*20+6, 3, 3, colors[0]);
        rect(x*20+5, y*20+12, 3, 3, colors[0]);
        rect(x*20+11, y*20+4, 3, 3, colors[0]);
        rect(x*20+13, y*20+12, 3, 3, colors[0]);
    }
}

function rect(x, y, w, h, color) {
    context.fillStyle = '#'+color;
    context.fillRect(x, y, w, h);
}
function noice(offset, level) {
    return offset+~~(Math.random()*level);
}

function freeze() {
    for (var x=0; x<shape(angle)[0].length; x++)
        for (var y=0; y<shape(angle).length; y++)
            if (shape(angle)[y][x] !== 0)
                field[pos.left+x][pos.top+y] = shape(angle)[y][x];
}

function clear_full_lines() {
    for (var y=1; y<16; y++) {
        var clear_line = true;
        for (x=0; x<10; x++)
            if (field[x][y] === 0) clear_line = false;
        if (clear_line) {
            for (var yy=y; yy>0; yy--)
                for (var xx=0; xx<10; xx++)
                    field[xx][yy] = field[xx][yy-1];
            for (var xx=0; xx<10; xx++)
                field[xx][0] = 0;
        }
    }
}

function next_shape() {
    pos.left = 4;
    pos.top = 0;
    current_shape_type = Math.ceil(Math.random()*shapes.length-1);
    current_shape = shapes[current_shape_type];
}

function will_collide(_angle, _pos) {
    for (var x=0; x<shape(_angle)[0].length; x++)
        for (var y=0; y<shape(_angle).length; y++)
            if (pos.top+shape(_angle).length >= 16 ||
                shape(_angle)[y][x] !== 0 &&
                field[_pos.left+x][_pos.top+y+1] !== 0)
                return true;
}

addEventListener('keydown', function(event) {
    if (event.keyCode == 37 &&
        pos.left > 0 &&
        !will_collide(angle, {left: pos.left-1, top: pos.top}))
        pos.left--;
    if (event.keyCode == 39 &&
        pos.left < 10-shape(angle)[0].length &&
        !will_collide(angle, {left: pos.left+1, top: pos.top}))
        pos.left++;
    if (event.keyCode == 38) {
        var new_angle = angle === 0 ? 3 : angle-1;
        if (pos.left+shape(new_angle)[0].length <= 10 &&
            !will_collide(new_angle, pos))
            angle = new_angle;
    }
    if (event.keyCode == 40) {
        while(!will_collide(angle, {left: pos.left, top: pos.top+1}))
            pos.top++;
        pos.top++;
        freeze();
        clear_full_lines();
        next_shape();
    }
});

function init() {
    speed = 100;
    for (var x=0; x<10; x++) {
        field[x] = [];
        background[x] = [];
        for (var y=0; y<16; y++) {
            var mod = noice(10, 10);
            background[x][y] = '' + mod + mod + mod;
            field[x][y] = 0;
        }
    }
    next_shape();
}

var subframe = 0;
var moved_steps = 0;

function loop() {
    // Move the next step
    subframe++;
    if (subframe-speed > 0.0) {
        subframe = 0;
        if (speed > 20.0) speed -= 0.5;
        
        // Check if we get blocked by the already dropped shapes
        +function() {
            if (will_collide(angle, pos)) {
                freeze();
                clear_full_lines();
                next_shape();
                
                // Restart the game?
                if (moved_steps === 0 || will_collide(0, {left: 4, top: 0}))
                    init();
                moved_steps = 0;
                return true;
            }
        }() || (pos.top++ && moved_steps++);
    }
    
    // background
    for (var x=0; x<10; x++)
        for (var y=0; y<16; y++) {
            rect(x*20, y*20, 20, 20, background[x][y]);
            if (field[x][y] !== 0) draw_brick(x, y, field[x][y]);
        }

    // shape
    for (var x=0; x<shape(angle)[0].length; x++)
        for (var y=0; y<shape(angle).length; y++)
            if (shape(angle)[y][x] !== 0)
                draw_brick(x+pos.left, y+pos.top, current_shape_type+1);
    
    setTimeout(loop, 5);
}

init();
loop();
