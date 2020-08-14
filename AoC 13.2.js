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
	var cmd = draw();
	await new Promise(resolve => { setTimeout(resolve, 300); });
	setModeOp(a, cmd, mode[0]); 
	return;
	var inputEvent = await keyboardInput();
	var inputPrompt = null;
	if (inputEvent.key == 'a') inputPrompt = -1;
	if (inputEvent.key == 's') inputPrompt = 0;
	if (inputEvent.key == 'd') inputPrompt = 1;
	//console.log(inputPrompt);
	if (inputPrompt != null) setModeOp(a, inputPrompt, mode[0]);
	//console.log(format('Input {0}: array[{0}] = {1}', a, inputArray[inputPointer]));
	/*if (inputPointer>inputArray.length-1) {
		console.clear();
		var outputText = outputArray.map((a)=>String.fromCharCode(a)).join('');
		outputText = outputText.replace(/north/g, 'up').replace(/south/g, 'down').replace(/east/g, 'right').replace(/west/g, 'left');
		console.log(outputText);
		var inputPrompt = (prompt("Program is asking for input"));
		inputPrompt = inputPrompt.replace(/up/g, 'north').replace(/down/g, 'south').replace(/right/g, 'east').replace(/left/g, 'west');
		inputArray = inputArray.concat(inputPrompt.split('').map((a)=>a.charCodeAt()));
		outputArray = inputPrompt.split('').map((a)=>a.charCodeAt());
	}
	setModeOp(a, inputArray[inputPointer++], mode[0]);*/
}
var output = (a, mode)=>{
	let aval = getModeVal(a, mode[0]);
	//console.clear();
	//var outputText = outputArray.map((a)=>String.fromCharCode(a)).join('');
	//outputText = outputText.replace(/north/g, 'up').replace(/south/g, 'down').replace(/east/g, 'right').replace(/west/g, 'left');
	//console.log(outputText);
	//draw();
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
array[0] = 2;
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
	//draw();
	//console.clear();
	//console.log(outputArray.map((a)=>String.fromCharCode(a)).join(''));
}
var outputArray = [];
var inputArray = [];
//var inputText = 'A,B,B,A,C,A,C,A,C,B\nR,6,R,6,R,8,L,10,L,4\nR,6,L,10,R,8\nL,4,L,12,R,6,L,10\nn\nn\nn\nn\nn\n';
//inputArray = inputText.split('').map((a)=>a.charCodeAt());
var inputPointer = 0;

var itemGrid, grid, xmax,xmin,ymax,ymin,score;
function draw() {
	console.clear();
	itemGrid = [];
	score = 0;
	var ballx = -1;
	var padx = 0;
	for (ii=0; ii<outputArray.length; ii+=3) {
		var x = outputArray[ii];
		var y = outputArray[ii+1];
		var id = outputArray[ii+2];
		if (x==-1 && y==0) {
			score = id;
			continue;
		}
		var item = {};
		item.x = x; item.y = y;
		switch (id) {
			case 0: item.symbol = '.'; break;
			case 1: item.symbol = '░'; break;
			case 2: item.symbol = '█'; break;
			case 3: item.symbol = '▄'; padx = x; break;
			case 4: item.symbol = 'O'; ballx = x; break;
			default: break;
		}
		itemGrid.push(item);
	}
	xmin = itemGrid.reduce((a,b)=>Math.min(a,b.x),0);
	xmax = itemGrid.reduce((a,b)=>Math.max(a,b.x),0);
	ymin = itemGrid.reduce((a,b)=>Math.min(a,b.y),0);
	ymax = itemGrid.reduce((a,b)=>Math.max(a,b.y),0);
	grid = [];
	for (ii=ymin; ii<=ymax; ii++) {
		var row = [];
		for (let j=xmin; j<=xmax; j++) {
			row[j] = ' ';
		}
		grid.push(row);
	}
	itemGrid.forEach((a)=>{
		//console.log(format('Put {0} at ({1},{2})', a.symbol, a.x, a.y));
		grid[a.y][a.x] = a.symbol + ' ';
	});
	for (ii=ymin; ii<=ymax; ii++) {
		if (ii==0) grid[ii].push(' ' + score);
		console.log(grid[ii].join(''));
	}
	//outputArray = [];
	return (ballx>padx?1:(ballx==padx?0:-1));
}

clearAndRun();