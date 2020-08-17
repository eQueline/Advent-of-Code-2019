//$('pre').innerText = '....#\n#..#.\n#..##\n..#..\n#....\n';
var text = $('pre').innerText.slice(0, -1);
text = text.split('\n');
var zeroGrid = [];
var positiveGrid = [];
var negativeGrid = [];
text.forEach((a)=>zeroGrid.push(a.split('')));
var spreadMatrix=[[0,1],[0,-1],[1,0],[-1,0]];

function draw() {
	console.clear();
	let line = '';
	zeroGrid.forEach((a)=>line+=a.join(' ')+'\n');
	console.log(line);
}
function drawLevels() {
	console.clear();
	let line = '';
	for (let i=negativeGrid.length-1; i>=0; i--) {
		negativeGrid[i].forEach((a)=>line+='\n' + a.join(' '));
		line += ' Level -' + (i+1) + '\n';
	}
	zeroGrid.forEach((a)=>line+='\n' + a.join(' '));
	line += ' Level 0\n';
	for (let i=0; i<=positiveGrid.length-1; i++) {
		positiveGrid[i].forEach((a)=>line+='\n' + a.join(' '));
		line += ' Level ' + (i+1) + '\n';
	}
	console.log(line);
}

function copyGridState(bugs) {
	if (bugs==null) return null;
	let copy = [];
	for (let i=0; i<5; i++) {
		copy[i] = bugs[i].join('').split('');
	}
	return copy;
}
function getGrid(level, copy) {
	if (level==0)
		return copy?copyGridState(zeroGrid):zeroGrid;
	if (level<0)
		return copy?copyGridState(negativeGrid[-level-1]):negativeGrid[-level-1];
	else
		return copy?copyGridState(positiveGrid[level-1]):positiveGrid[level-1];
}

function calcRating() {
	let rating = 0;
	zeroGrid.flat().forEach((a,b)=>rating+=a=='#'?2**b:0);
	return rating;
}

async function cycle(grid) {
	let state = getGrid(0, true);
	for (let y=0; y<5; y++) {
		for (let x=0; x<5; x++) {
			let tile = state[y][x];
			let bugsAround = 0;
			for (let i=0; i<4; i++) {
				let dx = x + spreadMatrix[i][0];
				let dy = y + spreadMatrix[i][1];
				if (dx<0||dx>4||dy<0||dy>4) continue;
				let adjTile = state[dy][dx];
				bugsAround += adjTile=='#';
			}
			if (tile == '.' && (bugsAround==1 || bugsAround==2))
				getGrid(0,false)[y][x] = '#';
			if (tile == '#' && (bugsAround!=1))
				getGrid(0,false)[y][x] = '.';
		}
	}
	//draw();
	//await new Promise(resolve => { setTimeout(resolve, 66); });
}

// 24.1
var ratingHistory = [];
while (true) {
	let rating = calcRating();
	if (ratingHistory.includes(rating)) {
		ratingHistory.push(rating);
		break;
	}
	ratingHistory.push(rating);
	await cycle(zeroGrid);
}
console.log(calcRating());

// 24.2
zeroGrid = [];
text.forEach((a)=>zeroGrid.push(a.split('')));

function createGrid() {
	let newGrid = [];
	for (let i=0; i<5; i++)
		newGrid.push('.....'.split(''));
	return newGrid;
}
function addGrids() {
	if (positiveGrid.length==0 || positiveGrid[positiveGrid.length-1].flat().join('').includes('#'))
		positiveGrid.push(createGrid());
	if (negativeGrid.length==0 || negativeGrid[negativeGrid.length-1].flat().join('').includes('#'))
		negativeGrid.push(createGrid());
}

async function cycleWithLevels() {
	addGrids();
	let nextNegativeGrid = [];
	let nextZeroGrid = [];
	let nextPositiveGrid = [];
	for (let level=-negativeGrid.length; level<=positiveGrid.length; level++) {
		let grid = getGrid(level, true);
		let newGrid = getGrid(level, true);
		if (level<0) nextNegativeGrid[-level-1] = newGrid;
		if (level==0) nextZeroGrid = newGrid;
		if (level>0) nextPositiveGrid[level-1] = newGrid;
		
		let above = getGrid(level+1, true);
		let below = getGrid(level-1, true);
		for (let y=0; y<5; y++) {
			for (let x=0; x<5; x++) {
				if (x==2&&y==2) continue;
				let tile = grid[y][x];
				let bugsAround = 0;
				for (let i=0; i<4; i++) {
					let dx = x + spreadMatrix[i][0];
					let dy = y + spreadMatrix[i][1];
					if (dx<0||dx>4||dy<0||dy>4) {
						if (below != null) {
							if (dx<0) bugsAround += below[2][1]=='#';
							if (dx>4) bugsAround += below[2][3]=='#';
							if (dy<0) bugsAround += below[1][2]=='#';
							if (dy>4) bugsAround += below[3][2]=='#';
						}
						continue;
					} 
					if (dx==2&&dy==2) {
						if (above != null) {
							if (x==1) bugsAround += above.map((a)=>a[0]).filter((a)=>a=='#').length;
							if (x==3) bugsAround += above.map((a)=>a[4]).filter((a)=>a=='#').length;
							if (y==1) bugsAround += above[0].filter((a)=>a=='#').length;
							if (y==3) bugsAround += above[4].filter((a)=>a=='#').length;
						}
					} else {
						let adjTile = grid[dy][dx];
						bugsAround += adjTile=='#'?1:0;
					}
				}
				if (tile == '.' && (bugsAround==1 || bugsAround==2))
					newGrid[y][x] = '#';
				if (tile == '#' && (bugsAround!=1))
					newGrid[y][x] = '.';
			}
		}
	}
	negativeGrid = nextNegativeGrid;
	zeroGrid = nextZeroGrid;
	positiveGrid = nextPositiveGrid;
	//drawLevels();
	//await new Promise(resolve => { setTimeout(resolve, 66); });
}

for (let i=0; i<200; i++) {
	cycleWithLevels();
}
var bugsCount = positiveGrid.flat().flat().filter((a)=>a=='#').length 
	+ negativeGrid.flat().flat().filter((a)=>a=='#').length
	+ zeroGrid.flat().flat().filter((a)=>a=='#').length;
console.log(bugsCount);