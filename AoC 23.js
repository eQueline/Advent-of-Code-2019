var verbose = 0;
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


async function runProgram(cpu) {
	//resetCpu(cpu);
	//while(true) {
		//cntr++;
		cpu.sending = false;
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
				if (verbose == 2) console.log(format(' Add {0}, {1}, {2}: array[{0}] = {3} + {4} = {5}', p1, p2, p3, p1val, p2val, p3val));
				break;
			case '02': //mult
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				var p3val = p1val*p2val;
				setModeOp(cpu, p3, p3val, mode[2]);
				cpu.ip+=4;
				if (verbose == 2) console.log(format(' Mult {0}, {1}, {2}: array[{0}] = {3} * {4} = {5}', p1, p2, p3, p1val, p2val, p3val));
				break;
			case '03': //input
				let input;
				if (cpu.inputPointer >= cpu.inputArray.length) {
					cpu.pendingReceive++;
					input = -1;
				} else {
					cpu.pendingReceive = 0;
					input = cpu.inputArray[cpu.inputPointer++];
				}
				if (verbose == 2) console.log(format(' Input {0}: array[{1}] = {2}', p1, p1, input));
				setModeOp(cpu, p1, input, mode[0])
				cpu.ip+=2;
				break;
			case '04': //output
				cpu.sending = true;
				cpu.pendingReceive = 0;
				let output = getModeVal(cpu, p1, mode[0]);
				cpu.outputArray.push(output);
				cpu.ip+=2;
				if (verbose == 2) console.log(format(' Output {0}: output (array[{1}]={2})', p1, p1, output));
				break;
			case '05': //jumptrue
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				cpu.ip = p1val!=0?p2val:(cpu.ip+3);
				if (verbose == 2) console.log(format(' Jumptrue {0}, {1}: {2} {3} ', p1, p2, p1val, p1val!=0?format(' != 0, jumping to {0}', p2val):' == 0. Do nothing'));
				break;
			case '06': //jumpfalse
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				cpu.ip = p1val==0?p2val:(cpu.ip+3);
				if (verbose == 2) console.log(format(' Jumptrue {0}, {1}: {2} {3} ', p1, p2, p1val, p1val==0?format(' == 0, jumping to {0}', p2val):' != 0. Do nothing'));
				break;
			case '07': //lt
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				var p3val = p1val<p2val?1:0;
				setModeOp(cpu, p3, p3val, mode[2]);
				cpu.ip+=4;
				if (verbose == 2) console.log(format(' Less than {0}, {1}, {2}: {3} < {4} is {5}, array[{2}]={6}', p1, p2, p3, p1val, p2val, p1val<p2val?'true':'false', p3val));
				break;
			case '08': //eq
				var p1val = getModeVal(cpu, p1, mode[0]);
				var p2val = getModeVal(cpu, p2, mode[1]);
				var p3val = p1val==p2val?1:0;
				setModeOp(cpu, p3, p3val, mode[2]);
				cpu.ip+=4;
				if (verbose == 2) console.log(format(' Equals {0}, {1}, {2}: {3} == {4} is {5}, array[{2}]={6}', p1, p2, p3, p1val, p2val, p1val==p2val?'true':'false', p3val));
				break;
			case '09': //cbase
				cpu.base += getModeVal(cpu, p1, mode[0]);
				if (verbose == 2) console.log(format(' Cbase {0}: new base is {1} ', p1, cpu.base));
				cpu.ip+=2;
				break;
			case '99': //halt
				cpu.halted = true;
				if (verbose == 2) console.log(' Halt');
				break;
			default:
				break;
		}
		if (op.slice(-2) == '99') return;
	//}
	//draw();
	//await new Promise(resolve => { setTimeout(resolve, 100); });
}

var nics,bus;
function init() {
	nics = [];
	bus = [];
	for (let i=0; i<50; i++) {
		let cpu = {};
		cpu.address = i;
		cpu.inputArray = [i];
		cpu.inputPointer = 0;
		cpu.outputArray = [];
		cpu.ip = 0;
		cpu.code = text.split(',');
		cpu.code.forEach((a,i)=>{cpu.code[i]=parseInt(a);})
		cpu.base = 0;
		cpu.halted = false;
		nics[i] = cpu;
		bus.push({input:[],output:[]});
	}
	bus[255] = {input:[],output:[]};
}

// 23.1
init();
var natFirstInput;
while (true) {
	// NICS
	for (let i=0; i<50; i++) {
		let cpu = nics[i];
		while (bus[i].input.length > 0) {
			let packet = bus[i].input.pop();
			cpu.inputArray = cpu.inputArray.concat(packet);
		}
		runProgram(nics[i]);
		if (cpu.outputArray.length >= 3) {
			let address  = cpu.outputArray.splice(0,1);
			let packet  = cpu.outputArray.splice(0,2);
			if (address == 255) {
				bus[address].input = [];
			}
			bus[address].input.push(packet);
			if (verbose == 1) console.log(format('NICS {0} outputs packet [{1},{2}] to #{3}', i, packet[0], packet[1], address));
		}
	}
	// NAT
	if (bus[255].input.length>0) {
		natFirstInput = bus[255].input[0][1];
		break;
	}
}

// 23.2
var natLastOutput;
init();
var natOutput = [];
var NatBusTraffic=0, NatReceiving=0, NatSending=0, NatIdle=0;
while (true) {
	// NICS
	for (let i=0; i<50; i++) {
		let cpu = nics[i];
		while (bus[i].input.length > 0) {
			cpu.receiving = true;
			let packet = bus[i].input.pop();
			cpu.inputArray = cpu.inputArray.concat(packet);
			cpu.pendingReceive = 0;
		}
		runProgram(nics[i]);
		if (cpu.outputArray.length >= 3) {
			cpu.sending = true;
			let address  = cpu.outputArray.splice(0,1);
			let packet  = cpu.outputArray.splice(0,2);
			if (address == 255) {
				bus[address].input = [];
			}
			bus[address].input.push(packet);
			if (verbose == 1) console.log(format('NICS {0} outputs packet [{1},{2}] to #{3}', i, packet[0], packet[1], address));
		}
	}
	// NAT
	if (bus[255].input.length>0) {
		// bus check
		busTraffic = bus.filter((a,b)=> b!=255 && (a.input.length>0 || a.output.length>0)).length;
		if (busTraffic!=NatBusTraffic) {
			NatBusTraffic = busTraffic;
			if (verbose == 1) console.log(format('NAT | Bus traffic: {0} pending packets', busTraffic));
		}
		if (busTraffic==0) {
			// nics status check
			receiving = nics.filter((a)=>a.pendingReceive==0).length;
			idle = nics.filter((a)=>a.pendingReceive>2).length;
			sending = nics.filter((a)=>a.sending).length;
			if (receiving!=NatReceiving || sending!=NatSending || idle!=NatIdle) {
				NatReceiving = receiving;
				NatSending = sending;
				NatIdle = idle;
				if (verbose == 1) console.log(format('NAT | Nics status: sending {0}, receiving {1}, idle {2}', sending, receiving, idle));
			}
			if (receiving==0 && sending==0 && idle==50) {
				let packet = bus[255].input[0];
				natOutput.push(packet);
				bus[0].input.push(packet);
				if (verbose == 1) console.log(format('NAT | Net idle. NAT outputs packet [{0},{1}] to #0', packet[0], packet[1]));
			}
		}
	}
	if (natOutput.length>1) {
		let i = natOutput.length-1;
		if (natOutput[i][1] == natOutput[i-1][1]) {
			natLastOutput = natOutput[i][1];
			break;
		}
	}
}
console.log(natFirstInput);
console.log(natLastOutput);