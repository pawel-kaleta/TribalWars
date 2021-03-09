var cords = '412|370 427|356 432|357 430|363 432|361 432|362 432|363 436|346 434|342 438|342 422|339 419|339 405|332 407|326 417|329 418|333 427|367 429|367 435|358 427|371 417|377 416|380 409|378 410|379 412|380 408|382 407|382 408|383 408|384 405|388 403|387 402|387 402|388 402|389 404|390 400|389 400|391 399|391 398|387 398|393 400|394 398|395 397|395 394|394 393|394 393|395 391|393 392|397 396|398 393|400 395|404 394|405 390|410 390|411 394|412 386|414 385|414 383|414 382|413 384|416 383|416 384|417 383|417 386|421 380|416 379|414 379|410 379|409 374|410 373|410 373|409 372|411 370|410 370|412 369|412 368|410 370|415 367|408 368|407 368|406 370|406 369|405 371|406 371|405 369|401 369|400 364|405 365|409 376|420 384|424 384|425 385|425 384|427 383|428 385|429 386|428 385|430 387|429 388|429 388|428 387|428 390|435 390|434 391|435 390|438 391|438 381|445 380|447 371|447 369|449 369|450 368|450 367|451 367|450 366|450 366|451 367|452 366|452 360|453 366|454 366|455 364|455 362|456 358|460 366|462 367|461 363|461 364|459 358|463 360|464 361|464 362|464 363|464 364|464 358|466 357|466 357|467 361|467 362|466 352|469 357|471 359|469 353|472 357|476 352|475 346|478 348|480 358|482 356|481 359|478 360|477 358|486 356|485 354|487 361|487 356|489 355|489 362|496 362|497 361|497 360|498 365|500 364|498 365|499 365|498 365|497 358|501 352|495 357|493 358|493 353|501 353|502 349|510 324|492 319|492 316|493 314|492 317|486 318|480 315|481 314|480 324|475 324|468 321|456 318|458 322|453 324|453 316|454 314|485 313|488 312|493';

//DO NOT EDIT BELOW

var players = [];

$.ajax({
	url: 'https://media.innogamescdn.com/com_DS_PL/skrypty/HermitowskiePlikiMapy.js?_=' + ~~(Date.now() / 9e6),
	dataType: 'script',
	cache: true
}).then(() => {	aaa(); });

async function aaa() {
	const settings = {
		entities: {
			'village': ['x', 'y', 'player_id'],
			'player': ['id', 'name']
		}
	};
	
	var world = await get_world_info(settings);
	
	cords = cords.split(' ');
	var string = '';
	for (var i=0; i<cords.length; i++) {
		for (var j=0; j<world.village.length; j++) {
			if (world.village[j].x == cords[i].split('|')[0] && world.village[j].y == cords[i].split('|')[1]) {
				for (var k=0; k<world.player.length; k++) {
					if (world.player[k].id == world.village[j].player_id) {
						players.push('[player]'+world.player[k].name+'[/player]');
						j=world.village.length;
						k=world.player.length;
					}
				}
			}
		}
		if (i+1 > players.length) { players.push('???'); }
	}
	
	var list = [];
	
	for(var i=0; i<cords.length; i++) {
		list.push({cords: cords[i], player: players[i]});
	}
	
	function compare(a, b) {
		return b.player.localeCompare(a.player);
	}
	
	list.sort(compare);
	
	for (var i=0; i<list.length; i++) {
		if (!list[i-1] || list[i-1].player != list[i].player) {
			string += '\n' + list[i].player + '\n';
		}
		string += '- ' + list[i].cords + '\n';
	}
	
	var gui = `<textarea rows='5' cols='50'>[spoiler=lista]${string}[/spoiler]</textarea>`;

	Dialog.show('bla bla', gui);
}
