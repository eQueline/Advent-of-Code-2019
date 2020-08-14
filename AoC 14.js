//$('pre').innerText = '157 ORE => 5 NZVS\n165 ORE => 6 DCFZ\n44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL\n12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ\n179 ORE => 7 PSHF\n177 ORE => 5 HKGWZ\n7 DCFZ, 7 PSHF => 2 XJWVT\n165 ORE => 2 GPVTF\n3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT\n';
var text = $('pre').innerText;
var array = text.split('\n'); array.pop();
var reagents = [];
var reactions = [];
array.forEach((a)=>{
	let str = a.replace(/,/g,'').split(' ');
	let res = false;
	let i=0;
	let reaction, part;
	while(i<str.length) {
		if (i==0) {
			reaction = {};
			reaction.input = [];
			reaction.output = 0;
		}
		let unit = str[i++];
		if (unit == '=>') {
			res = true;
			continue;
		}
		if (!isNaN(parseInt(unit))) {
			part = {};
			part.q = parseInt(unit);
		} else {
			part.e = unit;
			//reagents[unit] = 0;
			if (!res)
				reaction.input.push(part);
			else
				reaction.output = part.q;
		}
	}
	reactions[part.e] = reaction;
});

function createFuel(n) {
	var inputs = [];
	reagents = [];
	reagents.ORE=0;
	var needs = [{q:n, e:'FUEL'}];
	while(needs.length > 0) {
		let need = needs[0];
		let e = need.e;
		if (reagents[e] == null) reagents[e] = 0;
		if (reagents[e] >= need.q) {
			reagents[e] -= need.q;
			needs.shift();
			continue;
		}
		let quantity = need.q - reagents[e];
		needs.shift();
		reagents[e] = 0;
		
		let output = reactions[e].output;
		let q = Math.ceil(quantity/output); // reactions needed
		if (reagents[need.e] == null) reagents[need.e] = 0;
		reagents[need.e] += q*output - quantity; // leftovers
		reactions[e].input.forEach((input)=>{
			if (input.e == 'ORE') reagents.ORE += q * input.q;
			else {
				let newneed = {};
				newneed.q = q * input.q;
				newneed.e = input.e;
				needs.push(newneed);
			}
		});
	}
	return reagents.ORE;
}
// 14.1
console.log(createFuel(1));

// 14.2
var orePerFuel = createFuel(1);
var minFuel = Math.round(1e12/orePerFuel);
var ore = 0;
while (ore < 1e12) {
	minFuel = Math.round(minFuel*1.01);
	ore = createFuel(minFuel);
}
minFuel = Math.floor(minFuel/1.01);
ore = 0;
while (ore < 1e12) {
	minFuel = Math.round(minFuel*1.0001);
	ore = createFuel(minFuel);
}
minFuel = Math.floor(minFuel/1.0001);
ore = 0;
while (ore < 1e12) {
	minFuel++;
	ore = createFuel(minFuel);
}
console.log((minFuel-1) + ' fuel for ' + createFuel(minFuel-1) + ' ore');