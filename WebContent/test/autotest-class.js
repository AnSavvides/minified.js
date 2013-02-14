window.miniTests.push.apply(window.miniTests, [
  	{
		name:'MINI().hasClass()',
		exec: function() {
			var s1, s3;
			$('#container2').add(s1 = MINI.el('div', {'className': 'a b c d e'}))
					.add(MINI.el('div', {'className': ''}, []))
					.add(s3 = MINI.el('div', {'className': 'a d f'}, []));
			var m = MINI('#container2 div');
			check(m.hasClass('a'), s1[0], true);
			check(m.hasClass('b'), s1[0], true);
			check(m.hasClass('c'), s1[0], true);
			check(m.hasClass('d'), s1[0], true);
			check(m.hasClass('e'), s1[0], true);
			check(m.hasClass('f'), s3[0], true);
			check(!m.hasClass('x'));
		}
	},
	{
		name:'MINI().set("$", "-")',
		exec: function() {
			var s1 = MINI.el('div', {'className': 'a b c d e'})()[0];
			var m = MINI(s1);
			m.set('$', '-x');
			check(s1.className, 'a b c d e');
			m.set('$', '-a');
			check(s1.className, 'b c d e');
			m.set('$', '-e');
			check(s1.className, 'b c d');
			m.set('-c');
			check(s1.className, 'b d');
			m.set('-b');
			check(s1.className, 'd');
			m.set('-d');
			check(s1.className, '');
			m.set('-c');
			check(s1.className, '');
		}
	},
	{
		name:'MINI().set("$", "+")',
		exec: function() {
			var s1 = MINI.el('div')()[0];
			var s2 = MINI.el('div', {'className':''})()[0];
			var m = MINI([s1, s2]);
			m.set('$', '+a');
			check(s1.className, 'a');
			check(s2.className, 'a');
			m.set('$', '+a');
			check(s1.className, 'a');
			check(s2.className, 'a');
			m.set({$: '+b'});
			check(s1.className, 'a b');
			check(s2.className, 'a b');
			m.set('+a');
			check(s1.className, 'b a');
			check(s2.className, 'b a');
			m.set('+b');
			check(s1.className, 'a b');
			check(s2.className, 'a b');
			m.set('+c');
			check(s1.className, 'a b c');
			check(s2.className, 'a b c');
		}
	},
	{
		name:'MINI().set("$", "class")',
		exec: function() {
			var s1 = MINI.el('div', {'className': 'a b c'})()[0];
			var s2 = MINI.el('div')()[0];
			var m = MINI([s1, s2]);
			m.set('$', 'a');
			check(s1.className, 'b c');
			check(s2.className, 'a');
			m.set('$', 'b');
			check(s1.className, 'c');
			check(s2.className, 'a b');
			m.set('$', 'c');
			check(s1.className, '');
			check(s2.className, 'a b c');
			m.set('x');
			check(s1.className, 'x');
			check(s2.className, 'a b c x');
			m.set('x');
			check(s1.className, '');
			check(s2.className, 'a b c');
		}
	},
	{
		name:'MINI().set("$", mix)',
		exec: function() {
			var s1 = MINI.el('div', {'className': 'a b c'})()[0];
			var s2 = MINI.el('div')()[0];
			var m = MINI([s1, s2]);
			m.set('$', 'a b c');
			check(s1.className, '');
			check(s2.className, 'a b c');
			m.set({$: 'a d'});
			check(s1.className, 'a d');
			check(s2.className, 'b c d');
			m.set('a +d');
			check(s1.className, 'd');
			check(s2.className, 'b c a d');
			m.set('a +d -c');
			check(s1.className, 'a d');
			check(s2.className, 'b d');
		}
	}
]);
