// --------------- 7 ---------------
var getModeVal = (a, mode)=>{
	switch (mode) {
		case '0': return array[a]??0;
		case '1': return a;
		case '2': return array[a+base]??0;
	}
}
var setModeOp = (a, val, mode)=>{
	switch (mode) {
		case '0': array[a] = val; break;
		case '1': console.log('SET 1!'); break;
		case '2': array[a+base] = val; break;
	}
}
var add = (a,b,c,mode)=>{
	let aval = getModeVal(a, mode[0]);
	let bval = getModeVal(b, mode[1]);
	let cval = aval+bval;
	//console.log(format('Add {0}, {1}, {2}: array[{0}] = {3} + {4} = {5}', a, b, c, aval, bval, cval));
	setModeOp(c, cval, mode[2]);
}
var mult = (a,b,c,mode)=>{
	let aval = getModeVal(a, mode[0]);
	let bval = getModeVal(b, mode[1]);
	let cval = aval*bval;
	//console.log(format('Add {0}, {1}, {2}: array[{0}] = {3} * {4} = {5}', a, b, c, aval, bval, cval));
	setModeOp(c, cval, mode[2]);
}
function keyboardInput() {
    return new Promise(resolve => {
        window.addEventListener('keypress', resolve, {once:true});
    });
}
var input = async (a, mode)=>{
	paintAndMove();
	draw();
	await new Promise(resolve => { setTimeout(resolve, 100); });
	setModeOp(a, getColor(), mode[0]);
}
var output = (a, mode)=>{
	let aval = getModeVal(a, mode[0]);
	outputArray.push(aval);
}
var jumptrue = (a, b, mode)=>{
	let aval = getModeVal(a, mode[0]);
	let bval = getModeVal(b, mode[1]);
	if (aval != 0)
		i = bval;
	else
		i += 3;
	//console.log(format('Jumptrue {0}, {1}: {2} {3} ', a, b, aval, aval!=0?format(' != 0, jumping to {0}', bval):' == 0. Do nothing'));
}
var jumpfalse = (a, b, mode)=>{
	let aval = getModeVal(a, mode[0]);
	let bval = getModeVal(b, mode[1]);
	if (aval == 0)
		i = bval;
	else
		i += 3;
	//console.log(format('Jumpfalse {0}, {1}: {2} {3} ', a, b, aval, aval==0?format(' == 0, jumping to {0}', bval):' != 0. Do nothing'));
}
var lt = (a, b, c, mode)=>{
	let aval = getModeVal(a, mode[0]);
	let bval = getModeVal(b, mode[1]);
	let cval = aval<bval?1:0;
	setModeOp(c, cval, mode[2]);
	//console.log(format('Less than {0}, {1}, {2}: {3} < {4} is {5}, array[{2}]={6}', a, b, c, aval, bval, aval<bval?'true':'false', cval));
}
var eq = (a, b, c, mode)=>{
	let aval = getModeVal(a, mode[0]);
	let bval = getModeVal(b, mode[1]);
	let cval = aval==bval?1:0;
	setModeOp(c, cval, mode[2]);
	//console.log(format('Equals {0}, {1}, {2}: {3} == {4} is {5}, array[{2}]={6}', a, b, c, aval, bval, aval==bval?'true':'false', cval));
}
var cbase = (a, mode)=>{
	let aval = getModeVal(a, mode[0]);
	base += aval;
	//console.log(format('Cbase {0}: new base is {1} ', a, base));
}
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

var base = 0;
var array = [];
var i = 0;
var cntr = 0;
text = $('pre').innerText;
array=text.split(',');i=0;array.forEach((a,i)=>{array[i]=parseInt(a);})
async function clearAndRun() {
	inputPointer = 0;
	try {
	while(true) {
		var op = ('0000' + array[i].toString()).slice(-5);
		var mode = op.substr(0, op.length-2).split('').reverse().join('');
		//console.log('op: ' + op + ' | mode: ' + mode);
		switch (op.slice(-2)) {
			case '01': add(array[i+1], array[i+2], array[i+3], mode); i+=4; break;
			case '02': mult(array[i+1], array[i+2], array[i+3], mode); i+=4; break;
			case '03': await input(array[i+1], mode); i+=2; break;
			case '04': output(array[i+1], mode); i+=2; break;
			case '05': jumptrue(array[i+1], array[i+2], mode); break;
			case '06': jumpfalse(array[i+1], array[i+2], mode); break;
			case '07': lt(array[i+1], array[i+2], array[i+3], mode); i+=4; break;
			case '08': eq(array[i+1], array[i+2], array[i+3], mode); i+=4; break;
			case '09': cbase(array[i+1], mode); i+=2; break;
			case '99': console.log('halt!'); break;
			default: break;
		}
		if (op.slice(-2) == '99') break;
		cntr++;
	}
	} catch(err) {
		console.log(err);
	}
	draw();
	console.log(grid.flat().filter((a)=>a.painted).length);
}
var outputArray = [];

var grid,xmax=50,xmin=50,ymax=50,ymin=50;
grid = [];
for (ii=0; ii<=100; ii++) {
	var row = [];
	for (let j=0; j<=100; j++) {
		var tile = {};
		tile.x=j;
		tile.y=ii;
		tile.color=0;
		tile.painted=false;
		row.push(tile);
	}
	grid.push(row);
}
var posx=50, posy=50, dir='^';
grid[posy][posx].color = 1;
function getColor() {
	return grid[posy][posx].color;
}
var step=0;
function paintAndMove() {
	step++
	if (outputArray.length < 2) return;
	var color = outputArray[0];
	var rotation = outputArray[1];
	
	grid[posy][posx].color = color;
	grid[posy][posx].painted = true;
	switch (dir) {
		case '^': dir = rotation?'>':'<'; break;
		case '>': dir = rotation?'V':'^'; break;
		case 'V': dir = rotation?'<':'>'; break;
		case '<': dir = rotation?'^':'V'; break;
		default: break;
	}
	switch (dir) {
		case '^': posy--; break;
		case '>': posx++; break;
		case 'V': posy++; break;
		case '<': posx--; break;
		default: break;
	}
	outputArray = [];
	if (xmax<posx) xmax = posx;
	if (xmin>posx) xmin = posx;
	if (ymax<posy) ymax = posy;
	if (ymin>posy) ymin = posy;
}
function draw() {
	console.clear();
	
	for (ii=ymin-1; ii<=ymax+1; ii++) {
		var row = '';
		for (let j=xmin-1; j<=xmax+1; j++) {
			if (ii==posy&&j==posx) row += dir + ' ';
			else row += (grid[ii][j].color?'#':'.') + ' ';
		}
		console.log(row);
	}
}

clearAndRun();