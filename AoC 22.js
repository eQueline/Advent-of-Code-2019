var text = $('pre').innerText.slice(0, -1);
//text = 'deal into new stack\ncut -3\ndeal with increment 7\ncut 4\ncut -3\ndeal into new stack';
text = text.split('\n');
var deckCount = 10007n;
var pos = 2019n;

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

var actions = [];
text.forEach((a)=>{
	let action = {};
	if (a.startsWith('deal into')) {
		action.action = 'R';
	}
	if (a.startsWith('deal with')) {
		action.action = 'D';
		action.arg = BigInt(a.match(/-?\d+/)[0]);
	}
	if (a.startsWith('cut')) {
		action.action = 'C';
		action.arg = BigInt(a.match(/-?\d+/)[0]);
	}
	actions.push(action);
});

function getActionCoefficients() {
	let a=1n,b=0n;
	actions.forEach((action)=>{
		switch (action.action) {
			case 'R':
				a = -a;
				b = -b + deckCount-1n;
				break;
			case 'C':
				b = b-action.arg;
				break;
			case 'D':
				a = a*action.arg;
				b = b*action.arg;
				break;
		}
		a = (a%deckCount+deckCount)%deckCount;
		b = (b%deckCount+deckCount)%deckCount;
	});
	return [a,b];
}
var coefficients = getActionCoefficients(1n,0n);
// 22.1
console.log(format('After 1 iteration element 2019 is in {0}th position ', parseInt((pos*coefficients[0]+coefficients[1])%deckCount)));

// 22.2
deckCount = 119315717514047n;
var iteration = 101741582076661n;
pos = 2020n;
function applyCoef(coef1, coef2, verbose=false) {
	let ka = (coef1[0]*coef2[0])%deckCount;
	let kb = (coef2[0]*coef1[1]+coef2[1])%deckCount;
	if (verbose) console.log(format('[{0},{1}]x[{2},{3}]=[{4},{5}] (mod {6})',coef1[0], coef1[1], coef2[0], coef2[1], ka, kb, deckCount));
	return [ka,kb];
}
function getiterationCoef(iterations, verbose=false) {
	let iterationCoef = [1n,0n];
	let iterationArray = iterations.toString(2).split('').reverse();
	if (verbose) console.log('Array: ' + iterationArray);
	let expCoef = coefficients;
	for (let i=0; i<iterationArray.length; i++) {
		if (i>0) {
			if (verbose) console.log(format('Doubling [{0},{1}]', expCoef[0], expCoef[1]));
			expCoef = applyCoef(expCoef, expCoef);
		}
		
		if (iterationArray[i]==1) {
			if (verbose) console.log('Applying');
			iterationCoef = applyCoef(iterationCoef, expCoef);
		}
	}
	return iterationCoef;
}
var iterationsCoef = getiterationCoef(iteration);
//console.log('After ' + iteration + ' iterations coefficients are: ' + iterationsCoef);

var cycleCoef = getiterationCoef(deckCount-iteration-1n);
//console.log('After ' + (deckCount-iteration-1n) + ' iterations coefficients are: ' + cycleCoef);
posValue = (pos*cycleCoef[0]+cycleCoef[1])%deckCount;
console.log(format('After {0} iterations {1}th element is {2}', iteration, pos, posValue));
//applyCoef(iterationsCoef, cycleCoef, true); full cycle check