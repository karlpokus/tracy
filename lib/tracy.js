const http = require('http');
const url = require('url');

const capture = (placement, obj, meths, hook) => {
	if(!obj) return false;
	if(!Array.isArray(meths)) meths = [meths];

	meths.forEach(function(meth) {
    var orig = obj[meth];
    if(!orig) return;

    var wrapper = function() {
			var ret, hookRet;

			if (placement.after) {
				ret = orig.apply(this, arguments);
				hookRet = hook(this, arguments, ret);
				return hookRet || ret;
			}
			hookRet = hook(this, arguments);
			return orig.apply(this, arguments);
    };

		obj[meth] = function() {
			return wrapper.apply(this, arguments);
		};
  });
};

//capture({after: true}, module.__proto__, 'require', (obj, args, ret) => {});

capture({before: true}, http.Server.prototype, ['on', 'addListener'], (obj, args) => {
	if(args[0] !== 'request') return;

	const serverRequestCallback = ogcb => {
		return function(req, res) {
			const { href } = url.parse(req.url, true);
			console.log(`server incoming ${ href }`);

			//capture({after: true}, res, 'writeHead', function(obj){});
			capture({before: true}, res, 'end', function(obj, args){
				console.log(`server response ${ args[0] }`);
			});
			return ogcb.apply(this, arguments);
	  };
	};

	var cbIndex = args.length -1;
	args[cbIndex] = serverRequestCallback(args[cbIndex]);
});

// if node core or axios
capture({before: true}, http, 'request', (obj, args) => {
	const path = (typeof args[0] === 'string')? args[0]: args[0].path;
	console.log(`client outgoing ${ path }`);

	const clientResponseDone = ogcb => {
		return function() {
			console.log('client response done');
			return ogcb.apply(this, arguments);
		};
	};
	const clientRequestCallbackWrapper = ogcb => {
		return function(res) {
			capture({before: true}, res, ['on'], (obj, args) => { // maybe add onListener too?
				if (args[0] === 'end') {
					var cbIndex = args.length -1;
					args[cbIndex] = clientResponseDone(args[cbIndex]);
				}
			});

			return ogcb.apply(this, arguments);
		};
	};
	const cbIndex = args.length -1;
	args[cbIndex] = clientRequestCallbackWrapper(args[cbIndex]);
});

/* if request lib
capture({after: true}, http, 'request', (obj, args, ret) => {
	console.log(`client outgoing ${ args[0].path }`);

	const clientResponseDone = ogcb => {
		return function() {
			console.log('client response done');
			return ogcb.apply(this, arguments);
		};
	};

	capture({before: true}, ret, ['on'], (obj, args) => { // ret on response
		if (args[0] === 'response') {
			var cbIndex = args.length -1; // cb to response event
			args[cbIndex] = clientResponseDone(args[cbIndex]);
		}
	});
});*/
