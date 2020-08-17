//$('pre').innerText = '########################\n#@..............ac.GI.b#\n###d#e#f################\n###A#B#C################\n###g#h#i################\n########################';
//$('pre').innerText = '#################\n#i.G..c...e..H.p#\n########.########\n#j.A..b...f..D.o#\n########@########\n#k.E..a...g..B.n#\n########.########\n#l.F..d...h..C.m#\n#################';
var text = $('pre').innerText;
var grid = text.split('\n').map((a)=>a.split(''));
var starty = grid.findIndex((a)=>a.includes('@'));
var startx = grid[starty].findIndex((a)=>a=='@');
gridcopy = [];

// copy of grid for spread search
function initGrid() { 
	gridcopy = text.split('\n').map((a)=>a.split(''));
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
			if (y==starty&&x==startx) line += '@';
			else line += tile + '';
		}
		line += '\n';
	}
	console.log(line);
}

var spreadMatrix=[[0,-1],[0,1],[-1,0],[1,0]];
console.clear();
// get paths to all keys from current key
function traverse(startKey, key) {
	initGrid();
	let queue = [];
	let keys = [];
	queue.push([startKey.x, startKey.y]);
	gridcopy[startKey.y][startKey.x] = [startKey.x, startKey.y];
	while (queue.length>0) {
		let pos = queue.shift();
		for (let i=0; i<4; i++) {
			let dx = pos[0] + spreadMatrix[i][0];
			let dy = pos[1] + spreadMatrix[i][1];
			let pathTile = gridcopy[dy][dx];
			if (typeof(pathTile)=='object') continue;
			if (pathTile >= 'a' && pathTile <= 'z') {
				gridcopy[dy][dx] = [pos[0],pos[1]];
				keys.push(getKeyPath(startKey.x, startKey.y, dx, dy, pathTile));
				queue.push([dx,dy]);
			}
			if (pathTile == '.' || pathTile >= 'A' && pathTile <= 'Z' || pathTile == '@') {
				gridcopy[dy][dx] = [pos[0],pos[1]];
				queue.push([dx,dy]);
			}
		}
	}
	return keys;
}

// return from found key to starting point. Calculates steps, all doors and other keys on path
function getKeyPath(destx, desty, posx, posy, key) {
	let steps = 0;
	let x=posx;
	let y=posy;
	let doors = [];
	let keys = [];
	while (true) {1
		let pathTile = gridcopy[y][x];
		let tile = grid[y][x];
		if (x == destx && y == desty) {
			return {key:key.toUpperCase(), doors:doors, keys:keys, steps:steps};
		}
		steps++;
		if (tile >= 'A' && tile <= 'Z') {
			doors.push(tile);
		}
		if (tile >= 'a' && tile <= 'z' && tile != key) {
			keys.push(tile.toUpperCase());
		}
		x = pathTile[0];
		y = pathTile[1];
	}
}

// parse input, find all keys
var lines = text.split('\n');
var keyList=[];
for (let y=0; y<lines.length; y++) {
	for (let x=0; x<lines[y].length; x++) {
		let tile = lines[y][x];
		if (tile!='.' && tile !='#') {
			if (tile.toLowerCase()==tile) {
				let newkey = {};
				newkey.x=x;
				newkey.y=y;
				keyList[tile.toUpperCase()] = newkey;
			}
		}
	}
}

// for each key call traverse to find all possible paths
Object.keys(keyList).forEach((k)=> {
	//console.log(format('Paths from key {0}:', k));
	let key = keyList[k];
	key.keys = traverse(key, k);
	key.keys.forEach((a)=>{
		//console.log(format('{0}->{1}: steps: {2}, doors: {3}, keys: {4}', k, a.key, a.steps, a.doors.join(''), a.keys.join('')));
	});
	return;
});

var pathStates = [];
// check path against list of shortest paths for that state. If not found, add to the list
function checkPathState(path) {
	let copy = path.keys.join('').split('').sort().join('');
	let point = pathStates.find((a)=>a.curKey==path.curKey&&a.keys==copy);
	
	if (point != null) {
		if (point.steps <= path.steps) 
		    return false;
		else 
		    point.steps = path.steps;
		return true;
	} else  {
		point = {};
		point.steps = path.steps;
		point.curKey = path.curKey;
		point.keys = copy;
		pathStates.push(point); 
		return true;
	}
}

var minsteps = Number.MAX_SAFE_INTEGER; // fastest finished path for tree purging check
var pathPointer = 0; // index of currently processing branch
var paths = [{steps:0, curKey:'@', keys:['@']}]; // path tree. Initial position is at @
// iterate for all paths
while (pathPointer<paths.length) {
	let curPath = paths[pathPointer];
	let curKey = curPath.curKey;
	// available path options from current key
	let options = keyList[curKey].keys.filter((a)=>{
		if (a.key==curKey) return false; // not current key
		if (curPath.keys.includes(a.key)) return false; // not visited key
		// dont choose if unobtained key is on path
		for (let i=0; i<a.keys.length; i++) {
			if (!curPath.keys.includes(a.keys[i])) return false;
		}
		// must have visited keys for all doors on path
		for (let i=0; i<a.doors.length; i++) {
			if (!curPath.keys.includes(a.doors[i])) return false;
		}
		return true;
	}).sort((a,b)=>a.steps<b.steps?-1:1); // sort by nearest
	if (options.length > 0) {
		if (options.length > 1) { // several options: branching
			for (let i=1; i<options.length; i++) {
				let newpath = {steps:curPath.steps, keys:curPath.keys.join('').split('')}; //duplicate branch
				newpath.keys.push(options[i].key); // add new key path to new branch
				newpath.steps += options[i].steps;
				newpath.curKey = options[i].key;
				if (checkPathState(newpath)) 
					paths.push(newpath); // push only if state is optimal or new
			}
		}
		curPath.keys.push(options[0].key); // add new key path to current branch
		curPath.steps += options[0].steps;
		curPath.curKey = options[0].key;
		if (!checkPathState(curPath))
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
