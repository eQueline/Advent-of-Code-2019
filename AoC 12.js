var moons_init = [[13,-13,-2,0,0,0],[16,2,-15,0,0,0],[7,-18,-12,0,0,0],[-3,-8,-8,0,0,0]];
var moons = [];
function draw() {
	moons.forEach((a)=>{
		console.log('pos=<x='+a[0]+', y='+a[1]+', z='+a[2]+'>, vel=<x='+a[3]+', y='+a[4]+', z='+a[5]+'>');
		//console.log(Math.sign(a[0]) + ' ' + Math.sign(a[1]) + ' ' + Math.sign(a[2]) + ' ' + Math.sign(a[3]) + ' ' + Math.sign(a[4]) + ' ' + Math.sign(a[5]));
	});
}

function run(b, steps) {
	moons = [[13,-13,-2,0,0,0],[16,2,-15,0,0,0],[7,-18,-12,0,0,0],[-3,-8,-8,0,0,0]];
	var step = 0;
	while (typeof(steps)=='undefined' || step<steps) {
		step++;
		if (step>10000000) return -1;
		moons.forEach((a,i)=>{
			for (let m=0; m<moons.length; m++) {
				if (m==i) continue;
				moons[i][3] += Math.sign(moons[m][0]-moons[i][0]);
				moons[i][4] += Math.sign(moons[m][1]-moons[i][1]);
				moons[i][5] += Math.sign(moons[m][2]-moons[i][2]);
			}
		});
		moons.forEach((a,i)=>{
			moons[i][0] += moons[i][3];
			moons[i][1] += moons[i][4];
			moons[i][2] += moons[i][5];
		});
		if (typeof(steps)=='undefined' && step > 1000
		&& moons[0][b]==moons_init[0][b] && moons[0][b+3]==moons_init[0][b+3]
		&& moons[1][b]==moons_init[1][b] && moons[1][b+3]==moons_init[1][b+3]
		&& moons[2][b]==moons_init[2][b] && moons[2][b+3]==moons_init[2][b+3]
		&& moons[3][b]==moons_init[3][b] && moons[3][b+3]==moons_init[3][b+3]) {
			//console.log('Position and velocity of all ' + (b==0?'x':(b==1?'y':'z')) + ' coordinates repeated at ' + step + ' steps');
			return step;
		}

	}
	//console.log('After ' + step + ' steps:');
	//draw();
}

// 12.1
run(0,1000);
var energy = 0;
moons.forEach((a)=>{
	energy += (Math.abs(a[0])+Math.abs(a[1])+Math.abs(a[2]))*(Math.abs(a[3])+Math.abs(a[4])+Math.abs(a[5]));
});
console.log(energy);


// 12.2
function lcm(x, y) {
  return (!x || !y) ? 0 : Math.abs((x * y) / gcd(x, y));
}

function gcd(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  while(y) {
    var t = y;
    y = x % y;
    x = t;
  }
  return x;
}
console.log(lcm(run(0),lcm(run(1),lcm(run(2),run(4)))));
