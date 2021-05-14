javascript:

//	author:			PabloCanaletto
//	version:		0.7.0
//	description:	This script shows attacks on yours tribemates.
//	disclaimer:		You are free to use this script in any way you like and to submit changes.
//					I would only appreciate you to leave notification about my orginal authorship untouched
//					with the whole history of changes.


var rows_2;
var table;
var t = (game_data.player.sitter !== '0') ? '&t=' + game_data.player.id : '';

if (document.URL.indexOf("screen=ally&mode=members_troops") == -1) {
    UI.InfoMessage('Przejdź do Plemię > Członkowie > Przybywające, aby użyć tego skryptu!', 5000, 'error');
}
else {
	init();
}

function create_table() {
	var tbl = document.createElement("table");
	var tblBody = document.createElement("tbody");
	  
	var header_row = document.createElement("tr");
	$(header_row).html(`
		<th style="min-width: 200px">Gracz</th>
		<th><img src="https://dspl.innogamescdn.com/asset/77d01c98/graphic/unit/att.png" class="" style="vertical-align: -3px"></th>
	`);
	tblBody.appendChild(header_row);
	
	tbl.appendChild(tblBody);
	tbl.setAttribute("class", "vis");
	
	document.querySelector('#ally_content > div').appendChild(tbl);
	
	return tblBody;
}

function load_new_data() {
	var a = document.querySelector('select');
	var players = a.options;
	
	var player_nick;
	var player_id;
	
	var doing_ajax = false;
	var i = 1;
	var interval_id = setInterval(function() {
		if (doing_ajax === false) {
			doing_ajax = true;
			
			player_nick = players[i].text;
			player_id = players[i].value;
			load_player_data(player_id, player_nick);
			i++;
			if (i == players.length) {
				clearInterval(interval_id);
				var attacks_data = JSON.stringify(rows_2);
				localStorage.setItem("attacks_data", attacks_data);
			}
			doing_ajax = false;
		}
	}, 250);
}

function load_player_data(player_id, player_nick) {
	$.get(
		'/game.php?screen=ally&mode=members_troops&player_id=' + player_id + t
	).done(function(response) {
		var requestedBody = document.createElement('body');
		requestedBody.innerHTML = response;
		
		var have_rights = requestedBody.querySelector('#ally_content .info_box');
		var attacks;
		
		if (have_rights) {
			attacks = requestedBody.querySelector('#ally_content > div > div > table > tbody > tr:nth-child(1) > th:nth-child(16) > strong');
		} else {
			attacks = requestedBody.querySelector('#ally_content > div > div > table > tbody > :nth-child(1) > :nth-child(2) > strong');
		}
													
		var att;
			
		var new_row = document.createElement("tr");
		
		var cell_1 = document.createElement("td");
		cell_1.innerHTML = '<a href="/game.php?village=' + game_data.village.id + '&screen=info_player&id=' + player_id + '">' + player_nick + '</a>';
		cell_1.setAttribute("class", "lit-item");
		new_row.appendChild(cell_1);
				
		var cell_2 = document.createElement("td");
		if (attacks === null) {
			cell_2.innerHTML = 'brak dostępu';
			att = 'brak dostępu';
		}
		else {
			cell_2.innerHTML = '<img src="https://dspl.innogamescdn.com/asset/77d01c98/graphic/unit/att.png" class="" style="vertical-align: -3px"> ' + attacks.innerText;
			att = attacks.innerText;
		}
		cell_2.setAttribute("class", "lit-item");
		new_row.appendChild(cell_2);
			
		
		table.appendChild(new_row);
		
		var refresh_time = Date.now();
		rows_2.push(new row(player_nick, player_id, att, refresh_time));
	});
}

function init() {
	table = create_table();
	var rows = new Array();
	rows_2 = new Array();
	load_new_data(rows);
}

function row(_nick, _id, _attacks, _refresh_time) {
	this.nick = _nick,
	this.id = _id,
	this.attacks = _attacks,
	this.refresh_time = _refresh_time
}

//	change log:
//		0.1.0 - 5.12.2019 by PabloCanaletto
//			> table creation
//		0.2.0 - 6.12.2019 by PabloCanaletto
//			> data loading
//			> filling table with data
//		0.3.0 - 7.12.2019 by PabloCanaletto
//			> code reorganization for further development
//			> structure for data caching
//		0.4.0 - 10.12.2019 by PabloCanaletto
//			> 
//		0.5.0 - 30.12.2020 by PabloCanaletto
//			> ally rights handling
//		0.6.0 - 12.01.2021 by PabloCanaletto
//			> jQuerry deprecated functions removal
//		0.7.0 - 12.01.2021 by PabloCanaletto
//			> sitter handling
