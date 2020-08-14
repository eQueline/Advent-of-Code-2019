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
var getModeVal = (cpu, address, mode)=>{
	switch (mode) {
		case '0': return cpu.code[address]??0;
		case '1': return address;
		case '2': return cpu.code[address+cpu.base]??0;
	}
}
var setModeOp = (cpu, address, value, mode)=>{
	switch (mode) {
		case '0': cpu.code[address] = value; break;
		case '2': cpu.code[address+cpu.base] = value; break;
	}
}
function keyboardInput() {
    return new Promise(resolve => {
        window.addEventListener('keypress', resolve, {once:true});
    });
}
var text = $('pre').innerText;
var grid = [];
var inputValue, outputValue;
var cpu1 = {};
function resetCpu(cpu) {
	text = $('pre').innerText;
	inputArray = [];
	outputArray = [];
	inputValue = 1;
	outputValue = 0;
	cpu1.ip = 0;
	cpu1.code = text.split(',');
	cpu1.code.forEach((a,i)=>{cpu1.code[i]=parseInt(a);})
	cpu1.base = 0;
	grid = [];
	let tile = {};
	tile.x=0;
	tile.y=0;
	tile.tile='.';
	grid.push(tile);
	posx=0;
	posy=0;
}
async function runProgram(cpu) {
	resetCpu(cpu);
	while(true) {
		//cntr++;
		let ip = cpu.ip;
		let op = ('0000' + cpu.code[ip].toString()).slice(-5);
		let mode = op.substr(0, op.length-2).split('').reverse().join('');
		let p1 = cpu.code[ip+1];
		let p2 = cpu.code[ip+2];
		let p3 = cpu.code[ip+3];
		switch (op.slice(-2)) {
			case '01': //add
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				var p3val = p1val+p2val;
				setModeOp(cpu, p3, p3val, mode[2]);
				cpu.ip+=4;
				//console.log(format(' Add {0}, {1}, {2}: array[{0}] = {3} + {4} = {5}', p1, p2, p3, p1val, p2val, p3val));
				break;
			case '02': //mult
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				var p3val = p1val*p2val;
				setModeOp(cpu, p3, p3val, mode[2]);
				cpu.ip+=4;
				//console.log(format(' Mult {0}, {1}, {2}: array[{0}] = {3} * {4} = {5}', p1, p2, p3, p1val, p2val, p3val));
				break;
			case '03': //input
				//console.log(format(' Input {0}: array[{1}] = {2}', p1, p1, inputArray[inputValue]));
				//draw();
				//await new Promise(resolve => { setTimeout(resolve, 50); });
				inputValue = solve();
				setModeOp(cpu, p1, inputValue, mode[0]);
				
				/*var inputEvent = await keyboardInput();
				var inputPrompt = null;
				if (inputEvent.key == 'w') inputPrompt = 1;
				if (inputEvent.key == 's') inputPrompt = 2;
				if (inputEvent.key == 'a') inputPrompt = 3;
				if (inputEvent.key == 'd') inputPrompt = 4;
				inputValue = inputPrompt;
				if (inputPrompt != null) setModeOp(cpu, p1, inputPrompt, mode[0]);*/
				cpu.ip+=2;
				break;
			case '04': //output
			    if (posx==-15&&posy==14)
			        console.log('there!');
				var p1val = getModeVal(cpu, p1, mode[0]);
				outputValue = p1val;
				let tile = {}
				switch(p1val) {
					case 0:
						tile.tile='#';
						tile.x=posx;
						tile.y=posy;
						switch(inputValue) {
							case 1: tile.y-=1; break;
							case 2: tile.y+=1; break;
							case 3: tile.x-=1; break;
							case 4: tile.x+=1; break;
						}
						break;
					case 1:
						switch(inputValue) {
							case 1: posy-=1; break;
							case 2: posy+=1; break;
							case 3: posx-=1; break;
							case 4: posx+=1; break;
						}
						tile.tile='.';
						tile.x=posx;
						tile.y=posy;
						break;
					case 2:
						switch(inputValue) {
							case 1: posy-=1; break;
							case 2: posy+=1; break;
							case 3: posx-=1; break;
							case 4: posx+=1; break;
						}
						tile.tile='O';
						tile.x=posx;
						tile.y=posy;
						break;
				}
				if (grid.find((a)=>a.x==tile.x&&a.y==tile.y) == null)
					grid.push(tile);
				cpu.ip+=2;
				//console.log(format(' Output {0}: output (array[{1}]={2})', p1, p1, p1val));
				break;
			case '05': //jumptrue
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				cpu.ip = p1val!=0?p2val:(cpu.ip+3);
				//console.log(format(' Jumptrue {0}, {1}: {2} {3} ', p1, p2, p1val, p1val!=0?format(' != 0, jumping to {0}', p2val):' == 0. Do nothing'));
				break;
			case '06': //jumpfalse
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				cpu.ip = p1val==0?p2val:(cpu.ip+3);
				//console.log(format(' Jumptrue {0}, {1}: {2} {3} ', p1, p2, p1val, p1val==0?format(' == 0, jumping to {0}', p2val):' != 0. Do nothing'));
				break;
			case '07': //lt
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				var p3val = p1val<p2val?1:0;
				setModeOp(cpu, p3, p3val, mode[2]);
				cpu.ip+=4;
				//console.log(format(' Less than {0}, {1}, {2}: {3} < {4} is {5}, array[{2}]={6}', p1, p2, p3, p1val, p2val, p1val<p2val?'true':'false', p3val));
				break;
			case '08': //eq
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				var p3val = p1val==p2val?1:0;
				setModeOp(cpu, p3, p3val, mode[2]);
				cpu.ip+=4;
				//console.log(format(' Equals {0}, {1}, {2}: {3} == {4} is {5}, array[{2}]={6}', p1, p2, p3, p1val, p2val, p1val==p2val?'true':'false', p3val));
				break;
			case '09': //cbase
				cpu.base += getModeVal(cpu, p1, mode[0]);
				//console.log(format(' Cbase {0}: new base is {1} ', p1, cpu.base));
				cpu.ip+=2;
				break;
			case '99': //halt
				cpu.halted = true;
				console.log(' Halt');
				break;
			default:
				break;
		}
		if (op.slice(-2) == '99') break;
		//if (outputValue==2) break;
		if (posx==0&&posy==0&&grid.length>20) break;
	}
	draw();
}

function draw() {
	console.clear();
	console.log('Input: ' + inputValue + '.  Output: ' + outputValue + '.  Solver state: ' + solver.state);
	var minx = grid.reduce((a,b)=>Math.min(a,b.x),0)-2;
	var miny = grid.reduce((a,b)=>Math.min(a,b.y),0)-2;
	var maxx = grid.reduce((a,b)=>Math.max(a,b.x),0)+2;
	var maxy = grid.reduce((a,b)=>Math.max(a,b.y),0)+2;
	let length = maxx-minx;
	let line = '';
	for (let y=miny; y<=maxy; y++) {
		line += '║  ';
		for (let x=minx; x<=maxx; x++) {
			let tile = grid.find((a)=>a.x==x&a.y==y);
			if (tile == null) {
				if (x==posx&&y==posy) line += 'c';
				else line += ' ';
			} else {
				if (x==posx&&y==posy) {
					if (tile.tile == 'O') {
						line += '©';
					} else {
						line += 'c';
					}
				} else line += tile.tile;
			}
			 line+=' ';
		}
		line += '  ║\n';
	}
	console.log('═'.repeat(length+8) + '\n' + line + '═'.repeat(length+8));
}
// 1-up 2-down 3-left 4-right
// 15.1
var solver = {};
solver.state=0;solver.x=0;solver.y=0;
function solve() {
	if (solver.state == 0) {
		solver.state = 40;
		return 4;
	}
	if (solver.state == 10) {
		if (outputValue == 0) {
			solver.state = 30;
			return 3;
		} else {
			solver.state = 41;
			return 4;
		}
	}
	if (solver.state == 20) {
		if (outputValue == 0) {
			solver.state = 40;
			return 4;
		} else {
			solver.state = 31;
			return 3;
		}
	}
	if (solver.state == 30) {
		if (outputValue == 0) {
			solver.state = 20;
			return 2;
		} else {
			solver.state = 11;
			return 1;
		}
	}
	if (solver.state == 40) {
		if (outputValue == 0) {
			solver.state = 10;
			return 1;
		} else {
			solver.state = 21;
			return 2;
		}
	}
	if (solver.state == 11) {
		if (outputValue == 0) {
			solver.state = 30;
			return 3;
		} else {
			solver.state = 41;
			return 4;
		}
	}
	if (solver.state == 21) {
		if (outputValue == 0) {
			solver.state = 40;
			return 4;
		} else {
			solver.state = 31;
			return 3;
		}
	}
	if (solver.state == 31) {
		if (outputValue == 0) {
			solver.state = 20;
			return 2;
		} else {
			solver.state = 11;
			return 1;
		}
	}
	if (solver.state == 41) {
		if (outputValue == 0) {
			solver.state = 10;
			return 1;
		} else {
			solver.state = 21;
			return 2;
		}
	}
}

runProgram(cpu1);
// 15.2
var gridQueue = [];
gridQueue.push(grid.find((a)=>a.tile=='O'));
var path = 0;
var step = 0;
let spreadMatrix=[[0,1],[0,-1],[1,0],[-1,0]];
async function paintO2() {
	while(gridQueue.length > 0) {
		let painted=false;
		draw();
		let newTiles = [];
		while(gridQueue.length > 0) {
			let a = gridQueue.pop();
			spreadMatrix.forEach((b)=>{
				let px=a.x+b[0];
				let py=a.y+b[1];
				//console.log(px + ' ' + py);
				var tile = grid.find((b)=>b.x==px&&b.y==py);
				if (tile.tile == '.') {
					tile.tile = 'O';
					newTiles.push(tile);
					if (px==0&&py==0) path=step+1;
					painted=true;
				}
			});
		}
		if (painted) step++;
		gridQueue = gridQueue.concat(newTiles);
		//await new Promise(resolve => { setTimeout(resolve, 66); });
	}
}

paintO2();
draw();
console.log(path);
console.log(step);