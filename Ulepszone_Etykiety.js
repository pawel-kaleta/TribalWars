javascript:
//	author:		PabloCanaletto
//	version:	1.1.0
//	history of changes:
//		1.0 - 28.04.2020 by PabloCanaletto
//			Initial Release
//		1.0.1 - 31.07.2020 by PabloCanaletto
//			HotFix - bug in URL of Ajax request
//		1.0.2 - 19.08.2020 by PabloCanaletto
//			HotFix - bug in calculating attack_speed
//		1.1.0 - 3.01.2021 by PabloCanaletto
//			Update - sitter handling
//					
//	disclaimer:	You are free to use this script in any way you like and to submit changes.
//				I would only appreciate you to leave this notification about my orginal authorship untouched
//				with the whole history of changes.

// FUNCTIONALITY
// This script upgrades attack labels by adding "send time [distance] time to enter watchtower range" at the end. It uses unit's name in base label for calculations.

var inc_commands, label;
var btn_tab = [];
var dialogBox = 
`<div align="center"><div><strong>Zmieni\u0107 nazw\u0119 ataku?</strong></div>
 <div><button class="btn" type="button" onclick="edit()" style="margin: 11px 0 3px 3px">Zatwierd\u017A</button></div></div>`;
var counter = 1;
var def,att;
var coords = {};
var attack_speed;
var WT_tab = [];
var worldConfig = {};
var t = (game_data.player.sitter !== '0') ? '&t=' + game_data.player.id : '';
 
function edit() {
    if (btn_tab.length != 0) {
        $(btn_tab.pop()).trigger('click');
        UI.InfoMessage('Zmieniono nazw\u0119 ataku #'+counter, 1000, 'success');
		if(btn_tab.length == 0) {
			UI.InfoMessage('Zmiany wprowadzone', 5000, 'success');
			Dialog.close();
		}
        counter++;
    }
}

function distance(p1,p2) { return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) }

function normalize_num(num) { return num < 10 ? "0" + num : num }
 
function dist_strait_point(p, prosta, mian) { return Math.abs(prosta.A*p.x + prosta.B*p.y + prosta.C) / mian; }

function detectionDist(r,a,b,c) { //bardzo skomplikowana geometria analityczna
	//r = promien wiezy
	//a = odleglosc atakowana - wieza
	//b = odleglosc atakujaca - wieza
	//c = odleglosc atakujaca - atakowana
	let pom = (a*a - b*b + c*c) / (2*c);
	//odleglosc atakowana - pkt. wejscia w zasieg:
	return pom + Math.sqrt( (r+a)*(r-a) + (pom*pom) );
}

function coordsFromName(name) {
	let a = name.match(/\d{3}\|\d{3}/g);
	a = a[a.length-1];
	let coords = {
		x: a.match(/\d{3}/g)[0],
		y: a.match(/\d{3}/g)[1]
	};
	return coords;
}

function normalizeDate(date) { return normalize_num(date.getDate()) + "." + normalize_num(parseInt(date.getMonth()+1)) + " o "  + normalize_num(date.getHours()) + ":"  + normalize_num(date.getMinutes()) + ":" + normalize_num(date.getSeconds()); }

function parse_date(date_string) {
    let time_offset = 0;
    const date_matches = date_string.match(/jutro|dzisiaj|\d+\.\d+(?:\.\d+)?/g);
    if (date_matches) { time_offset = date_string.indexOf(date_matches[0]) + date_matches[0].length; }
    const time_matches = date_string.slice(time_offset).match(/\d+(?::\d+)*/g);
    if (!time_matches || time_matches.length > 1 || (date_matches && date_matches.length > 1)) {
        conole.log('Nie rozpoznano formatu daty: "' + date_string + '"');
		return "error";
    }
    const today = new Date();
    const time_parts = time_matches[0].split(':').map(x => Number(x));
    const parts = {
        year: today.getFullYear(),
        month: today.getMonth(),
        date: today.getDate(),
        hours: time_parts[0],
        minutes: time_parts[1] || 0,
        seconds: time_parts[2] || 0,
    };
    if (date_matches) {
        const date_match = date_matches[0];
        switch (date_match) {
            case "jutro": parts.date = today.getDate() + 1; break;
            case "dzisiaj": break;
			default:
				const date_parts = date_match.split('.').map(x => Number(x));
				if (date_parts.length === 3) {
					if (date_parts[2] < 100) {
						date_parts[2] += 2000;
					}
					parts.year = date_parts[2];
                }
                parts.month = date_parts[1] - 1;
                parts.date = date_parts[0];
                break;
        }
    }
    const user_date = new Date(parts.year, parts.month, parts.date, parts.hours, parts.minutes, parts.seconds);
    if (!date_matches && user_date.getTime() < Date.now()) {
        user_date.setDate(user_date.getDate() + 1);
    }
    return user_date;
};

function getWorldConfig() {
	var wc;
	$.ajax({
		async: false,
		url: 'https://' + window.location.host + '/interface.php?func=get_config',
		dataType: 'xml',
		success: function(response){wc=response;}
	});
	return wc;
}

function watchTowers() {
	wt = [];
	$['ajax']({
		async: false,
		url: 'https://' + window.location.host + '/game.php?screen=overview_villages&mode=buildings&group=0&page=-1' + t,
		type: 'GET',
		success: function(response) {
			$(response).find("#buildings_table tbody tr").each(function(){
				if($(this).find(".b_watchtower")[0].innerText != "0"){
					let lvl = $(this).find(".b_watchtower")[0].innerText;
					let WT_vill = $(this).find('.quickedit-label')[0].innerText.trim();
					WT_vill = coordsFromName(WT_vill);
					wt.push({x: WT_vill.x, y: WT_vill.y, range: worldConfig.lvls[lvl-1]});
				}
			});
		}
	});
	return wt;
}

if (game_data.mode == 'incomings') {
	var config = getWorldConfig();
	
	worldConfig = {
		unit_speed_factor: Number($(config).find("config unit_speed").text()) * Number($(config).find("config speed").text()),
		lvls: [1.1, 1.3, 1.5, 1.7, 2, 2.3, 2.6, 3, 3.4, 3.9, 4.4, 5.1, 5.8, 6.7, 7.6, 8.7, 10, 11.5, 13.1, 15],
		unit_speed: [9,10,11,18,22,30,35],
		WT: Number($(config).find("config game watchtower").text())
	};
	
	if(worldConfig.WT) { WT_tab = watchTowers(); }
	
	init();
}
else {
	if (document.URL.indexOf("overview_villages") != -1 && document.URL.indexOf("mode=incomings") != -1) {
		UI.InfoMessage('Od\u015Bwie\u017C stron\u0119');
	}
	else {
		UI.InfoMessage('Skryptu nale\u017Cy u\u017Cywa\u0107 z przegl\u0105du przybywaj\u0105cych atak\xF3w!', 5000, 'error');
	}
}
 
function init() {
	inc_commands = $('#incomings_table tbody tr:not(:first-child, :last-child)');
	$.each($(inc_commands), function(){
		$(this).find('.quickedit').find('.rename-icon').trigger('click');
		label = $(this).find('.quickedit').find('input[type=text]').val();
 
		let found;
	
		switch (label) {
			case 'Zwiad':
				found = worldConfig.unit_speed[0];
				break;
			case 'LK':
				found = worldConfig.unit_speed[1];
				break;
			case 'CK':
				found = worldConfig.unit_speed[2];
				break;
			case 'Top\xF3r':
				found = worldConfig.unit_speed[3];
				break;
			case 'Miecz':
				found = worldConfig.unit_speed[4];
				break;
			case 'Taran':
				found = worldConfig.unit_speed[5];
				break
			case 'Szlachcic':
				found = worldConfig.unit_speed[6];
				break;
			default:
				found = false;
		}
 
		if (found) {
				attack_speed = 60000*found/worldConfig.unit_speed_factor;
				def = $(this).find('td');
				def = def[1];
				def = $(def).text();
				coords.atakowana = coordsFromName(def); 
 
				att = $(this).find('td');
				att = att[2];
				att = $(att).text();
				coords.atakujaca = coordsFromName(att); 
				 
				AttDistance = distance(coords.atakujaca,coords.atakowana);
				
				let TW_date_reaching = $(this).find('td')[5].innerText.trim();
				let date_reaching = parse_date(TW_date_reaching);
				
				let date_sent = new Date(date_reaching.getTime() - AttDistance*attack_speed);
				
				label = label + " " + normalizeDate(date_sent) + " [" + Math.floor(AttDistance) + "]";
				
				if($(this).find('span.commandicon-wt')[0] && WT_tab[0]){
					
					//prosta przez dwa punkty, postac ogolna
					let prosta = { 
						A: coords.atakujaca.y - coords.atakowana.y,
						B: coords.atakowana.x - coords.atakujaca.x,
						C: coords.atakujaca.x*(coords.atakowana.y - coords.atakujaca.y) - coords.atakujaca.y*(coords.atakowana.x-coords.atakujaca.x)
					};
					
					//mianownik we zworze na odleglosc punktu od prostej
					let mian = Math.sqrt(prosta.A*prosta.A + prosta.B*prosta.B);
					
					maxDist = 0;
					for(let i=0; i<WT_tab.length; i++){ //sprawdzamy wszystkie wieĂ…ÂĽe
						if(dist_strait_point(WT_tab[i],prosta,mian) < WT_tab[i].range) { // przez zasieg ktorych przechodzi atak (odleglosc od prostej ataku do wiezy < zasieg wiezy)
							let a = distance(coords.atakowana, WT_tab[i]);
							let b = distance(coords.atakujaca, WT_tab[i]);
							let c = AttDistance;
							
							let dist = detectionDist(WT_tab[i].range,a,b,c);
							dist > maxDist && ( maxDist = dist ); //wybieramy najwczeĂ…â€şniejszy moment detekcji
						}
					}
					
					let detectionPeriod = maxDist * attack_speed;
					
					let detection_date = new Date(date_reaching.getTime() - detectionPeriod);
					
					if (Date.now() < detection_date.getTime() && detection_date.getTime() < date_reaching.getTime()) {
						label = label + " " + normalizeDate(detection_date);
					}
				}
				label = $(this).find('input[type=text]').val(label);
				btn_tab.unshift($(this).find('.btn'));
		} else {
			$(this).closest('tr').remove();
		}
	});
 
	Dialog.show("okienko_komunikatu", dialogBox) 
}