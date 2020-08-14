var text = $('pre').innerText.slice(0, -1);
text='03036732577212944063491565474664\n'; text = text.slice(0,-1);
//text = text.repeat(10000);
var array = text.split('');

var pattern = ["0","1","0","-1"];
// 16.1
var mults = [];
for (let i=0; i<array.length; i++) {
	let mult = [];
	for (let j=0; j<array.length+1; j++) {
		for (let k=0; k<i+1; k++) {
			mult.push(pattern[j%4]);
		}
		if (mult.length>array.length+1) break;
	}
	mult.shift();
	mult.splice(array.length);
	mults.push(mult);
}
function step() {
	var next = [];
	for (let i=0; i<array.length; i++) {
		var val = 0;
		for (let j=0; j<mults.length; j++) {
			val += array[j] * mults[i][j];
		}
		next.push(val.toString().slice(-1));
	}
	array = next;
	//console.log(array.join(''));
}
for (let i=0; i<100; i++) {
	step();
}
console.log(array.join(''));
console.log(array.join('').substr(0,8));


// 16.2
var cnt=0;
text=$('pre').innerText.slice(0, -1);
var array = [];
var copy = text.split('').map((a)=>parseInt(a));
var messageLength = parseInt(text.substr(0,7));
var arrayLength = copy.length*10000 - messageLength;
while (array.length<arrayLength) {
	cnt++;
	array = array.concat(copy);
}
array = array.slice(-arrayLength);
/*for (let j=0; j<9; j++) {
	let sum = 0;
	let slice = array.slice(j-9);
	for (let i=0; i<slice.length; i++) {
		sum += slice[i]*1;
	}
	sum = Math.abs(sum)%10;
	console.log('  '.repeat(j) + array.slice(j-9).join(' ') + ' | ' + sum);
}*/
function step() {
	let next = [];
	let sum = 0;
	//console.log('Slice: ' + slice.join(' '));
	for (let i=array.length-1; i>=0; i--) {
		cnt++;
		//console.log('Next = ' + sum + ' + ' + array[i]);
		sum = (sum + array[i])%10;
		next[i] = sum;
	}
	array = next;
	//console.log('Next:  ' + next.join(' '));
}
for (let i=0; i<100; i++) {
	step();
}
console.log(array.slice(0,8).join(''));