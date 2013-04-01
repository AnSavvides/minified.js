window.miniTests.push.apply(window.miniTests, [
	{
		name: "MINI().set(null)",
	 	exec: function() {
	 		var l = MINI('#container2').add(EE('span', {'@id':'hello'}, 'hello'));
	 		l.set(null);
			check(l[0].childNodes.length, 1);
			check(!l[0].className);
		}
	},
	{
		name: "MINI().set(name, value)",
	 	exec: function() {
	 		MINI().set('a', 1); // test empty set
	 		
	 		var o = [{a:3, b: 'hello', style: {}, y: {v: 2, w: {}}}, {style: {}, x: {}, y: {w: {}}}];
	 		MINI(o).set('a', 33).set('b', 'greetings').set('c', 132).set('d', {a:1})
	 		 .set('$color', '#abc').set('$ab', 2);
	 		
	 		for (var i = 0; i < o.length; i++) {
	 			var b = o[i];
	 			check(b.a, 33);
	 			check(b.b, 'greetings');
	 			check(b.c, 132);
	 			check(b.d.a, 1);
	 			check(b.style.color, '#abc');
	 			check(b.style['ab'], 2);
	 		}
	 		
	 		$('#container2').add([EE('span', {'@id':'hello1', 'className':'hello'}, 'hello'),
	 		EE('span', {'@id':'hello2', 'className':'hello'}, 'hello')]);
	 		MINI('#container2 span').set('className', 'hi').set('@title', 'hello element');
	 		check(document.getElementById('hello1').getAttribute('class') == 'hi' || document.getElementById('hello1').getAttribute('className') == 'hi');
	 		check(document.getElementById('hello2').getAttribute('class') == 'hi' || document.getElementById('hello2').getAttribute('className') == 'hi');
	 		check(document.getElementById('hello1').getAttribute('title'), 'hello element');
	 		check(document.getElementById('hello2').getAttribute('title'), 'hello element');
	 		MINI('#hello2').add(EE('b', {'@id':'bello2'}, 'bello'));
		}
	},
	{
		name: "MINI().set(map)",
	 	exec: function() {
	 		MINI().set({a: 1}); // test empty set
	 		
	 		var o = [{a:3, b: 'hello', style: {}, y: {v: 2, w: {}}}, {a:2, b: 'hi', style: {}, x: {}, y: {w: {}}}];
	 		MINI(o).set({a: 33, b: 'greetings', c: 132, d: {a:1},
	 			$color: '#abc', $ab: 2});
	 		
	 		for (var i = 0; i < o.length; i++) {
	 			var b = o[i];
	 			check(b.a, 33);
	 			check(b.b, 'greetings');
	 			check(b.c, 132);
	 			check(b.d.a, 1);
	 			check(b.style.color, '#abc');
	 			check(b.style['ab'], 2);
	 		}
	 		
	 		MINI('#container2').add(EE('span', {'@id':'hello1', 'className':'hello'}, 'hello'))
	 			.add(EE('span', {'@id':'hello2', 'className':'hello'}, 'hello'));
	 		MINI('#container2 span').set({'className': 'hi', '@title': 'hello element'});
	 		check(document.getElementById('hello1').getAttribute('class') == 'hi' || document.getElementById('hello1').getAttribute('className') == 'hi');
	 		check(document.getElementById('hello2').getAttribute('class') == 'hi' || document.getElementById('hello2').getAttribute('className') == 'hi');
	 		check(document.getElementById('hello1').getAttribute('title'), 'hello element');
	 		check(document.getElementById('hello2').getAttribute('title'), 'hello element');
		}
	},

	{
		name: "MINI().set(name, function)",
	 	exec: function() {
	 		var undef;
	 		MINI().set('f', 1); // test empty set
	 		
	 		var cnt = 0;
	 		var ar = [{a:3}, {a:2}, {a:11}];

	 		MINI(ar).set('a', 33, function(oldValue, index, obj, newValue) {
	 			check(index, cnt++);
	 			check(oldValue, ar[index].a);
	 			check(ar[index] === obj);
	 			check(newValue, 33);
	 			return oldValue + newValue;
	 		});
	 		check(ar[0].a, 36);
	 		check(ar[1].a, 35);
	 		check(ar[2].a, 44);


	 		cnt = 0;
	 		MINI(ar).set('a', function(oldValue, index) {
	 			check(index, cnt++);
	 			check(oldValue, ar[index].a);
	 			return oldValue + 1;
	 		},  function(){});

	 		check(ar[0].a, 37);
	 		check(ar[1].a, 36);
	 		check(ar[2].a, 45);
	 		
	 		cnt = 0;
	 		MINI(ar).set('a', function(oldValue, index) {
	 			check(index, cnt++);
	 			check(oldValue, ar[index].a);
	 			return oldValue + 12;
	 		});
	 		check(ar[0].a, 49);
	 		check(ar[1].a, 48);
	 		check(ar[2].a, 57);
	 		
	 		cnt = 0;
	 		MINI(ar).set({a: function(oldValue, index) {
	 			check(index, cnt++);
	 			check(oldValue, ar[index].a);
	 			return oldValue - 40;
	 		}});
	 		check(ar[0].a, 9);
	 		check(ar[1].a, 8);
	 		check(ar[2].a, 17);
	 		
	 		cnt = 0;
	 		MINI(ar).set({a: 2}, undef, function(oldValue, index, obj, newValue) {
	 			check(index, cnt++);
	 			check(oldValue, ar[index].a);
	 			check(newValue, 2);
	 			return oldValue + newValue;
	 		});
	 		check(ar[0].a, 11);
	 		check(ar[1].a, 10);
	 		check(ar[2].a, 19);
		}
	},
	
	{
		name: "set() name check exception (debug)",
		debugFailure: "set name check did not work.",
		exec: function() {
			MINI('#container2').set();
		}
	},
	{
		name: "set() 2nd arg exception (debug)",
		debugFailure: "2nd arg check did not work.",
		exec: function() {
			MINI('#container2').set({a:1}, "foobar");
		}
	},

	
	{
		name: "MINI().get(property)",
	 	exec: function() {
			check(MINI('#a').get('title'), 'tititi');
			check(MINI('#a').get('id'), 'a');
			check(MINI('#a').get('ddsffdsf'), null);
		}
	},

	{
		name: "MINI().get(attribute)",
	 	exec: function() {
			check(MINI('#a').get('@title'), 'tititi');
			check(MINI('#a').get('@id'), 'a');
			check(MINI('#a').get('@ddsffdsf'), null);
		}
	},

	{
		name: "MINI().get(style)",
	 	exec: function() {
			check(MINI('#a').get('$marginTop'), '5px');
			check(MINI('#a_b').get('$marginTop'), '2px');
			check(MINI('#c').get('$marginTop'), '0px');
		}
	},

	{
		name: "MINI().get(name, toNumber)",
	 	exec: function() {
			check(MINI('#a').get('$marginTop', true), 5);
			check(MINI('#a_b').get('$marginTop', true), 2);
			check(MINI('#c').get('$marginTop', true), 0);
			check(isNaN(MINI('#a').get('@id', true)));
		}
	},

]);
