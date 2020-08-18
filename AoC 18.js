//$('pre').innerText = '########################\n#@..............ac.GI.b#\n###d#e#f################\n###A#B#C################\n###g#h#i################\n########################';
//$('pre').innerText = '#################\n#i.G..c...e..H.p#\n########.########\n#j.A..b...f..D.o#\n########@########\n#k.E..a...g..B.n#\n########.########\n#l.F..d...h..C.m#\n#################';
var text = $('pre').innerText;

// copy of grid for spread search
function initGrid(n) { 
	gridcopy = [];
	for (let i=0; i<grids[n].length; i++)
		gridcopy[i] = grids[n][i].join('').split('');
}

// output formatting
function format() {
	var args = arguments;
	if (args.length <= 1) { 
		return args;
	}
	var result = args[0];
	for (var i = 1; i < args.length; i++) {
		result = result.replace(new RegExp("\\{" + (i - 1) + "\\}", "g"), args[i]);
	}
	return result;
}

// draw maze to output
function draw() {
	//console.clear();
	let line = '\n';
	for (let y=0; y<gridcopy.length; y++) {
		for (let x=0; x<gridcopy[y].length; x++) {
			let tile = gridcopy[y][x];
			line += tile + '';
		}
		line += '\n';
	}
	console.log(line);
}

var spreadMatrix=[[0,-1],[0,1],[-1,0],[1,0]];
console.clear();
// get paths to all keys from current key
function traverse(startKey, key, n) {
	initGrid(n);
	let queue = [];
	let keys = [];
	queue.push([startKey.x, startKey.y]);
	gridcopy[startKey.y][startKey.x] = [startKey.x, startKey.y];
	while (queue.length>0) {
		let pos = queue.shift();
		for (let i=0; i<4; i++) {
			let dx = pos[0] + spreadMatrix[i][0];
			let dy = pos[1] + spreadMatrix[i][1];
			if (dy<0||dy>gridcopy.length-1||dx<0||dx>gridcopy[dy].length-1) continue;
			let pathTile = gridcopy[dy][dx];
			if (typeof(pathTile)=='object') continue;
			if (pathTile >= 'a' && pathTile <= 'z' || pathTile == '@') {
				gridcopy[dy][dx] = [pos[0],pos[1]];
				keys.push(getKeyPath(startKey.x, startKey.y, dx, dy, pathTile, n));
				queue.push([dx,dy]);
			}
			if (pathTile == '.' || pathTile >= 'A' && pathTile <= 'Z') {
				gridcopy[dy][dx] = [pos[0],pos[1]];
				queue.push([dx,dy]);
			}
		}
	}
	return keys;
}

// return from found key to starting point. Calculates steps, all doors and other keys on path
function getKeyPath(destx, desty, posx, posy, key, n) {
	let curGrid = grids[n];
	let steps = 0;
	let x=posx;
	let y=posy;
	let doors = [];
	let keys = [];
	while (true) {
		let pathTile = gridcopy[y][x];
		let tile = curGrid[y][x];
		if (x == destx && y == desty) {
			return {key:key.toUpperCase(), doors:doors, keys:keys, steps:steps};
		}
		steps++;
		if (tile >= 'A' && tile <= 'Z') {
			doors.push(tile);
		}
		if ((tile >= 'a' && tile <= 'z'  || tile =='@') && tile != key) {
			keys.push(tile.toUpperCase());
		}
		x = pathTile[0];
		y = pathTile[1];
	}
}

function createKeyGraph(n) {
	// parse input, find all keys
	var lines = grids[n].map((a)=>a.join(''));
	keyList[n] = [];
	for (let y=0; y<lines.length; y++) {
		for (let x=0; x<lines[y].length; x++) {
			let tile = lines[y][x];
			if (tile!='.' && tile !='#') {
				if (tile.toLowerCase()==tile) {
					let newkey = {};
					newkey.x=x;
					newkey.y=y;
					keyList[n][tile.toUpperCase()] = newkey;
				}
			}
		}
	}
	
	// for each key call traverse to find all possible paths
	Object.keys(keyList[n]).forEach((k)=> {
		//console.log(format('Paths from key {0}:', k));
		let key = keyList[n][k];
		key.keys = traverse(key, k, n);
		/*key.keys.forEach((a)=>{
			console.log(format('{0}->{1}: steps: {2}, doors: {3}, keys: {4}', k, a.key, a.steps, a.doors.join(''), a.keys.join('')));
		});*/
		return;
	});
}

// check path against list of shortest paths for that state. If not found, add to the list
function checkPathState(pathStates, path) {
	let hash = path.keys.split('').sort().join('') + '.' + path.curKey;
	if (pathStates[hash] == null || pathStates[hash] > path.steps) {
		pathStates[hash] = path.steps;
		return true;
	} else
		return false;
}

function findSolution(n) {
	let pathStates = [];
	let minsteps = Number.MAX_SAFE_INTEGER; // fastest finished path for tree purging check
	let pathPointer = 0; // index of currently processing branch
	let paths = [{steps:0, curKey:'@'.repeat(n), keys:'@'}]; // path tree. Initial position is at @
	// iterate for all paths
	while (pathPointer<paths.length) {
		let curPath = paths[pathPointer];
		let curKey = curPath.curKey;
		// available path options from current key
		let options = [];
		for (let i=0; i<curKey.length; i++) {
			let curMazeKey = curKey[i];
			keyList[i][curMazeKey].keys.forEach((a)=>{
				if (a.key==curMazeKey) return; // not current key
				if (curPath.keys.includes(a.key)) return; // not visited key
				// dont choose if unobtained key is on path
				for (let i=0; i<a.keys.length; i++) {
					if (!curPath.keys.includes(a.keys[i])) return;
				}
				// must have visited keys for all doors on path
				for (let i=0; i<a.doors.length; i++) {
					if (!curPath.keys.includes(a.doors[i])) return;
				}
				options.push({maze:i, key:a});
			});
		}
		options.sort((a,b)=>a.key.steps<b.key.steps?-1:1);
		if (options.length > 0) {
			if (options.length > 1) {
				for (let i=1; i<options.length; i++) {
					let newpath = {steps: curPath.steps, curKey: curKey, keys: curPath.keys}; //duplicate branch
					newpath.keys += options[i].key.key; // add new key path to new branch
					newpath.steps += options[i].key.steps;
					let maze = options[i].maze;
					newpath.curKey = newpath.curKey.substring(0, maze) + options[i].key.key + newpath.curKey.substring(maze + 1);
					if (checkPathState(pathStates, newpath)) 
						paths.push(newpath); // push only if state is optimal or new
				}
			}
			curPath.keys += options[0].key.key; // add new key path to current branch
			curPath.steps += options[0].key.steps;
			let maze = options[0].maze;
			curPath.curKey = curPath.curKey.substring(0, maze) + options[0].key.key + curPath.curKey.substring(maze + 1);
			if (!checkPathState(pathStates, curPath))
				paths.splice(pathPointer, 1); // if state is not optimal, remove it
		} else {
			// no possible paths => remove
			paths.splice(pathPointer, 1);
			// check for shortest
			if (curPath.steps < minsteps) {
				minsteps = curPath.steps;
			}
		}
		// select path with fewest steps from the tree
		pathPointer = paths.reduce((a,b,i)=>(paths[a].steps>b.steps)?i:a, 0);
	}
	console.log(minsteps);
}


// 18.1
var grid = text.split('\n').map((a)=>a.split(''));
var gridcopy = [];
var grids = [grid];
var keyList = [];
createKeyGraph(0);
findSolution(1);

// 18.2
// change the maze
var starty = grid.findIndex((a)=>a.includes('@'));
var startx = grid[starty].findIndex((a)=>a=='@');
var part2 = [['@','#','@'],['#','#','#'],['@','#','@']];
for (let y=0; y<3; y++) {
	for (let x=0; x<3; x++) {
		grid[y+starty-1][x+startx-1] = part2[y][x];
	}
}
// create a grid for each quadrant
grids = [[],[],[],[]];
for (let i=0; i<Math.ceil(grid.length/2); i++) {
	grids[0][i] = grid[i].slice(0,Math.ceil(grid.length/2));
	grids[1][i] = grid[i].slice(Math.ceil(grid.length/2)-1);
	grids[2][i] = grid[i+Math.ceil(grid.length/2)-1].slice(0,Math.ceil(grid.length/2));
	grids[3][i] = grid[i+Math.ceil(grid.length/2)-1].slice(Math.ceil(grid.length/2)-1);
}
// get keys graph for each quadrant
for (let i=0; i<4; i++) {
	createKeyGraph(i);
}
findSolution(4);
