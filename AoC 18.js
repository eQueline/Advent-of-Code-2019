$('pre').innerText = '########################\n#f.D.E.e.C.b.A.@.a.B.c.#\n######################.#\n#d.....................#\n########################';
var text = $('pre').innerText;
var grid = text.split('\n').map((a)=>a.split(''));
var posy = grid.findIndex((a)=>a.includes('@'));
var posx = grid[posy].findIndex((a)=>a=='@');
grid[posy][posx] = '.';

function initGrid() {
	gridcopy = [];
	for (let y=0; y<grid.length; y++) {
		let row = [];
		for (let x=0; x<grid[y].length; x++) {
			row[x] = grid[y][x];
		}
		gridcopy.push(row);
	}
}

function draw() {
	console.clear();
	for (let y=0; y<gridcopy.length; y++) {
		let line = '\n';
		for (let x=0; x<gridcopy[y].length; x++) {
			let tile = gridcopy[y][x];
			if (y==posy&&x==posx) line += '@ ';
			else line += tile + ' ';
		}
		console.log(line);
	}
}

var spreadMatrix=[[0,1],[0,-1],[1,0],[-1,0]];
var doors = [];
var key = [];
function traverse(noclip, interact, target) {
	let queue = [];
	let targetLocation = null;
	let steps = 0;
	queue.push({x: posx, y:posy});
	while (queue.length > 0) {
		draw();
		let newTiles = [];
		while(queue.length > 0) {
			let pos = queue.pop();
			steps++;
			spreadMatrix.forEach((b)=>{
				let x=pos.x+b[0];
				let y=pos.y+b[1];
				//console.log(px + ' ' + py);
				try {
					var tile = gridcopy[y][x];
				} catch(err) {
					return;
				}
				
				switch (tile) {
					case 'O': break;
					case '.': 
						gridcopy[y][x] = 'O';
						newTiles.push({x: x, y: y});
						break;
					case '#':
						break;
					default:
						let chr = tile.toUpperCase();
						if (tile == chr) {
							if (!Object.keys(doors).includes(chr)) doors[chr] = {x:x, y:y, steps:steps};
							if (key[chr] != null && key[chr].have) {
								gridcopy[y][x] = 'O';
							    newTiles.push({x: x, y: y});
								if (interact) {
									delete doors[chr];
								}
							}
						} else {
							if (!Object.keys(key).includes(chr)) key[chr] = {x:x, y:y, steps:steps};
							gridcopy[y][x] = 'O';
							    newTiles.push({x: x, y: y});
							if (interact)
								key[chr].have = true;
						}
						if (noclip) {
							gridcopy[y][x] = 'O';
							newTiles.push({x: x, y: y});
						} else {
							if (tile != chr || key[chr] != null && key[chr].have) {
								gridcopy[y][x] = 'O';
								newTiles.push({x: x, y: y});
							}
						}
						break;
				}
				if (target != null && tile==target) {
					targetLocation = {target:tile, x:x, y:y, steps:steps};
					return;
				}
			});
			if (targetLocation != null) return targetLocation;
		}
		queue = queue.concat(newTiles);
		//await new Promise(resolve => { setTimeout(resolve, 66); });
	}
}

var pathPointer = 0;
var paths = [{steps:0,path:[]}];
while (pathPointer<paths.length) {
	curpath = paths[pathPointer];
	
	initGrid(); // explore options
	traverse(false, false);
	
	let options = Object.keys(key).filter((a)=>!key[a].have).map((a)=>a.toLowerCase()); // keys to collect
	
	if (options.length > 1) { // several options: branch
		for (let i=1; i<options.length; i++) {
			let newpath = {steps:curpath.steps, path:[]};
			for (let k=0; k<curpath.path.length; k++) {
				newpath.path.push(curpath.path[k]);
			}
			newpath.path.push(options[i]);
			paths.push(newpath);
		}
		curpath.path.push(options[0]);
	} else if (options.length == 1) {
		curpath.path.push(options[0]);
	} else if (options.length == 0) {
		console.log('NO WAY'); pathPointer++; continue;
	}

	let nextTarget = curpath.path[curpath.path.length-1];	
	initGrid();
	let move = traverse(false, true, nextTarget);
	curpath.steps += move.steps;
	posx = move.x;
	posy = move.y;
	draw();
	//await new Promise(resolve => { setTimeout(resolve, 200); });
} 