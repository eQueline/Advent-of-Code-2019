//$('pre').innerText = '.#..#\n.....\n#####\n....#\n...##\n';
//$('pre').innerText = '.#....#####...#..\n##...##.#####..##\n##...#...#.#####.\n..#.....#...###..\n..#.#.....#....##\n';
var text = $('pre').innerText;
var input = text.split('\n');
input.pop();
var n = Math.max(input.length, input[0].length);

var array = [];
for (let y=0; y<input.length; y++) {
	let row = [];
	for (let x=0; x<input[y].length; x++) {
		var position = {};
		position.x = x;
		position.y = y;
		position.val = input[y][x];
		position.detects = [];
		//row.push(position);
		if (position.val=='#') array.push(position);
	}
	//array.push(row)
}

function clone(point) {
	let cloned = {};
	cloned.x=point.x;
	cloned.y=point.y;
	cloned.val=point.val;
	return cloned;
}

function checkPoint(asteroid, x, y, i) {
	
	return false;
}

array.forEach((a)=>{
//var a = array[4];
	//console.log('Checking for asteroid at ('+a.x+','+a.y+'):');
	for (let k=1; k<n; k++) {
		//console.log('k='+k);
		for (let dx=-k; dx<=k; dx++) {
			for (let dy=-k; dy<=k; dy++) {
				let x = a.x + dx;
				let y = a.y + dy;
				var log = 'point (' + x + ',' + y + ')';
				if ((Math.abs(dx)+Math.abs(dy)<k)||(Math.abs(dx)+Math.abs(dy)>k*2)) continue;
				let point = array.find((a)=>a.x==x&&a.y==y);
				if (point != null && a.detects.find((a)=>a.slopex==dx/dy&&a.slopey==dy/dx&&a.slopexdir==Math.sign(dx)&&a.slopeydir==Math.sign(dy))==null) {
					log += ' asteroid';
					let detected = clone(point);
					detected.slopex=dx/dy;
					detected.slopey=dy/dx;
					detected.slopexdir=Math.sign(dx);
					detected.slopeydir=Math.sign(dy);
					a.detects.push(detected);
				} else {
					log += ' empty space';
				}
				//console.log(log);
			}
		}
		//draw();
	}
});
console.log('\n');
// 10.1
var station = array.sort((a,b)=>(a.detects.length>b.detects.length?-1:(a.detects.length==b.detects.length?0:1)))[0];
function draw() {
	for(let i=0; i<input.length; i++) {
		var line = '';
		for (let j=0; j<input[0].length; j++) {
			let point = array.find((a)=>a.x==j&&a.y==i);
			//line += (point!=null?point.detects.length:'.') + '('+j+','+i+')  ';
			if (station.x==j&&station.y==i)
				line += 'O';
			else
				line += (point!=null?point.val:'.') + '';
			//line += '('+j+','+i+')  ';
		}
		console.log(line);
	}
}
draw();
console.log(station.detects.length);

// 10.2
function compare(a,b) {
	if (a.dx>0 && b.dx>0) {
		if (a.dy/a.dx < b.dy/b.dx) return -1;
		else return 1;
	}
	if (a.dx>0 && b.dx==0) {
		if (b.dy>0) return -1;
		else return 1;
	}
	if (a.dx>0 && b.dx<0) {
		return -1;
	}
	
	if (a.dx==0 && b.dx>0) {
		if (a.dy<0) return -1;
		else return 1;
	}
	if (a.dx==0 && b.dx==0) {
		if (a.dy<b.dy) return -1;
		else return 1;
	}
	if (a.dx==0 && b.dx<0) {
		if (a.dy<0) return -1;
		else return 1;
	}
	
	if (a.dx<0 && b.dx>0) {
		return 1;
	}
	if (a.dx<0 && b.dx==0) {
		return 1;
	}
	if (a.dx<0 && b.dx<0) {
		if (a.dy/a.dx > b.dy/b.dx) return 1;
		else return -1;
	}
}
var t = station.detects.map((a)=>{var t={}; t.x=a.x; t.y=a.y; t.dx=a.x-station.x; t.dy=a.y-station.y; return t;});
t.sort(compare);
console.log(t[199].x*100+t[199].y);