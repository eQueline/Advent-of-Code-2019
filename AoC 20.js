//$('pre').innerText = '             Z L X W       C                 \n             Z P Q B       K                 \n  ###########.#.#.#.#######.###############  \n  #...#.......#.#.......#.#.......#.#.#...#  \n  ###.#.#.#.#.#.#.#.###.#.#.#######.#.#.###  \n  #.#...#.#.#...#.#.#...#...#...#.#.......#  \n  #.###.#######.###.###.#.###.###.#.#######  \n  #...#.......#.#...#...#.............#...#  \n  #.#########.#######.#.#######.#######.###  \n  #...#.#    F       R I       Z    #.#.#.#  \n  #.###.#    D       E C       H    #.#.#.#  \n  #.#...#                           #...#.#  \n  #.###.#                           #.###.#  \n  #.#....OA                       WB..#.#..ZH\n  #.###.#                           #.#.#.#  \nCJ......#                           #.....#  \n  #######                           #######  \n  #.#....CK                         #......IC\n  #.###.#                           #.###.#  \n  #.....#                           #...#.#  \n  ###.###                           #.#.#.#  \nXF....#.#                         RF..#.#.#  \n  #####.#                           #######  \n  #......CJ                       NM..#...#  \n  ###.#.#                           #.###.#  \nRE....#.#                           #......RF\n  ###.###        X   X       L      #.#.#.#  \n  #.....#        F   Q       P      #.#.#.#  \n  ###.###########.###.#######.#########.###  \n  #.....#...#.....#.......#...#.....#.#...#  \n  #####.#.###.#######.#######.###.###.#.#.#  \n  #.......#.......#.#.#.#.#...#...#...#.#.#  \n  #####.###.#####.#.#.#.#.###.###.#.###.###  \n  #.......#.....#.#...#...............#...#  \n  #############.#.#.###.###################  \n               A O F   N                     \n               A A D   M                     \n';
var text = $('pre').innerText.slice(0, -1);
var grid = text.split('\n');
//grid.push('    ');
for (let y=0; y<grid.length; y++) {
    grid[y] = grid[y].split('');
}
gridcopy = [];

var spreadMatrix=[[0,1],[0,-1],[1,0],[-1,0]];

// copy of grid for spread search
function initGrid() { 
	gridcopy = [];
	for (let i=0; i<grid.length; i++)
		gridcopy[i] = grid[i].join('').split('');
}

// normal traverse for 1st part
function traverse(start, end) {
	initGrid();
	let queue = [];
	let keys = [];
	queue.push([start[0],start[1]]);
	gridcopy[start[1]][start[0]] = [start[0], start[1]];
	while (queue.length>0) {
		let pos = queue.shift();
		for (let i=0; i<4; i++) {
			let dx = pos[0] + spreadMatrix[i][0];
			let dy = pos[1] + spreadMatrix[i][1];
			if (dy < 0 || dy > gridcopy.length-1 || dx < 0 || dx > gridcopy[dy].length-1) continue;
			let pathTile = gridcopy[dy][dx];
			if (typeof(pathTile)=='object') continue;
			
			if (pathTile >= 'A' && pathTile <= 'Z') {
				let secondLetter = gridcopy[dy+spreadMatrix[i][1]][dx+spreadMatrix[i][0]];
				let portalName;
				if (spreadMatrix[i][0]==1||spreadMatrix[i][1]==1)
					portalName = pathTile+secondLetter;
				else 
					portalName = secondLetter+pathTile;
				if (portalName == 'ZZ') 
					return getPath(start[0], start[1], pos[0], pos[1]);
				if (portalName == 'AA')
					continue;
				let gate = portals.find((a)=>a.name==portalName&&a.gate[0]!=dx&&a.gate[1]!=dy).gate;
				dx = gate[0];
				dy = gate[1];
				pathTile = gridcopy[dy][dx];
			}
			if (pathTile == '.') {
				gridcopy[dy][dx] = [pos[0],pos[1]];
				queue.push([dx,dy]);
			}
		}
	}
}

// DFS search for all possible paths
function findPaths(portal) {
	initGrid();
	let start = portal.gate;
	let name = portal.name;
	let queue = [];
	let paths = [];
	queue.push([start[0],start[1]]);
	gridcopy[start[1]][start[0]] = [start[0], start[1]];
	while (queue.length>0) {
		let pos = queue.shift();
		for (let i=0; i<4; i++) {
			let dx = pos[0] + spreadMatrix[i][0];
			let dy = pos[1] + spreadMatrix[i][1];
			if (dy < 0 || dy > gridcopy.length-1 || dx < 0 || dx > gridcopy[dy].length-1) continue;
			let pathTile = gridcopy[dy][dx];
			if (typeof(pathTile)=='object') continue;
			
			if (pathTile >= 'A' && pathTile <= 'Z') {
				let secondLetter = gridcopy[dy+spreadMatrix[i][1]][dx+spreadMatrix[i][0]];
				let gateName;
				if (spreadMatrix[i][0]==1||spreadMatrix[i][1]==1)
					gateName = pathTile+secondLetter;
				else 
					gateName = secondLetter+pathTile;
				if (gateName == name) continue;
				if (gateName == 'AA') continue; // cant go to AA
				let steps = getPath(start[0], start[1], pos[0], pos[1]);
				if (gateName != 'ZZ')
					steps++; // 1 step to teleport
				let level;
				if (dx < 6 || dx > grid[0].length-6 || dy < 6 || dy > grid.length-6)
					level = -1;
				else
					level = 1;
				paths.push({gate:gateName, steps:steps, level:level});
			}
			if (pathTile == '.') {
				gridcopy[dy][dx] = [pos[0],pos[1]];
				queue.push([dx,dy]);
			}
		}
	}
	return paths;
}

// Calculates steps while returning from current location to starting point
function getPath(destx, desty, posx, posy) {
	let steps = 0;
	let x=posx;
	let y=posy;
	while (true) {
		let pathTile = gridcopy[y][x];
		let tile = grid[y][x];
		if (x == destx && y == desty) {
			return steps;
		}
		steps++;
		x = pathTile[0];
		y = pathTile[1];
	}
}

var portals = [];
var pathList = [];
function createPortalGraph() {
	for (let y=1; y<grid.length-1; y++) {
		for (let x=1; x<grid[y].length-1; x++) {
			let tile = grid[y][x];
			if (tile.charCodeAt()>=65) {
				let portal = {}//portals.find((a)=>a.name.includes(tile));
				let cx,cy;
				portal.name = tile;
				spreadMatrix.forEach((a)=>{
					let sx = x + a[0];
					let sy = y + a[1];
					let nextTile = grid[sy][sx];
					if (nextTile.charCodeAt() >= 65) {
						if (a[0] == 1 || a[1] == 1)
							portal.name = tile + nextTile;
						else
							portal.name = nextTile + tile;
						cx = sx;
						cy = sy;
					}
					if (nextTile == '.') {
						portal.gate = [sx,sy];
					}
				});
				if (portal.gate==null) {
					spreadMatrix.forEach((a)=>{
						let sx = cx + a[0];
						let sy = cy + a[1];
						let nextTile = grid[sy][sx];
						if (nextTile == '.') {
							portal.gate = [sx,sy];
						}
						sx = cx - a[0];
						sy = cy - a[0];
					});
				}
				if (!portals.find((a)=>a.gate[0]==portal.gate[0]&&a.gate[1]==portal.gate[1])) {
					if (cx < 6 || cx > grid[0].length-6 || cy < 6 || cy > grid.length-6)
						portal.level = -1;
					else
						portal.level = 1;
					if (portal.name=='AA') 
						portal.level = 0;
					portals.push(portal);
				}
			}
		}
	}
	portals.sort((a,b)=>a.name>b.name?1:-1);
	
	// for each portal call findPaths to find all possible paths
	portals.forEach((a)=> {
		a.paths = findPaths(a);
		return;
	});
}
createPortalGraph();

function strHash(str) {
  let hash = 5381
  let i = str.length;
  while(i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return 'h' + (hash >>> 0);
}

// check path against list of shortest paths for that state. If not found, add to the list
function checkPathState(pathStates, path) {
	let hash = path.gate + ' ' +  path.level + ' ' + path.gateLevel;
	if (pathStates[hash] == null || pathStates[hash] > path.steps) {
		pathStates[hash] = path.steps;
		return true;
	} else
		return false;
}

function findSolution() {
	let pathStates = [];
	let minsteps = Number.MAX_SAFE_INTEGER; // fastest finished path for tree purging check
	let pathPointer = 0; // index of currently processing branch
	let paths = [{steps:0, level:0, gate:'AA', gateLevel:0, path:['AA 0']}]; // path tree
	// Initial position is at AA0. curGate and curLevel pair determines what gate we are at
	
	// iterate for all paths
	while (pathPointer<paths.length) {
		let path = paths[pathPointer];
		let curPath = path.path;
		let curGate = path.gate;
		let curLevel = path.level;
		let curGateLevel = path.gateLevel;
		if (curGate == 'ZZ' && curLevel == -1) {
			// check for shortest
			if (path.steps < minsteps) {
				minsteps = path.steps;
			}
			break;
		}
		// available path options from current gate
		let options = [];
		options = portals.find((a)=>a.name==curGate&&a.level==curGateLevel);
		if (options == null) {
			// no possible paths => remove
			paths.splice(pathPointer, 1);
		} else {
			options = options.paths.filter((a)=>{
				if (curLevel == 0 && a.level == -1 && a.gate != 'ZZ') return false; // cant go to outer gates in outermost level (except ZZ)
				if (curPath.includes(a.gate + ' ' + (curLevel + a.level))) return false; // if we already visited that gate on that level, dont pick
				return true;
			});
			if (options.length > 0) {
				if (options.length > 1) {
					options.sort((a,b)=>a.steps<b.steps?-1:1);
					for (let i=1; i<options.length; i++) {
						let newpath = {
							steps: path.steps + options[i].steps, 
							level: curLevel + options[i].level, 
							gate: options[i].gate,
							gateLevel: -options[i].level,
							path: curPath.concat(options[i].gate + ' ' + (curLevel + options[i].level))
						}; //duplicate branch and add new path to it
						
						if (checkPathState(pathStates, newpath)) 
							paths.push(newpath); // push only if state is optimal or new
					}
				}
				// add new path to current branch
				path.steps += options[0].steps;
				path.level += options[0].level;
				path.gate = options[0].gate;
				path.gateLevel = -options[0].level;
				path.path.push(options[0].gate + ' ' + (curLevel + options[0].level));
				
				if (!checkPathState(pathStates, path))
					paths.splice(pathPointer, 1); // if state is not optimal, remove it
			} else {
				// no possible paths => remove
				paths.splice(pathPointer, 1);
			}
		}

		// select path with fewest steps from the tree
		pathPointer = paths.reduce((a,b,i)=>(paths[a].steps>b.steps)?i:a, 0);
	}
	console.log(minsteps);
}

// 20.1
console.log(traverse(portals[0].gate, portals[portals.length-1].gate));
// 20.2
createPortalGraph();
findSolution();