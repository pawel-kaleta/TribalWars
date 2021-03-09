//	author:		PabloCanaletto
//	version:	1.0
//	history of changes:
//		1.0 - 2.08.2020 by PabloCanaletto
//			Initial Release
//					
//	disclaimer:	You are free to use this script in any way you like and to submit changes.
//				I would only appreciate you to leave this notification about my orginal authorship untouched
//				with the whole history of changes.

// FUNCTIONALITY
// This script improves attack reports overview.

/*
const automatic_reformat = true; // ZMIEN NA false JESLI NIE CHCESZ FORMATOWANIA
*/

async function RepotsOverview() {
	const namespace = 'Usprawnienie przegl\u0105du raport\xF3w';
	const ERROR_MESSAGE = 'Komunikat o b\u{142}\u{119}dzie:';
	const Helper = {
        handle_error: function (error) {
            if (typeof (error) === 'string') {
                UI.ErrorMessage(error);
                return;
            }
            const gui = `
				<h2>WTF - What a Terrible Failure</h2>
				<p>
					<strong>${ERROR_MESSAGE}</strong><br/>
					<textarea rows='5' cols='42'>${error}\n\n${error.stack}</textarea><br/>
                </p>`;
            Dialog.show(namespace, gui);
        }
    };
	const Script = {
		gui_content: {
			main: `
				<tr class="report_filter">
					<td colspan="2">
						<h5>Filtruj po obecnym w\u0142a\u015Bcicielu zaatakowanej wioski:</h5>
						<input id="additionalFilters_script_playerName" type="text" size="20">
						<input id="additionalFilters_playerName_script_button" type="button" class="btn btn-default" value="Filtruj">
						<input type="checkbox" id="additionalFilters_script_checkbox">
						<label for="additionalFilters_script_checkbox">Ukryj gracza</label>
					</td>
					<td colspan="2">
						<h5>Sortuj wed\u0142ug odleg\u0142o\u015Bci cel\xF3w od:</h5>
						<input id="sorting_script_coords" type="text" size="3" value="000|000">
						<input id="sorting_script_button" type="button" class="btn btn-default" value="Sortuj">
					</td>
				</tr>
			`,
			reformat_btn: `
				<tr class="report_filter">
					<td colspan="4">
						<input type="button" id="reformat_script_button" class="btn btn-default" value="Reformatuj">
					<td>
				</tr>
			`,
		},
		sorted: false,
		coordsFromReport: function (name) {
			let a = name.match(/\d{3}\|\d{3}/g);
			if(a) { a = a[a.length-1]; }
			return a;
		},
		filter: {
			hide_player: false,
			compare_villages: function (v1, v2) {
				var sValue1 = v1.x + "|" + v1.y;
				var sValue2 = v2.x + "|" + v2.y;

				return sValue1.localeCompare(sValue2);
			},
			compare_players: function (p1, p2) {
				var sValue1 = p1.name;
				var sValue2 = p2.name;

				return sValue1.localeCompare(sValue2);
			},
			bin_search: function (array, val, funct) {
				let left = 0;
				let right = array.length-1;
				let mid;

				while (left <= right) {
					mid = Math.floor((left + right) / 2);

					var comp = funct(array, mid).localeCompare(val);
					switch (comp) {
						case -1:
							left = mid + 1;
							break;
						case 0:
							return mid;
						case 1:
							right = mid - 1;
					}
				}

				return null;
			},
			player_name_from_array:	function (array, n) { return array[n].name; },
			coords_from_array: 		function (array, n) { return array[n].x + "|" + array[n].y; },
			hide_rows: function (rows, world, player_ID) {
				for(let i=0; i<rows.length; i++) {
					var report_text = rows[i].cells[1].innerText;
					var coords = Script.coordsFromReport(report_text);

					if(coords == null) {
						console.log('a');
						console.log(report_text);
						UI.ErrorMessage('Nie rozpoznano zatakowanej wioski w raporcie: "' + report_text + '". Nie ukrywam raportu.', 5000);
						continue;
					}

					var village_index = Script.filter.bin_search(world.village, coords, Script.filter.coords_from_array);
					if (village_index == null) {
						console.log('a');
						console.log(report_text);
						UI.ErrorMessage('Nie rozpoznano zatakowanej wioski w raporcie: "' + report_text + '". Nie ukrywam raportu.', 5000);
						continue;
					}
					var villages_owner = world.village[village_index].player_id;

					var hide_report = true;
					if(villages_owner == player_ID) {
						hide_report = false;
					}
					if(Script.filter.hide_player) {
						hide_report = !hide_report;
					}
					if(hide_report) {
						setTimeout((x) => {rows[x].remove();}, 0 , i);
					}
				}
			},
			filter_init: async function () {
				var rows = $('#report_list tbody tr:not(:last-child, :first-child)');
				if (rows.length == 0) { return; }

				const settings = {
					entities: {
						'village': ['x', 'y', 'player_id'],
						'player': ['id', 'name']
					}
				};

				var world = await get_world_info(settings);

				world.player.sort(Script.filter.compare_players);
				var player_name = $('#additionalFilters_script_playerName')[0].value;
				var player_ID = Script.filter.bin_search(world.player, player_name, Script.filter.player_name_from_array);
				if (player_ID == null) {
					throw 'Nie znaleziono gracza o podanym nicku: "' + player_name + '".';
				} else {
					UI.InfoMessage('Filtrowanie raport\xF3w');
						if($('#additionalFilters_script_checkbox')[0].checked) {
							Script.filter.hide_player = true;
						} else {
							var btn = $('#additionalFilters_playerName_script_button')[0];
							btn.classList.add('btn-disabled');
							btn.value = "Od\u015Bwie\u017C stron\u0119";
						}
					$(btn).off('click');
				}
				player_ID = world.player[player_ID].id;

				world.village.sort(Script.filter.compare_villages);

				Script.filter.hide_rows(rows, world, player_ID);

				if(Script.sorted == true)
				{
					setTimeout(() => {
						rows = $('#report_list tbody tr:not(:last-child, :first-child)');
						Script.sorter.differentiateVillages(rows);
					}, 0);
				}

				setTimeout(() => { UI.InfoMessage('Koniec', 2000, 'success'); }, 0);
			},
		},
		sorter: {
			village: "",
			distance_square: function (a, b) {
				a = a.split('|').map(x => Number(x));
				b = b.split('|').map(x => Number(x));

				return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);
			},
			compareTRs: function (oTR1, oTR2) {
				var sValue1 = oTR1.cells[1].innerText;
				var sValue2 = oTR2.cells[1].innerText;

				sValue1 = Script.coordsFromReport(sValue1);
				sValue2 = Script.coordsFromReport(sValue2);

				if(sValue1 == null) { sValue1 = " "; } else {
					sValue1 = Script.sorter.distance_square(sValue1, Script.sorter.village);
				}
				if(sValue2 == null) { sValue2 = " "; } else {
				sValue2 = Script.sorter.distance_square(sValue2, Script.sorter.village);
				}

				sValue1 = sValue1.toString();
				sValue2 = sValue2.toString();

				return sValue1.localeCompare(sValue2);
			},
			differentiateVillages: function (rows) {
				var classes = ["row_a", "row_b"];
				var row_class = 0;
				$(rows[0])[0].classList.toggle(classes[row_class], true);
				$(rows[0])[0].classList.toggle(classes[1-row_class], false);
				for(let i=1; i<rows.length; i++) {
					var vill_a = Script.coordsFromReport(rows[i-1].cells[1].innerText);
					var vill_b = Script.coordsFromReport(rows[i].cells[1].innerText);
					if(vill_a != vill_b || vill_a == null || vill_b == null) { row_class = 1-row_class;	}
					$(rows[i])[0].classList.toggle(classes[row_class], true);
					$(rows[i])[0].classList.toggle(classes[1-row_class], false);
				}
			},
			sorter_init: async function () {
				Script.sorter.village = $('#sorting_script_coords')[0].value;
				if(Script.sorter.village.length != 7 || Script.sorter.village.match(/\d{3}\|\d{3}/g) == null){
					throw 'To nie są poprawne koordynaty: "' + Script.sorter.village + '".';
				}

				var tbody = $('#report_list tbody')[0];

				var rows = $('#report_list tbody tr:not(:last-child, :first-child)');
				rows.sort(Script.sorter.compareTRs);

				for(let i=0; i<rows.length; i++) {
					rows[i].remove();
					tbody.append(rows[i]);
				}

				Script.sorter.differentiateVillages(rows);

				var last_row = $('#report_list tbody tr')[1];
				last_row.remove();
				tbody.append(last_row);
				Script.sorted = true;
			}
		},
		reformatter: {
			reformatRightIcons: function (rows, i) {
				var icons = rows[i].children[1].children[0].children;
				var icon_presence = [false,false,false,false];
				for(let j = 0; j<icons.length; j++) {
					if 		(icons[j].src.indexOf("knight")	!= -1) { icon_presence[3] = true; }
					else if	(icons[j].src.indexOf("spy")	!= -1) { icon_presence[2] = true; }
					else if	(icons[j].src.indexOf("snob")	!= -1) { icon_presence[1] = true; }
					else if	(icons[j].src.indexOf("attack")	!= -1) { icon_presence[0] = true; }
				}
				for(let j = 0; j<icons.length; j++) {
					var index;
					if 		(icons[j].src.indexOf("knight")	!= -1) { index = 4; }
					else if	(icons[j].src.indexOf("spy")	!= -1) { index = 3; }
					else if	(icons[j].src.indexOf("snob")	!= -1) { index = 2; }
					else if	(icons[j].src.indexOf("attack")	!= -1) { index = 1; }
					var margin = 0;
					while (index < icon_presence.length && icon_presence[index] == false) {
						margin++;
						index++;
					}
					margin *= 19;
					$(icons[j]).css({
						'margin-right': margin + 'px'
					});
				}
			},
			reformatLeftIcons: function (rows, i) {
				if($(rows[i]).find('img').length == 0) {
					$(rows[i].children[1].children[1]).css({
						float: 'right',
						'margin-right': 121 + 'px',
						'margin-top': 2 + 'px'
					});
				} else {
					$(rows[i].children[1].children[1]).css({
						float: 'right',
						'margin-right': 5 + 'px',
						'margin-top': 3 + 'px'
					});

					if (rows[i].children[1].children[2].nodeName == "IMG") {
						$(rows[i].children[1].children[2]).css({
							float: 'right',
							'margin-right': 5 + 'px',
							'margin-top': 2 + 'px'
						});
						$(rows[i].children[1].children[3]).css({
							float: 'right',
							'margin-right': 19 + 'px',
							'margin-top': 2 + 'px'
						});
					}
					else {
						$(rows[i].children[1].children[2]).css({
							float: 'right',
							'margin-right': 36 + 'px',
							'margin-top': 2 + 'px'
						});
					}
				}
				
			},
			reformatter_init: async function () {
				if(!Script.reformatter.done) {
					var rows = $('#report_list tbody tr:not(:last-child, :first-child)');

					for(let i=0; i<rows.length; i++) {
						Script.reformatter.reformatRightIcons(rows, i);
						Script.reformatter.reformatLeftIcons(rows, i);
					}
				}
			}
		},
		main: async function () {
			$('.report_filter [value="Zresetuj wszystkie filtry"]').closest('tr').before(Script.gui_content.main);

			$('#additionalFilters_playerName_script_button').on('click', async function() {
				UI.InfoMessage('Pobieram dane');
				$.ajax({
					url: 'https://media.innogamescdn.com/com_DS_PL/skrypty/HermitowskiePlikiMapy.js?_=' + ~~(Date.now() / 9e6),
					dataType: 'script',
					cache: true
				}).then(() => {
					Script.filter.filter_init().catch(Helper.handle_error);
				});
			});

			$('#sorting_script_coords')[0].value = game_data.village.coord;
			$('#sorting_script_button').on('click', async function() {
				Script.sorter.sorter_init().catch(Helper.handle_error);
			});

			if(!automatic_reformat) {
				$('.report_filter [value="Zresetuj wszystkie filtry"]').closest('tr').before(Script.gui_content.reformat_btn);
				$('#reformat_script_button').on('click', async function() {
					Script.reformatter.reformatter_init().catch(Helper.handle_error);
					this.classList.add('btn-disabled');
					$(this).off('click');
				});
			} else {
				Script.reformatter.reformatter_init();
			}
		}
	};
	try { Script.main(); } catch (ex) { Helper.handle_error(ex); }
}

if (document.URL.indexOf("screen=report") != -1 && document.URL.indexOf("mode=attack") != -1) {
	RepotsOverview();
} else {
	UI.ErrorMessage("Skrypt do u\u017Cycia w Raporty > Atak");
}