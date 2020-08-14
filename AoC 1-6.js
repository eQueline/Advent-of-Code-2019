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


// --------------- 2.1 ---------------
var array = $('pre').innerText.split(','); array[1]='12'; array[2]='2'; i=0; array.forEach((a,i)=>{array[i]=parseInt(a);})
function add(a) {console.log('Mult: array['+array[a+3]+']('+array[array[a+3]]+') = array['+array[a+1]+']('+array[array[a+1]]+') + array['+array[a+2]+']('+array[array[a+2]]+') = ' + (array[array[a+1]]+array[array[a+2]])); array[array[a+3]]=array[array[a+1]]+array[array[a+2]];}
function mult(a) {console.log('Mult: array['+array[a+3]+']('+array[array[a+3]]+') = array['+array[a+1]+']('+array[array[a+1]]+') * array['+array[a+2]+']('+array[array[a+2]]+') = ' + (array[array[a+1]]*array[array[a+2]])); array[array[a+3]]=array[array[a+1]]*array[array[a+2]];}

while(i<500) { var op = array[i]; console.log('op = array['+i+']='+op); if (op==1) add(i); else if (op==2) mult(i); else if (op==99) {console.log('halt'); break;} i+=4; console.log(array); }


// --------------- 2.2 ---------------
function add(a) {
	//console.log('Mult: array['+array[a+3]+']('+array[array[a+3]]+') = array['+array[a+1]+']('+array[array[a+1]]+') + array['+array[a+2]+']('+array[array[a+2]]+') = ' + (array[array[a+1]]+array[array[a+2]])); 
	array[array[a+3]]=array[array[a+1]]+array[array[a+2]];
}
function mult(a) {
	//console.log('Mult: array['+array[a+3]+']('+array[array[a+3]]+') = array['+array[a+1]+']('+array[array[a+1]]+') * array['+array[a+2]+']('+array[array[a+2]]+') = ' + (array[array[a+1]]*array[array[a+2]])); 
	array[array[a+3]]=array[array[a+1]]*array[array[a+2]];
}

var verb=0;var noun=0;
for (var noun=0; noun<100; noun++) {
	for (var verb=0; verb<100; verb++) {
		var array = $('pre').innerText.split(','); i=0; array.forEach((a,i)=>{array[i]=parseInt(a);})
		array[1] = noun;
		array[2] = verb;
		var i = 0;
		while(i<500) {
			var op = array[i]; 
			//console.log('op = array['+i+']='+op); 
			if (op==1) add(i); 
			else if (op==2) mult(i); 
			else if (op==99) {
				//console.log('halt'); 
				break;
			} i+=4; 
			//console.log(array); 
		}
		if (array[0] == 19690720) break;
	}
	if (array[0] == 19690720) break;
}
100*noun+verb




// --------------- 3 ---------------
var array = $('pre').innerText.split('\n'); var wire1 = array[0].split(','); var wire2= array[1].split(',');
var wire1 = 'R75,D30,R83,U83,L12,D49,R71,U7,L72'.split(',');
var wire2 = 'U62,R66,U55,R34,D71,R55,D58,R83'.split(',');
var wire1Path = [];
var coord = [0,0];
wire1.forEach((a)=>{
	var dir = a[0];
	var length = parseInt(a.substr(1));
	var coordStart = coord.map((x)=>x);
	switch (dir) {
		case 'U': coord[1]+=length; break;
		case 'D': coord[1]-=length; break;
		case 'L': coord[0]-=length; break;
		case 'R': coord[0]+=length; break;
		default: break;
	}
	var coordEnd = coord.map((x)=>x);
	wire1Path.push([dir, coordStart, coordEnd, length]);
});

var wire2Path = [];
var coord = [0,0];
wire2.forEach((a)=>{
	var dir = a[0];
	var length = parseInt(a.substr(1));
	var coordStart = coord.map((x)=>x);
	switch (dir) {
		case 'U': coord[1]+=length; break;
		case 'D': coord[1]-=length; break;
		case 'L': coord[0]-=length; break;
		case 'R': coord[0]+=length; break;
		default: break;
	}
	var coordEnd = coord.map((x)=>x);
	wire2Path.push([dir, coordStart, coordEnd, length]);
});

// 3.1
var intersections = [];
wire1Path.forEach((path1)=>{ 
	var intersection = wire2Path.find(function(path2) {
		if (['U','D'].indexOf(path1[0]) > 0 && ['L','R'].indexOf(path2[0]) > 0) {
			if (path1[1][0] >= Math.min(path2[1][0], path2[2][0]) && path1[1][0] <= Math.max(path2[1][0], path2[2][0])
				&& path2[1][1] >= Math.min(path1[1][1], path1[2][1]) && path2[1][1] <= Math.max(path1[1][1], path1[2][1]))
				return true;
		}
		if (['U','D'].indexOf(path2[0]) > 0 && ['L','R'].indexOf(path1[0]) > 0) {
			if (path1[1][1] >= Math.min(path2[1][1], path2[2][1]) && path1[1][1] <= Math.max(path2[1][1], path2[2][1])
				&& path2[1][0] >= Math.min(path1[1][0], path1[2][0]) && path2[1][0] <= Math.max(path1[1][0], path1[2][0]))
				return true;
		}
		return false;
	}, path1)
	if (intersection) {
		if (['L','R'].indexOf(path1[0]) > 0)
			intersections.push(Math.abs(path1[1][1]) + Math.abs(intersection[1][0]));
		else
			intersections.push(Math.abs(path1[1][0]) + Math.abs(intersection[1][1]));
	}
});
intersections.sort()[0]

// 3.2 UNFINISHED
var intersections = [];
wire1Path.forEach((path1)=>{ 
	var intersection = wire2Path.find(function(path2) {
		if (['U','D'].indexOf(path1[0]) > 0 && ['L','R'].indexOf(path2[0]) > 0) {
			if (path1[1][0] >= Math.min(path2[1][0], path2[2][0]) && path1[1][0] <= Math.max(path2[1][0], path2[2][0])
				&& path2[1][1] >= Math.min(path1[1][1], path1[2][1]) && path2[1][1] <= Math.max(path1[1][1], path1[2][1]))
				return true;
		}
		if (['U','D'].indexOf(path2[0]) > 0 && ['L','R'].indexOf(path1[0]) > 0) {
			if (path1[1][1] >= Math.min(path2[1][1], path2[2][1]) && path1[1][1] <= Math.max(path2[1][1], path2[2][1])
				&& path2[1][0] >= Math.min(path1[1][0], path1[2][0]) && path2[1][0] <= Math.max(path1[1][0], path1[2][0]))
				return true;
		}
		return false;
	}, path1)
	if (intersection) {
		intersections.push([path1,intersection]);
	}
});

intersections.forEach((a)=>{
	var wire1Steps = wire1Path.indexOf(a[0]);
	var wire1Length = wire1Path.slice(0, wire1Steps).reduce((acc,val)=>acc+val[3], 0);
	var wire2Steps = wire2Path.indexOf(a[1]);
	var wire2Length = wire2Path.slice(0, wire2Steps).reduce((acc,val)=>acc+val[3], 0);
	if (['U','D'].indexOf(a[0][0]) > 0) {
		var wire1LastStep = Math.abs(a[0][1][1]-a[1][1][1]);
		var wire2LastStep = Math.abs(a[0][1][0]-a[1][1][0]);
	}
	if (['L','R'].indexOf(a[0][0]) > 0) {
		var wire1LastStep = Math.abs(a[0][1][0]-a[1][1][0]);
		var wire2LastStep = Math.abs(a[0][1][1]-a[1][1][1]);
	}
	a.push(wire1Length+wire1LastStep+wire2Length+wire2LastStep);
});


// --------------- 4 ---------------
var n1=347312, n2=805915, numbers=[];
var digit=(n,i)=>parseInt(n.toString()[i]);
for (let i=n1; i<=n2; i++) {
	var curDigit = 0, prevDigit = 0;
	var hasPair = false, isAsc = true; 
	for (let j=0; j<i.toString().length; j++) {
		prevDigit = curDigit;
		curDigit = digit(i,j);
		if (curDigit == prevDigit) hasPair = true;
		if (curDigit < prevDigit) isAsc = false;
	}
	if (hasPair && isAsc) numbers.push(i);
}
// 4.1
console.log(numbers.length);
// 4.2
console.log(numbers.filter((a)=>[...a.toString().matchAll(/(\d)\1{1,}/g)].find((b)=>b[0].length==2)).length);



// --------------- 5 ---------------
var add = (a,b,c,mode)=>{
	let aval = mode[0]>0?a:array[a];
	let bval = mode[1]>0?b:array[b];
	let cval = aval+bval;
	console.log(format('Add {0}, {1}, {2}: array[{0}] = {3} + {4} = {5}', a, b, c, mode[0]>0?a:format('(array[{0}}={1})', a, array[a]), mode[1]>0?b:format('(array[{0}}={1})', b, array[b]), cval));
	array[c] = cval;
}
var mult = (a,b,c,mode)=>{
	let aval = mode[0]>0?a:array[a];
	let bval = mode[1]>0?b:array[b];
	let cval = aval*bval;
	console.log(format('Add {0}, {1}, {2}: array[{0}] = {3} * {4} = {5}', a, b, c, mode[0]>0?a:format('(array[{0}}={1})', a, array[a]), mode[1]>0?b:format('(array[{0}}={1})', b, array[b]), cval));
	array[c] = cval;
}
var input = (a)=>{
	console.log(format('Input: array[{0}] = {1}', a, inputArray[inputPointer]));
	array[a] = inputArray[inputPointer++];
}
var output = (a, mode)=>{
	console.log(format('Output: (array[{0}]={1})', a, array[a]));
	outputArray.push(mode[0]>0?a:array[a]);
}
var jumptrue = (a, b, mode)=>{
	let aval = mode[0]>0?a:array[a];
	let bval = mode[1]>0?b:array[b];
	if (aval != 0)
		i = bval;
	else
		i += 3;
	console.log(format('Jumptrue {0}, {1}: {2} {3} ', a, b, mode[0]>0?a:format('(array[{0}}={1})', a, array[a]), aval!=0?format(' != 0, jumping to {0}', mode[1]>0?b:format('(array[{0}}={1})', b, array[b])):' == 0. Do nothing'));
}
var jumpfalse = (a, b, mode)=>{
	let aval = mode[0]>0?a:array[a];
	let bval = mode[1]>0?b:array[b];
	if (aval == 0)
		i = bval;
	else
		i += 3;
	console.log(format('Jumpfalse {0}, {1}: {2} {3} ', a, b, mode[0]>0?a:format('(array[{0}}={1})', a, array[a]), aval==0?format(' == 0, jumping to {0}', mode[1]>0?b:format('(array[{0}}={1})', b, array[b])):' != 0. Do nothing'));
}
var lt = (a, b, c, mode)=>{
	let aval = mode[0]>0?a:array[a];
	let bval = mode[1]>0?b:array[b];
	let res = aval<bval?1:0;
	array[c] = res;
	console.log(format('Less than {0}, {1}, {2}: {3} < {4} is {5}, array[{2}]={6}', a, b, c, mode[0]>0?a:format('(array[{0}}={1})', a, array[a]), mode[1]>0?b:format('(array[{0}}={1})', b, array[b]), aval<bval?'true':'false', res));
}
var eq = (a, b, c, mode)=>{
	let aval = mode[0]>0?a:array[a];
	let bval = mode[1]>0?b:array[b];
	let res = aval==bval?1:0;
	array[c] = res;
	console.log(format('Equals {0}, {1}, {2}: {3} == {4} is {5}, array[{2}]={6}', a, b, c, mode[0]>0?a:format('(array[{0}}={1})', a, array[a]), mode[1]>0?b:format('(array[{0}}={1})', b, array[b]), aval==bval?'true':'false', res));
}

var array = $('pre').innerText.split(','); 
//var array = '3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99'.split(',');
i=0; array.forEach((a,i)=>{array[i]=parseInt(a);})
inputPointer = 0;
var inputArray = [5];
var outputArray = [];
var i = 0;
cntr = 0
while(cntr<1000) {
	var op = ('0000' + array[i].toString()).slice(-5);
	var mode = op.substr(0, op.length-2).split('').reverse().join('');
	console.log('op: ' + op + ' | mode: ' + mode);
	switch (op.slice(-2)) {
		case '01': add(array[i+1], array[i+2], array[i+3], mode); i+=4; break;
		case '02': mult(array[i+1], array[i+2], array[i+3], mode); i+=4; break;
		case '03': input(array[i+1]); i+=2; break;
		case '04': output(array[i+1], mode); i+=2; break;
		case '05': jumptrue(array[i+1], array[i+2], mode); break;
		case '06': jumpfalse(array[i+1], array[i+2], mode); break;
		case '07': lt(array[i+1], array[i+2], array[i+3], mode); i+=4; break;
		case '08': eq(array[i+1], array[i+2], array[i+3], mode); i+=4; break;
		case '99': break;
		default: break;
	}
	if (op==99) break;
	cntr++;
}
console.log(outputArray[outputArray.length-1]);



// --------------- 6 ---------------
var array = $('pre').innerText.split('\n');array.pop();

var root = {};
root.name = 'COM';
root.parent = null;
root.orbits = [];
root.depth = 0;
var cnt = 0;
var you = null;
function getOrbits(node) {
	if (cnt>1000000) return;
	var orbits = array.filter((a)=>a.substr(0,a.indexOf(')'))==node.name);
	orbits.forEach((orbit)=>{
		var newnode = {};
		newnode.name = orbit.substr(orbit.indexOf(')')+1)
		newnode.parent = node;
		newnode.depth = node.depth+1;
		newnode.orbits = [];
		getOrbits(newnode);
		cnt+=newnode.depth;
		node.orbits.push(newnode);
		if (newnode.name == 'YOU') you = newnode;
	});
}
getOrbits(root);
// 6.1
console.log(cnt);
// 6.2
var cnt = 0;
var found = false;
var path = "";
function findSanta(node, cnt, path) {
	var newpath = path + ' ' + node.name;
	if (node.name == 'SAN') {console.log(newpath); console.log(cnt-2); found = true; }
	if (found) { return; }
	if (node.visited) return;
	node.visited = true;
	if (node.parent != null) findSanta(node.parent, cnt+1, newpath + ' (');
	if (node.orbits != null) {
		node.orbits.forEach((a)=>{
			if (a==node) return; 
			findSanta(a, cnt+1, newpath+' )');
		});
	}
}
findSanta(you, 0, '');





