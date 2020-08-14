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

var text = $('pre').innerText;
//text = '3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5';
var amps = [];
function resetAmps() {
	amps = [];
	for (let i=0; i<5; i++) {
		var amp = {};
		amp.ip = 0;
		amp.code = text.split(',');
		amp.code.forEach((a,i)=>{amp.code[i]=parseInt(a);})
		amp.base = 0;
		amps.push(amp);
	}
}

async function runProgram(cpu) {
	while(cntr<10000) {
		cntr++;
		let ip = cpu.ip;
		let op = ('0000' + cpu.code[ip].toString()).slice(-5);
		let mode = op.substr(0, op.length-2).split('').reverse().join('');
		let p1 = cpu.code[ip+1];
		let p2 = cpu.code[ip+2];
		let p3 = cpu.code[ip+3];
		//console.log(' op: ' + op + ' | mode: ' + mode);
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
				//console.log(format(' Input {0}: array[{1}] = {2}', p1, p1, inputArray[inputPointer]));
				setModeOp(cpu, p1, inputArray[inputPointer++], mode[0]);
				cpu.ip+=2;
				break;
			case '04': //output
				var p1val = getModeVal(cpu, p1, mode[0]);
				outputArray.push(p1val);
				inputArray.push(p1val);
				cpu.ip+=2;
				//console.log(format(' Output {0}: output (array[{1}]={2})', p1, p1, p1val));
				return;
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
}

//var setting = [9,8,7,6,5];
var inputArray = [];
var outputArray = [];
var inputPointer = 0;
var cntr;
function testSetting(setting) {
	cntr = 0;
	resetAmps();
	inputArray = [];
	outputArray = [];
	inputPointer = 0;
	inputArray.push(setting.shift());
	inputArray.push(0);
	while(cntr<10000) {
		for (let i=0; i<5; i++) {
			if (setting.length>0) {
				inputArray.push(setting.shift());
			}
			//console.log('Input array: pos=' + inputPointer + ' | ' + inputArray.join(','));
			//console.log('Output array: ' + outputArray.join(','));
			//console.log('AMPLIFIER ' + (i+1) + ' START');
			runProgram(amps[i]);
			/*if (amps[i].halted)
				console.log('AMPLIFIER ' + (i+1) + ' HALTED');
			else
				console.log('AMPLIFIER ' + (i+1) + ' AWAITS INPUT');
			*/
		}
		if (amps[4].halted) break;
	}
	return outputArray[outputArray.length-1];
}

var perm=a=>a.length?a.reduce((r, v, i)=>[...r, ...perm([...a.slice(0, i), ...a.slice(i + 1)]).map(x=>[v, ...x ])],[]):[[]];
var settings = perm([5,6,7,8,9]);
var maxOut = 0;
var maxSetting = [];
settings.forEach((a)=>{
	let setting = a.map((a)=>a);
	var output = testSetting(setting);
	if (maxOut<output) {
		console.log(format('New Max: {0} with setting {1}', output, a.join(',')));
		maxOut = output;
		maxSetting = a;
	}
});