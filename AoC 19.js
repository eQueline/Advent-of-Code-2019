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
for (let y=0; y<50; y++) {
		let row = [];
		for (let x=0; x<50; x++) {
			row.push('.');
		}
		grid.push(row);
	}
	
var inputArray, outputValue, inputPointer;
var cpu1 = {};
function resetCpu(cpu) {
	text = $('pre').innerText;
	inputArray = [];
	outputValue = 0;
	inputPointer = 0;
	cpu1.ip = 0;
	cpu1.code = text.split(',');
	cpu1.code.forEach((a,i)=>{cpu1.code[i]=parseInt(a);})
	cpu1.base = 0;
}

async function runProgram(cpu) {
	//resetCpu(cpu);
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
				setModeOp(cpu, p1, inputArray[inputPointer++], mode[0])
				//console.log(format(' Input {0}: array[{1}] = {2}', p1, p1, inputArray[inputValue]));
				//draw();
				//await new Promise(resolve => { setTimeout(resolve, 50); });
				//inputValue = solve();
				//setModeOp(cpu, p1, inputValue, mode[0]);
				
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
				var p1val = getModeVal(cpu, p1, mode[0]);
				outputValue = p1val;
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
				//console.log(' Halt');
				break;
			default:
				break;
		}
		if (op.slice(-2) == '99') break;
	}
	//draw();
	await new Promise(resolve => { setTimeout(resolve, 100); });
}
//runProgram(cpu1);
function getOutput(x,y) {
	resetCpu(cpu1);
	inputArray.push(x);
	inputArray.push(y);
	runProgram(cpu1);
	return outputValue;
}

var x,y;
var lines = [];
var side = 100;
function findSquare() {
	var beamStart = 0;
	x = 0;
	y = 10;
	while (true) {
		x = beamStart;
		let inBeam = getOutput(x,y);
		while (!inBeam) {
			inBeam = getOutput(++x, y)==1;
		}
		if (getOutput(x+side-1,y-side+1)==1) {
			y=y-side+1;
			break;
		}
		beamStart = x;
		y++;
	}
}

grid = [];
function draw() {
	let line = '';
	for (let j=y-10; j<y+110; j++) {
		for (let i=x-10; i<x+110; i++) {
			if (i>=x&&j>=y&&i<x+side&&j<y+side)
				line += getOutput(i,j)?'O':'X';
			else
				line += getOutput(i,j)?'#':'.';
		}
		line += '\n';
	}
	console.log(line);
}
findSquare();
//draw();
console.log(x*10000+y); // 9840661