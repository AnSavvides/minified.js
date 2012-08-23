function checkFunc(setSuccess, func) {
	try {
		func();
		setSuccess(true);
	}
	catch (e) {
		setSuccess(false, e);
	}
}

window.miniTests.push.apply(window.miniTests, [
	{
		name:'animate()',
		async: 1000,
		exec: function(setSuccess, playground) {
			var s;
			$(playground).add(s = MINI.el('span', {'@title': 0, $marginTop: '20px', $backgroundColor: '#000'})[0]);
			$(s).animate({'@title': 50, $marginTop: '2px', $backgroundColor: '#ff0'}, 300, 0, function() {
				checkFunc(setSuccess, function() {
					check(s.getAttribute('title'), 50);
					check(s.style.marginTop, '2px');
					check((s.style.backgroundColor == '#ff0') || (s.style.backgroundColor == '#ffff00') || (s.style.backgroundColor == 'rgb(255, 255, 0)'));
				});
			}, 100);
			
			check(s.getAttribute('title'), 0);
			check(s.style.marginTop, '20px');
			check((s.style.backgroundColor == '#000') || (s.style.backgroundColor == '#000000') || (s.style.backgroundColor == 'rgb(0, 0, 0)'));
		}
	},
	{
		name:'MINI.request()',
		async: 1000,
		exec: function(setSuccess, playground) {
			var s = MINI.request('get', '/minified.js/test/test.txt', null, function(txt) {
				checkFunc(setSuccess, function() {
					check(txt.indexOf('Used for testing MINI.request.') > 0);
				});
			}, function() {
				setSuccess(false, 'onFailure called, but should not be called');
			});
			
			check(!!s);
		}
	},
	{
		name:'MINI.request() 404 error',
		async: 1000,
		exec: function(setSuccess, playground) {
			var s = MINI.request('get', 'doesnotexist.txt', null, function(txt) {
				setSuccess(false, 'onSuccess called, but should be 404');

			}, function(status) {
				checkFunc(setSuccess, function() {
					check(status,  404);
				});
			});
			
			check(!!s);
		}
	}
]);