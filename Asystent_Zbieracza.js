javascript:
//	author:		PabloCanaletto
//	version:	2.0
//	history of changes:
//		1.0 - 31.03.2019 by PabloCanaletto
//		2.0 - 24.05.2019 by PabloCanaletto
//			fixed bugs:
//				1. negative outputs when "untouchable" > available units
//				2. keyboard shortcut in output
//			added functionalities:
//				1. worlds without archers
//				2. max_ressources setting
//				3. skip_level_1 setting
//					
//	disclaimer:	You are free to use this script in any way you like and to submit changes.
//				I would only appreciate you to leave notification about my orginal authorship untouched
//				with the whole history of changes.

// FUNCTIONALITY
// This script fills forms in scavenge tab. It selects troops to send on consecutive levels in a way,
// so time is distributed evenly. Levels go from right to left.

// SETTINGS
//
// max_ressources - max amount of resources to gather from one level (rounding may cause some reduction)
// archers - is the world with archers (1 - yes, 0 - no)
// skip_level_1 - do you want to skip 1 level (the least efficient one) when others are unlocked?
//
// untouchable - troops "invisible" for this script, to be completely ignored
// max_unit_number - at most this number of troops of a kind will be send in total
// conditional_safeguard - troops to leave in village if possible in total, but if not, they will be send


var settings = {
	max_ressources: '99999',
	archers: '0',
	skip_level_1: '0'
};

var settings_spear = {
	untouchable: '0',
	max_unit_number: '9999',
	conditional_safeguard: '0'
};

var settings_sword = {
	untouchable: '0',
	max_unit_number: '9999',
	conditional_safeguard: '0'
};

var settings_axe = {
	untouchable: '0',
	max_unit_number: '9999',
	conditional_safeguard: '0'
};

var settings_archer = {
	untouchable: '0',
	max_unit_number: '9999',
	conditional_safeguard: '0'
};

var settings_light = {
	untouchable: '0',
	max_unit_number: '9999',
	conditional_safeguard: '0'
};

var settings_marcher = {
	untouchable: '0',
	max_unit_number: '9999',
	conditional_safeguard: '0'
};

var settings_heavy = {
	untouchable: '0',
	max_unit_number: '9999',
	conditional_safeguard: '0'
};


function fill(unit, number) {
	let field = $(`[name=${unit}]`);
	number = Number(number);
	field.trigger('focus');
	field.trigger('keydown');
	field.val(number);
	field.trigger('keyup');
	field.trigger('change');
	field.blur();
}
var units_settings = {
	0: settings_spear,
	1: settings_sword,
	2: settings_axe,
	3: settings_archer,
	4: settings_light,
	5: settings_marcher,
	6: settings_heavy
};

var units = {
	0: 'spear',
	1: 'sword',
	2: 'axe',
	3: 'archer',
	4: 'light',
	5: 'marcher',
	6: 'heavy'
};

var units_capacity = [25,15,10,10,80,50,50];
var to_send = [0,0,0,0,0,0,0];

var doc=document;
url=doc.URL;
if(url.indexOf('screen=place')==-1 || url.indexOf('mode=scavenge')==-1)
	alert('Skrypt do użycia w placu w zakładce zbieractwo');
else{
	var unfree_levels = doc.getElementsByClassName('btn btn-default free_send_button btn-disabled');
	var unlocked_levels = doc.getElementsByClassName('btn btn-default free_send_button');
	var free_levels = unlocked_levels.length - unfree_levels.length;

	if(free_levels == 0)
		alert('Brak dostępnych poziomów zbieractwa');
	else{
		if(unlocked_levels.length > 1 && free_levels == 1 && settings.skip_level_1 == 1)
			alert('Ustawiono pominięcie 1 poziomu zbieractwa');
		else{
			let unit;
			for(var i = 0; i<7; i++){
				if(settings.archers == 0)
					if(i==3 || i==5)
						i++;
				if(units_settings[i].max_unit_number > 0){
					unit = units[i];
					let field = $(`[name=${unit}]`)
					let available = Number(field[0].parentNode.children[1].innerText.match(/\d+/)[0]);
					
					if(available > units_settings[i].untouchable)
						available -= units_settings[i].untouchable;
					else
						available = 0;
					
					if(available >= units_settings[i].conditional_safeguard)
						available -= units_settings[i].conditional_safeguard;
					
					if(unlocked_levels.length == 1){
						if(available > units_settings[i].max_unit_number)
							available = units_settings[i].max_unit_number;
						to_send[i] = available;
					}
					else{
						let packs = 0;
						if(settings.skip_level_1 == 0)
							packs += 15;
						if(unlocked_levels.length >= 2)
							packs += 6;
						if(unlocked_levels.length >= 3)
							packs += 3;
						if(unlocked_levels.length == 4)
							packs += 2;
						
						let left_packs = 0;
						let packs_now;
						
						if(free_levels >= 1 && settings.skip_level_1 == 0){
							packs_now = 15;
							left_packs += 15;
						}
						if(free_levels >= 2){
							packs_now = 6;
							left_packs += 6;
						}
						if(free_levels >= 3){
							packs_now = 3;
							left_packs += 3;
						}
						if(free_levels ==4){
							packs_now = 2;
							left_packs += 2;
						}
						
						if(available*packs/left_packs > units_settings[i].max_unit_number)
							to_send[i] = units_settings[i].max_unit_number*packs_now/packs;
						else
							to_send[i] = available*packs_now/left_packs;
					}
				}
			}
		
			let capacity = 0;
			for(var i = 0; i<7; i++){
				if(settings.archers == 0)
					if(i==3 || i==5)
						i++;
				capacity += units_capacity[i] * to_send[i];
			}
			
			if(free_levels == 1){
				settings.max_ressources *= 10;
			}
			else if(free_levels == 2){
				settings.max_ressources *= 4;
			}
			else if(free_levels == 3){
				settings.max_ressources *= 2;
			}
			else{
				settings.max_ressources *= 1.3333;
			}
			
			if(capacity > settings.max_ressources){
				let ratio = settings.max_ressources / capacity;
				for(var i = 0; i<7; i++){
					if(settings.archers == 0)
						if(i==3 || i==5)
							i++;
					to_send[i] = to_send[i] * ratio;
				}
			}
			
			for(var i = 0; i<7; i++){
				if(settings.archers == 0)
					if(i==3 || i==5)
						i++;
				unit = units[i];
				fill(unit, Math.floor(to_send[i]));
			}
		}
	}
} 
