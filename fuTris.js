var canvas = document.getElementById('fuTris');
var context = canvas.getContext('2d');
canvas.width = 10*20*2+10+(5*20);
canvas.height = 16*20*2;

var field = [];
var background = [];

var game_running = true;
var speed = 100;
var points = 0;
var level = 0;
var stones = 0;
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
var colors = ['c1e184', '4f6c19', '699021', '8fc32e', '1a2308'];
var assets = {
    rotate: document.getElementById('rotate-sound'),
    drop: document.getElementById('drop-sound'),
    move: document.getElementById('move-sound'),
    point: document.getElementById('point-sound')
};
var audio_chanels = [];

var current_shape_type = 0;
var next_shape_type = Math.ceil(Math.random()*shapes.length-1);
var current_shape = shapes[current_shape_type];

function shape(type, angle) {
    var s = shapes[type];
    switch (s.length) {
        case 1: return s[0];
        case 2: return s[angle%2];
        case 4: return s[angle];
    }
}

function rect(x, y, w, h, scale, color) {
    context.fillStyle = '#'+color;
    context.fillRect(x*scale, y*scale, w*scale, h*scale);
}

function draw_shape(x, y, scale, type, angle) {
    for (var xi=0; xi<shape(type, angle)[0].length; xi++)
        for (var yi=0; yi<shape(type, angle).length; yi++)
            if (shape(type, angle)[yi][xi] !== 0)
                draw_brick(x+xi, y+yi, scale, type);
}

function draw_text(text, size, x, y) {
    context.fillStyle = '#fff';
    context.font = size+'px Verdana, DejaVu Sans';
    context.fillText(text, x, y);
}

function draw_brick(x, y, scale, i) {
    var color_offset = i > 1 ? 2 : 0;
    rect(x*20+1, y*20+1, 18, 18, scale, colors[color_offset+1]);
    rect(x*20+2, y*20+2, 16, 16, scale, colors[color_offset]);
    
    // J, L, Z
    if ([0, 3, 5].indexOf(i) != -1) {
        rect(x*20+5, y*20+5, 10, 10, scale, colors[{0: 2, 3: 0, 5: 4}[i]]);
        rect(x*20+8, y*20+8, 4, 4, scale, colors[{0: 0, 3: 2, 5: 0}[i]]);
    }
    
    // []
    if (i == 1) rect(x*20+5, y*20+5, 10, 10, scale, colors[4]);
    
    // 5
    if (i ==4) rect(x*20+8, y*20+8, 4, 4, scale, colors[4]);
    
    // T
    if (i == 2) {
        rect(x*20+5, y*20+5, 8, 8, scale, colors[0]);
        rect(x*20+7, y*20+7, 8, 8, scale, colors[4]);
        rect(x*20+7, y*20+7, 6, 6, scale, colors[2]);
    }
    
    // ----
    if (i == 6) {
        rect(x*20+5, y*20+6, 3, 3, scale, colors[0]);
        rect(x*20+5, y*20+12, 3, 3, scale, colors[0]);
        rect(x*20+11, y*20+4, 3, 3, scale, colors[0]);
        rect(x*20+13, y*20+12, 3, 3, scale, colors[0]);
    }
}

function draw() {
    // game background
    rect(0, 0, canvas.width, canvas.height, 1, '000');
    
    // game field background
    for (var x=0; x<10; x++)
        for (var y=0; y<16; y++) {
            rect(x*20, y*20, 20, 20, 2, background[x][y]);
            if (field[x][y] !== 0) draw_brick(x, y, 2, field[x][y]-1);
        }

    // Current shape
    draw_shape(pos.left, pos.top, 2, current_shape_type, angle);
    
    // Next shape
    draw_shape(21, 1, 1, next_shape_type, 0);

    // Score
    draw_text(points, 30, 420, 130);
    draw_text('Points', 13, 420, 150);
    
    // Level
    draw_text(level, 30, 420, 230);
    draw_text('Level', 13, 420, 250);
}

function noice(offset, level) {
    return offset+~~(Math.random()*level);
}

function freeze() {
    for (var x=0; x<shape(current_shape_type, angle)[0].length; x++)
        for (var y=0; y<shape(current_shape_type, angle).length; y++)
            if (shape(current_shape_type, angle)[y][x] !== 0)
                field[pos.left+x][pos.top+y] = shape(current_shape_type, angle)[y][x];
}

function clear_full_lines() {
    var number_of_lines = 0;

    for (var y=1; y<16; y++) {
        var clear_line = true;
        for (x=0; x<10; x++)
            if (field[x][y] === 0) clear_line = false;
        if (clear_line) {
	    number_of_lines++;
            for (var yy=y; yy>0; yy--)
                for (var xx=0; xx<10; xx++)
                    field[xx][yy] = field[xx][yy-1];
            for (var xx=0; xx<10; xx++)
                field[xx][0] = 0;
        }
    }
    
    if (number_of_lines == 1) points += 10;
    if (number_of_lines == 2) points += 25;
    if (number_of_lines == 3) points += 50;
    if (number_of_lines == 4) points += 100;
    
    if (number_of_lines > 0) play_sound('point');
}

function play_sound(name) {
    // Search for a free audio channel to play the sound
    for (var a=0; a<audio_chanels.length; a++) {
	now = new Date();
	if (audio_chanels[a].finished < now.getTime()) {
	    audio_chanels[a].finished = now.getTime() + assets[name].duration * 1000;
	    audio_chanels[a].channel.src = assets[name].src;
	    audio_chanels[a].channel.play();
	    audio_chanels[a].channel.volume = 0.1;
	}
    }
}

function next_shape() {
    stones++;
    if (stones > 20) {
	level++;
	stones = 0;
    }

    pos.left = 4;
    pos.top = 0;
    current_shape_type = next_shape_type;
    next_shape_type = Math.ceil(Math.random()*shapes.length-1);
    current_shape = shapes[current_shape_type];
}

function will_collide(_angle, _pos) {
    for (var x=0; x<shape(current_shape_type, _angle)[0].length; x++)
        for (var y=0; y<shape(current_shape_type, _angle).length; y++)
            if (pos.top+shape(current_shape_type, _angle).length >= 16 ||
                shape(current_shape_type, _angle)[y][x] !== 0 &&
                field[_pos.left+x][_pos.top+y+1] !== 0)
                return true;
}

addEventListener('keydown', function(event) {
    if (game_running) {
	// Move left
	if ((event.keyCode == 37 || event.keyCode == 72) &&
	    pos.left > 0 &&
	    !will_collide(angle, {left: pos.left-1, top: pos.top})) {
	    pos.left--;
	    play_sound('move');
	    draw();
	}

	// Move right
	if ((event.keyCode == 39 || event.keyCode == 76) &&
	    pos.left < 10-shape(current_shape_type, angle)[0].length &&
	    !will_collide(angle, {left: pos.left+1, top: pos.top})) {
	    pos.left++;
	    play_sound('move');
	    draw();
	}

	// Rotate
	if (event.keyCode == 38 || event.keyCode == 75) {
	    var new_angle = angle === 0 ? 3 : angle-1;
	    if (pos.left+shape(current_shape_type, new_angle)[0].length <= 10 &&
		!will_collide(new_angle, pos))
		angle = new_angle;
	    play_sound('rotate');
	    draw();
	}

	// Drop
	if (event.keyCode == 40 || event.keyCode == 74) {
	    while(!will_collide(angle, {left: pos.left, top: pos.top+1}))
		pos.top++;
	    pos.top++;
	    points += 2;
	    freeze();
	    clear_full_lines();
	    next_shape();
	    play_sound('drop');
	    draw();
	}
    }
    
    // Pause the game
    if (event.keyCode == 13 || event.keyCode == 80) {
	game_running = !game_running;
	if (game_running) loop();
    }
    
    // TODO: Back to the main menu
    if (event.keyCode == 27 || event.keyCode == 121)
	console.log('Implement me.');
});

function init() {
    speed = 100;
    points = 0;
    level = 0;
    stones = 0;

    // Load the assets
    assets.rotate.load();
    assets.drop.load();
    assets.move.load();
    assets.point.load();
    
    // Init the audio chanels
    for (var a=0; a<10; a++) {
	audio_chanels[a] = {
	    channel: new Audio(),
	    finished: -1
	};
    }

    // Initialize the game field and the background
    for (var x=0; x<10; x++) {
        field[x] = [];
        background[x] = [];
        for (var y=0; y<16; y++) {
            var mod = noice(15, 15);
            background[x][y] = '' + mod + mod + mod;
            field[x][y] = 0;
        }
    }

    // Start the game
    next_shape();
}

var subframe = 0;
var moved_steps = 0;

function loop() {
    // Move the next step
    subframe++;
    if (subframe-speed > 0.0) {
        subframe = 0;
	speed = 100-(level*15);
        
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
	    return false;
        }() || (pos.top++ && moved_steps++);
	draw();
    } 
    
    if (game_running) setTimeout(loop, 5);
}

init();
loop();
