javascript:

//	author:		PabloCanaletto
//	version:	2.1.0.0
//	disclaimer:	You are free to use this script in any way you like and to submit changes.
//				I would only appreciate you to leave notification about my orginal authorship untouched
//				with the whole history of changes.

/*
var DysponentSurowcowy = {
	// USTAWIENIA DOMYSLNE
	resourcesFillTo: [20000, 25000, 25000],		// wypelniaj do tej wartosci
	resourcesSafeguard: [2000, 2000, 2000],		// zabezpieczenie w surowcach, wypelniane priorytetowo
	tradersSafeguard: 0,						// zabezpieczenie w kupcach
	considerOngoingTransports: true,			// uwzglednij przychodzace transporty (tak - true, nie - false)
	overFlowThreshold: 75,						// % pojemnosci spichlerza, powyzej ktorego zapobiegaj przelewaniu sie
	extendedOptimization: true,					// czy optymalizacja moze generowac dodatkowych odbiorcow (wiecej klikania)
	minSummon: 0,								// minimalne wezwanie
	debug: true
};
*/

//	change log:
//		2.0.0.1-2.0.6.3 by PabloCanaletto
//			> prerelease versions at the end
//		2.1.0.0 by PabloCanaletto
//			> initial release

(async function (TribalWars) {
	const namespace = 'Dysponent_Surowcowy_2';
	const version = 'v2.1.0.0';
    const Debugger = {
		log: [{count: 1, message: 'Dysponent Surowcowy - Debug Log:'}],
		logLine: function (line) {
			let last_line = this.log[this.log.length-1];
			if (last_line.message == line) { 
				last_line.count++ 
				return;
			}
			this.log.push({count: 1, message: line});
		},
		saveLog: function () {
			let string = '';
			for (let i=0; i<this.log.length; i++) {	string += this.log[i].count + '	' + this.log[i].message + '\n';	}
			return string;
		},
        handle_error: function (error) {
			let title = '';
			let stack = '';
			if (typeof (error) === 'string') {
				this.logLine('ERROR: '+ error);
				title = 'Co\u015B posz\u0142o nie tak...';
				for (let i=Math.min(100, this.log.length-1); i>=1; i--) {
					var line = this.log[this.log.length-i];
					stack += this.log.length-i + '	' + line.count + '	' + line.message + '\n';
				}
			} else {
				title = 'WTF - What a Terrible Failure';
				stack += error.stack;
			}

			let gui = `
				<h2>${title}</h2>
				<p>
					<strong>Wyst\u0105pi\u0142 b\u0142\u0105d w dzia\u0142aniu skryptu:</strong><br/>
					<br/>
					<strong>${error}</strong><br/>
					<br/>
					Aby uzyska\u0107 pomoc zajrzyj do w\u0105tku dotycz\u0105cego tego skryptu na Forum og\xF3lnym. Je\u015Bli nie znajdziesz tam \u017Cadnych informacji mo\u017Cesz napisa\u0107 zg\u0142oszenie za\u0142\u0105czaj\u0105c poni\u017Cszy Komunikat o B\u0142\u0119dzie.<br/>
					<br/>
					<a href="https://forum.plemiona.pl/index.php?threads/dysponent-surowcowy.127245/">Link do w\u0105tku na forum</a><br/>
					<br/>
					<strong>Komunikat o b\u{142}\u{119}dzie:</strong><br/>
					<textarea rows='5' cols='100'>[spoiler=Komunikat o b\u{142}\u{119}dzie][b]${error}[/b]\n\n${stack}</textarea><br/>
					<br/>
					Pomocny mo\u017Ce okaza\u0107 si\u0119 tak\u017Ce pe\u0142ny Debug Log z dzia\u0142ania skryptu, ale ten prawdopodobnie jest znacznie d\u0142u\u017Cszy i mo\u017Ce nie zmie\u015Bci\u0107 si\u0119 w po\u015Bcie na forum.<br/>
					<br/>
					<strong>Debug Log:</strong><br/>
					<textarea rows='5' cols='100'>[spoiler=Debug Log][code]${Debugger.saveLog()}[/code]</textarea>
				</p>
			`;
            Dialog.show(namespace, gui);
		},
		logTransports: function (transports) {
			this.logLine('logTransports()');
			for (let i=0; i<transports.length; i++) {
				this.logLine( '	' + i + ' origin: ' + transports[i].origin.ID + ' destination: ' + transports[i].destination.ID + ' (' + transports[i].resources[0] + ',' + transports[i].resources[1] + ',' + transports[i].resources[2] + ')' + ' traders: ' + transports[i].traders );
			}
		},
		verifyTransports: function (transports) {
			this.logLine('verifyTransports()');
			this.logLine('	Number of transports: ' + transports.length + ' {');

			let errors = [];
			for (let i=0; i<transports.length; i++) {
				if (Settings.debug) { this.logLine( '	' + i + '  origin: ' + transports[i].origin.ID + ' destination: ' + transports[i].destination.ID + ' (' + transports[i].resources[0] + ',' + transports[i].resources[1] + ',' + transports[i].resources[2] + ')' + ' traders: ' + transports[i].traders ); }
				if (transports[i].origin.ID == transports[i].destination.ID) { errors.push('origin === destination'); }
				if (transports[i].resources[0] < 0) { errors.push('Wood is negative! '	+i); }
				if (transports[i].resources[1] < 0) { errors.push('Stone is negative! '	+i); }
				if (transports[i].resources[2] < 0) { errors.push('Iron is negative! '	+i); }
				for (let j=i; j<transports.length; j++) {
					if (j==i) { continue; }
					if (transports[i].resources === transports[j].resources) { 
						errors.push('Two transports share the same resources array! ' + i + ' ' + j);
					}
				}
				if ((transports[i].resources[0]+transports[i].resources[1]+transports[i].resources[2])/1000 != transports[i].traders) {
					errors.push("Traders don't match with resources! "+i);
				}
			}

			if (errors[0]) { 
				this.logTransports(transports);
				while (errors[0]) { this.logLine(errors.shift()); }
				throw 'Opracowano niemo\u017Cliwy transport!';
			}
			this.logLine('}');
		}
	};
	const Utilities = {
		swap: function (tab, ia, ib) {
			let temp = tab[ia];
			tab[ia] = tab[ib];
			tab[ib] = temp;
		},
		distance: function (cA, cB) { return Math.sqrt(Math.pow(cB.x - cA.x, 2) + Math.pow(cB.y - cA.y, 2));
		},
		beautifyNumber: function (number) {
			let prefix = ['', 'K', 'M', 'G'];
			for (let i = 0; i < prefix.length; i++) {
				if (number >= 1000) {
					number /= 1000;
				} else {
					let fraction = 2;
					if (number >= 10)
						fraction = 1;
					if (number >= 100)
						fraction = 0;
					return `${number.toFixed(fraction)}${prefix[i]}`;
				}
			}
			return `${number.toFixed(0)}T`;
		}
	};
	var Settings = {
		resourcesSafeguard:			[0,0,0],
		resourcesFillTo:			[0,0,0],
		tradersSafeguard:			0,
		considerOngoingTransports:	false,
		overFlowThreshold:			100,
		extendedOptimization:		false,
		minSummon:					0,
		sitter: 					'',
		debug: 						false,
		isNewerVersion: function () { return typeof DysponentSurowcowy == 'undefined' && typeof settings != "undefined"; },
		loadDefaults: async function () {
			try {
				Debugger.logLine('loadDefaults()');

				let adviceMessage = 'Zaleca si\u0119 ponowne skopiowanie sygnatury skryptu ze skryptoteki na FO.';

				if (typeof DysponentSurowcowy == 'undefined') { throw 'Nie znaleziono ustawie\u0144 domy\u015Blnych. ' + adviceMessage; }
				let errorSetting = 'Wykryto b\u0142\u0105d w ustawieniach domy\u015Blnych.';
				
				for (const setting of Object.keys(DysponentSurowcowy)) {
					if (typeof this[setting] == "undefined") { throw errorSetting + ' Nieznane ustawienie: "' + setting + '". ' + adviceMessage; }
					if (typeof this[setting] != typeof DysponentSurowcowy[setting]) { throw errorSetting + ' Nie rozpoznano warto\u015Bci ustawienia: "' + setting + '". ' + adviceMessage; }
					if (typeof this[setting] == typeof [0,0,0]) {
						if (this[setting].length != DysponentSurowcowy[setting].length) {
							throw errorSetting + ' Liczba warto\u015Bci ustawienia: "' + setting + '" jest niew\u0142a\u015Bciwa. ' + adviceMessage; 
						}
					}
					this[setting] = DysponentSurowcowy[setting];
				}
			} catch (ex) { Debugger.handle_error(ex); }
		}
	};
    const Script = {
		plan: {},
		gui: {
			options: [],
			create_option_input: function (option) {
				Debugger.logLine('create_option_input()');
				const cell = document.createElement('td');
				cell.setAttribute('width', '150px');

				for (const control_definition of option.controls) {
					const option_control_span = document.createElement('span');

					const option_img = document.createElement('img');
					option_img.setAttribute('id', control_definition.attributes.id + '_img');
					option_img.setAttribute('src', control_definition.img);
					option_control_span.append(option_img);

					const option_control = document.createElement(control_definition.type);
					for (const attribute_name in control_definition.attributes) {
						if (attribute_name == 'checked') {
							if (!control_definition.attributes[attribute_name]) {
								continue;
							}
						}
						option_control.setAttribute(attribute_name, control_definition.attributes[attribute_name]);
					}
					option_control_span.append(option_control);
					
					cell.append(option_control_span);
					cell.append(document.createElement('br'));
				}

				return cell;
			},
			create_option_header: function (option) {
				Debugger.logLine('create_option_header()');

				const option_title_row = document.createElement('tr');
				const option_title_cell = document.createElement('th');
				option_title_cell.setAttribute('colspan', 2);
				option_title_cell.innerText = option.name;
				option_title_row.append(option_title_cell);

				return option_title_row;
			},
			add_option_to_panel: function (option, table) {
				Debugger.logLine('add_option_to_panel(' + option.name + ')');

				table.append(this.create_option_header(option));

				const option_content_row = document.createElement('tr');
				option_content_row.append(this.create_option_input(option));

				const option_content_descryption = document.createElement('td');
				option_content_descryption.innerText = option.description;
				option_content_row.append(option_content_descryption);

				table.append(option_content_row);
			},
			create_main_panel: function () {
				Debugger.logLine('create_main_panel()');
				const panel = document.createElement('div');
				panel.classList.add('vis', 'vis_item');

				const table = document.createElement('table');
				panel.append(table);

				for (option of this.options) {
					this.add_option_to_panel(option, table);
				}

				return panel;
			},
			gather_stats: function (panel_data) {
				Debugger.logLine('gather_stats()');

				let villages = Script.villagesHandler.villages;
				let transports = Script.transportsHandler.ongoingTransports;

				for (let i=0; i<villages.length; i++) {
					panel_data.gran_sum 	+= villages[i].granary;
					panel_data.trad_sum_in	+= villages[i].traders.free;
					panel_data.trad_sum_all	+= villages[i].traders.all;
					for (let j=0; j<3; j++) {
						panel_data.res_sum_in[j] += villages[i].resources.present[j];
					}
				}
				for (let i=0; i<transports.length; i++) {
					for (let j=0; j<3; j++) {
						panel_data.res_sum_out[j] += transports[i].resources[j];
					}
				}
				panel_data.trad_sum_out = panel_data.trad_sum_all - panel_data.trad_sum_in;
				panel_data.gran_avg =		panel_data.gran_sum		/ villages.length;
				panel_data.trad_avg_all =	panel_data.trad_sum_all	/ villages.length;
				panel_data.trad_avg_out =	panel_data.trad_sum_out	/ villages.length;
				panel_data.trad_avg_in =	panel_data.trad_sum_in	/ villages.length;
				for (let i=0; i<3; i++) {
					panel_data.res_sum_all[i] = panel_data.res_sum_in[i] + panel_data.res_sum_out[i];
					panel_data.res_avg_in[i] =	panel_data.res_sum_in[i]	/ villages.length;
					panel_data.res_avg_out[i] =	panel_data.res_sum_out[i]	/ villages.length;
					panel_data.res_avg_all[i] =	panel_data.res_sum_all[i]	/ villages.length;
				}
			},
			create_stats_panel: function () {
				Debugger.logLine('create_stats_panel()');

				const panel = document.createElement('div');
				panel.classList.add('vis', 'vis_item');

				const img1 = document.createElement('img');
				img1.setAttribute('src', 'https://dspl.innogamescdn.com/asset/34fb11bc/graphic/big_buildings/hd/market3.png');
				img1.style.height = '203px';
				img1.style.float = 'left';

				const img2 = document.createElement('img');
				img2.setAttribute('src', 'https://dspl.innogamescdn.com/asset/34fb11bc/graphic/big_buildings/hd/storage3.png');
				img2.style.height = '203px';
				img2.style.float = 'right';

				panel.append(img1);
				panel.append(img2);

				const table = document.createElement('table');
				table.style['border-spacing'] = '2px';
				table.style['border-collapse'] = 'separate';
				table.style.margin = '0 auto';
				panel.append(table);

				var panel_data = {
					res_sum_in:		[0,0,0],
					res_sum_out:	[0,0,0],
					res_sum_all:	[0,0,0],
					res_avg_in:		[0,0,0],
					res_avg_out:	[0,0,0],
					res_avg_all:	[0,0,0],
					trad_sum_in:	0,
					trad_sum_out:	0,
					trad_sum_all:	0,
					trad_avg_in:	0,
					trad_avg_out:	0,
					trad_avg_all:	0,
					gran_sum:		0,
					gran_avg:		0
				};
				
				this.gather_stats(panel_data);

				table.innerHTML = `
					<tbody>
						<tr>
							<th colspan="8" style="text-align: center">Surowce Sumarycznie</th>
						</tr>
						<tr>
							<th colspan="3" style="text-align: center">W wioskach</th>
							<th colspan="3" style="text-align: center">W transportach</th>
							<th colspan="2" style="text-align: center">Razem</th>
						</tr>
						<tr class="row_b">
							<td colspan="3" style="text-align: center">
								<span class="res wood" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_sum_in[0])}</span>
								<span class="res stone" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_sum_in[1])}</span>
								<span class="res iron" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_sum_in[2])}</span>
							</td>
							<td colspan="3" style="text-align: center">
								<span class="res wood" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_sum_out[0])}</span>
								<span class="res stone" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_sum_out[1])}</span>
								<span class="res iron" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_sum_out[2])}</span>
							</td>
							<td colspan="2" style="text-align: center">
								<span class="res wood" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_sum_all[0])}</span>
								<span class="res stone" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_sum_all[1])}</span>
								<span class="res iron" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_sum_all[2])}</span>
							</td>
						</tr>
						<tr>
							<td colspan="8"></th>
						</tr>
						<tr>
							<th colspan="8" style="text-align: center">Surowce \u015Brednio na wiosk\u0119</th>
						</tr>
						<tr>
							<th colspan="3" style="text-align: center">W wiosce</th>
							<th colspan="3" style="text-align: center">W transportach</th>
							<th colspan="2" style="text-align: center">Razem</th>
						</tr>
						<tr class="row_b">
							<td colspan="3" style="text-align: center">
								<span class="res wood" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_avg_in[0])}</span>
								<span class="res stone" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_avg_in[1])}</span>
								<span class="res iron" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_avg_in[2])}</span>
							</td>
							<td colspan="3" style="text-align: center">
								<span class="res wood" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_avg_out[0])}</span>
								<span class="res stone" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_avg_out[1])}</span>
								<span class="res iron" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_avg_out[2])}</span>
							</td>
							<td colspan="2" style="text-align: center">
								<span class="res wood" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_avg_all[0])}</span>
								<span class="res stone" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_avg_all[1])}</span>
								<span class="res iron" style="padding: 1px 1px 1px 18px;">${Utilities.beautifyNumber(panel_data.res_avg_all[2])}</span>
							</td>
						</tr>
						<tr>
							<td colspan="8"></th>
						</tr>
						<tr>
							<th colspan="3" style="text-align: center">Kupcy Sumarycznie</th>
							<th colspan="3" style="text-align: center">Kupcy \u015Brednio na wiosk\u0119</th>
							<th colspan="2" style="text-align: center">Pojemno\u015B\u0107 spichlerzy</th>
						</tr>
						<tr>
							<th style="text-align: center">Dost\u0119pni</th>
							<th style="text-align: center">Niedost\u0119pni</th>
							<th style="text-align: center">Razem</th>
							<th style="text-align: center">Dost\u0119pni</th>
							<th style="text-align: center">Niedost\u0119pni</th>
							<th style="text-align: center">Razem</th>
							<th style="text-align: center">Sumaryczna</th>
							<th style="text-align: center">\u015Arednia</th>
						</tr>
						<tr class="row_b">
							<td style="text-align: center">${panel_data.trad_sum_in}</td>
							<td style="text-align: center">${panel_data.trad_sum_out}</td>
							<td style="text-align: center">${panel_data.trad_sum_all}</td>
							<td style="text-align: center">${Utilities.beautifyNumber(panel_data.trad_avg_in)}</td>
							<td style="text-align: center">${Utilities.beautifyNumber(panel_data.trad_avg_out)}</td>
							<td style="text-align: center">${Utilities.beautifyNumber(panel_data.trad_avg_all)}</td>
							<td style="text-align: center">${Utilities.beautifyNumber(panel_data.gran_sum)}</td>
							<td style="text-align: center">${Utilities.beautifyNumber(panel_data.gran_avg)}</td>
						</tr>
					</tbody>
				`;

				return panel;
			},
			create_header: function () {
				Debugger.logLine('create_header()');

				const div_main = document.createElement('div');
				div_main.style.margin = '5px 5px 10px 5px';

				const div_img = document.createElement('div');
				div_img.style.float = 'left';
				div_img.style.margin = '0px 5px 0px 0px';
				div_main.append(div_img);

				const img = document.createElement('img');
				img.setAttribute('src', 'https://dspl.innogamescdn.com/asset/34fb11bc/graphic/awards/award2.png');
				div_img.append(img);

				const div_title = document.createElement('div');
				div_title.style.margin = '0px 0px 0px 10px';
				div_main.append(div_title);

				const title = document.createElement('h1');
				title.style.margin = '0px 0px 5px 0px';
				title.innerText = "Dysponent Surowcowy";
				div_title.append(title);

				const signature = document.createElement('span');
				signature.innerText = 'by PabloCanaletto';
				div_title.append(signature);

				return div_main;
			},
			create_footer: function () {
				Debugger.logLine('create_footer()');

				const footer = document.createElement('div');
				footer.style.margin = '15px 5px 5px 5px';

				const forum_topic_link = document.createElement('a');
				forum_topic_link.setAttribute('href', 'https://forum.plemiona.pl/index.php?threads/dysponent-surowcowy.127245/');
				forum_topic_link.textContent = 'Link do wątku na forum';
				footer.append(forum_topic_link);

				const version_label = document.createElement('label');
				version_label.classList.add('float_right');
				version_label.innerText = version;
				footer.append(version_label);

				return footer;
			},
			create_script_description: function () {
				Debugger.logLine('create_script_description()');

				const info_box = document.createElement('div');
				info_box.classList.add('info_box');
				info_box.style.margin = '5px 5px 5px 5px';

				const content = document.createElement('div');
				content.classList.add('content');
				content.innerText = 'To jest skrypt s\u0142u\u017C\u0105cy do dystrybuowania surowc\xF3w mi\u0119dzy wioskami. Dzia\u0142a on na ca\u0142ej aktywnej grupie przesy\u0142aj\u0105c surowce, aby uzupe\u0142ni\u0107 braki. Mo\u017Ce te\u017C zapobiega\u0107 przelewaniu si\u0119 spichlerzy. Opracowuj\u0105c plan transport\xF3w skrypt przekierowuje je przez po\u015Brednik\xF3w (zamiast A------>C robi A-->B-->C). Kosztem czasowego zamro\u017Cenia cz\u0119\u015Bci surowc\xF3w i zaanga\u017Cowania dodatkowych kupc\xF3w skraca si\u0119 znacz\u0105co czas transport\xF3w. Przy wykonaniu planu skrypt korzysta z funkcjonalno\u015Bci rynku "Wezwij", aby ograniczy\u0107 liczb\u0119 klikni\u0119\u0107 potrzeb\u0105 do wys\u0142ania bardzo wielu transport\xF3w. Domy\u015Blne warto\u015Bci ustawie\u0144 mo\u017Cna \u0142atwo zmieni\u0107 w kodzie skryptu.';
				info_box.append(content);

				return info_box;
			},
			create_warning: function () {
				Debugger.logLine('create_warning()');

				const error_box = document.createElement('div');
				error_box.classList.add('error_box');
				error_box.style.margin = '5px 5px 5px 5px';

				const content = document.createElement('div');
				content.classList.add('content');
				content.innerText = 'Pojawi\u0142a si\u0119 nowa wersja skryptu. Zaleca si\u0119 ponowne skopiowanie sygnatury ze skryptoteki na Forum Og\xF3lnym, aby unikn\u0105\u0107 niekompatybilno\u015Bci pomi\u0119dzy wersjami.';
				error_box.append(content);

				return error_box;
			},
			create_submition_panel: function () {
				Debugger.logLine('create_submition_panel()');

				const submition_panel = document.createElement('div');

				const submit_button = document.createElement('input');
				submit_button.setAttribute('id', namespace + '_submit');
				submit_button.setAttribute('value', 'Opracuj Plan');
				submit_button.setAttribute('type', 'button');
				submit_button.classList.add('btn');
				submit_button.addEventListener('click', async function () { try { await Script.planCreator.init(); } catch (ex) { Debugger.handle_error(ex); } });
				submition_panel.append(submit_button);

				const marketplace_button = document.createElement('input');
				marketplace_button.setAttribute('id', 'marketplace_button');
				marketplace_button.setAttribute('value', 'Wykonaj Plan');
				marketplace_button.setAttribute('type', 'button');
				marketplace_button.classList.add('btn');
				submition_panel.append(marketplace_button);

				const view_plan = document.createElement('input');
				view_plan.setAttribute('id', 'view_plan_button');
				view_plan.setAttribute('value', 'Zobacz Plan');
				view_plan.setAttribute('type', 'button');
				view_plan.classList.add('btn');
				view_plan.classList.add('float_right');
				submition_panel.append(view_plan);

				if (!Script.planExecutor.loadPlan()) {
					marketplace_button.classList.add('btn-disabled');
					view_plan.classList.add('btn-disabled');
				} else {
					marketplace_button.addEventListener('click', async function () { try { await Script.planExecutor.init(); } catch (ex) { Debugger.handle_error(ex); } });
					view_plan.addEventListener('click', async function () { try { Script.gui.show_plan(); } catch (ex) { Debugger.handle_error(ex); } });

					const plan_date = document.createElement('label');
					plan_date.setAttribute('id', 'plan_date');
					plan_date.style.display = 'inline';
					let time = new Date(Date.now() - Script.plan.timestamp);
					time = time.getMinutes();
					let inflection = '';
					if (time==1) { inflection = 'minut\u0119'; }
					else {
						let x = time;
						while (x>=10) { x -= 10; }
						if (2<=x && x<=4) { inflection = 'minuty'; }
						else { inflection = 'minut'; }
					}
					plan_date.innerHTML = 'Plan utworzony <strong>' + time + '</strong> ' + inflection + ' temu.';
					submition_panel.append(plan_date);
				}
				
				return submition_panel;
			},
			load_settings: function () {
				Debugger.logLine('load_settings()');

				for (option of this.options) {
					let setting;
					if (option.controls.length == 1) {
						setting = Settings[option.controls[0].attributes.id];
						if (option.controls[0].attributes.type == 'checkbox') {
							setting = $('#'+option.controls[0].attributes.id)[0].checked;
							Debugger.logLine(option.controls[0].attributes.id + ': ' + setting);
						}
						else {
							setting = Number($('#'+option.controls[0].attributes.id)[0].value);
							Debugger.logLine(option.controls[0].attributes.id + ': ' + setting);
							if (setting == NaN || setting < 0) { throw 'Niew\u0142a\u015Bciwa warto\u015B\u0107 ustawienia "' + option.controls[0].attributes.id +'".' }
						}
						Settings[option.controls[0].attributes.id] = setting;
					}
					else {
						setting = Settings[option.controls[0].attributes.id.split("_")[0]];
						for (let i=0; i<3; i++) {
							setting[i] = Number($('#'+option.controls[i].attributes.id)[0].value);
							Debugger.logLine(option.controls[0].attributes.id + ': ' + setting[i]);
							if (setting[i] == NaN || setting[i] < 0 || setting[i] > 700000) { throw 'Niew\u0142a\u015Bciwa warto\u015B\u0107 ustawienia "' + option.controls[0].attributes.id +'".' }
						}
					}
				}
				if (Settings.overFlowThreshold > 100) { Settings.overFlowThreshold = 100; }

			},
			activate_buttons: function () {
				Debugger.logLine('activate_buttons()');

				$('#marketplace_button')[0].classList.forEach((x) => {
					if (x == 'btn-disabled') {
						$('#marketplace_button')[0].classList.remove('btn-disabled');
						$('#marketplace_button')[0].addEventListener('click', async function () { try { await Script.planExecutor.init(); } catch (ex) { Debugger.handle_error(ex); } });
					}
				});
				$('#view_plan_button')[0].classList.forEach((x) => {
					if (x == 'btn-disabled') {
						$('#view_plan_button')[0].classList.remove('btn-disabled');
						$('#view_plan_button')[0].addEventListener('click', async function () { try { Script.gui.show_plan(); } catch (ex) { Debugger.handle_error(ex); } });
					}
				});

				if($('#plan_date')[0]) { $('#plan_date')[0].innerHTML = 'W\u0142a\u015Bnie utworzy\u0142e\u015B plan!';	}
			},
			create_gui: async function () {
				try {
					Debugger.logLine('create_gui()');
					if (!Settings.isNewerVersion()) { await Settings.loadDefaults(); }
					
					this.options = [
						{
							name: 'Wype\u0142niaj do warto\u015Bci',
							description: 'Ilo\u015Bci surowc\xF3w do jakich maj\u0105 by\u0107 standardowo wype\u0142niane spichlerze. G\u0142\xF3wne ustawienie, kt\xF3re rozsy\u0142a surowce mi\u0119dzy wioskami dbaj\u0105c, aby ich dystrybucja na koncie by\u0142a r\xF3wnomierna i w ka\u017Cdym rejonie by\u0142y zapasy. Ustawienie tej opcji na wi\u0119cej ni\u017C \u015Brednia ilo\u015B\u0107 surowc\xF3w na wiosk\u0119 nie ma sensu - skrypt nie wyczaruje surowc\xF3w z powietrza.',
							controls: [
								{ type: 'input', attributes: { id: 'resourcesFillTo_wood',	size: 10, value: Settings.resourcesFillTo[0] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/holz.png' },
								{ type: 'input', attributes: { id: 'resourcesFillTo_stone',	size: 10, value: Settings.resourcesFillTo[1] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/lehm.png' },
								{ type: 'input', attributes: { id: 'resourcesFillTo_iron',	size: 10, value: Settings.resourcesFillTo[2] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/eisen.png' }
							]
						},
						{ 
							name: 'Zabezpieczenie w surowcach',
							description: 'Ilo\u015Bci surowc\xF3w, kt\xF3re maj\u0105 zosta\u0107 uzupe\u0142nione priorytetowo. Najlepiej ustawi\u0107 na minimum, jakie potrzebuje najbardziej rozwini\u0119ta wioska do podtrzymania nieprzerwanej rekrutacji i/lub rozbudowy.',
							controls: [
								{ type: 'input', attributes: { id: 'resourcesSafeguard_wood',	size: 10, value: Settings.resourcesSafeguard[0] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/holz.png' },
								{ type: 'input', attributes: { id: 'resourcesSafeguard_stone',	size: 10, value: Settings.resourcesSafeguard[1] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/lehm.png' },
								{ type: 'input', attributes: { id: 'resourcesSafeguard_iron',	size: 10, value: Settings.resourcesSafeguard[2] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/eisen.png' }
							]
						},
						{
							name: 'Zabezpieczenie w kupcach',
							description: 'Liczba kupc\xF3w, kt\xF3ra ma by\u0107 zostawiona w wioskach. W wi\u0119kszo\u015Bci przypadk\xF3w mo\u017Cna zostawi\u0107 na 0. Ustawienie czasem si\u0119 przydaje na froncie, kiedy chcemy mie\u0107 nieprzerwan\u0105 mo\u017Cliwo\u015B\u0107 wys\u0142ania szybkiego transportu do \u015Bwie\u017Co przej\u0119tej/odbitej wioski na odbudow\u0119. Tak\u017Ce daje nam ci\u0105g\u0142\u0105 mo\u017Cliwo\u015B\u0107 zrobienia uniku surowcami.',
							controls: [
								{ type: 'input', attributes: { id: 'tradersSafeguard', size: 1, value: Settings.tradersSafeguard }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/buildings/market.png' }
							]
						},
						{
							name: 'Maksymalne wype\u0142nienie spichlerza (%)',
							description: 'Je\u017Celi w wiosce jest wi\u0119ksze wype\u0142nienie spichlerza, ni\u017C zadany procent, to wioska roze\u015Ble surowce do innych wiosek. Wioski tak\u017Ce nie wezw\u0105 surowc\xF3w ponad taki procent pojemno\u015Bci spichlerza, nawet je\u015Bli b\u0119dzie to oznacza\u0142o nie wype\u0142nienie do zadanej w innym ustawieniu warto\u015Bci.',
							controls: [
								{ type: 'input', attributes: { id: 'overFlowThreshold', size: 1, value: Settings.overFlowThreshold }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/buildings/storage.png' }
							]
						},
						{
							name: 'Uwzgl\u0119dnianie trwaj\u0105cych transport\xF3w',
							description: 'Czy skrypt ma uwzgl\u0119dnia\u0107 surowce aktualnie transportowane. Uwaga: nie s\u0105 brane pod uwag\u0119 czasy trwaj\u0105cych transport\xF3w. Surowce w nich traktowane s\u0105 jako przynale\u017Cne do wioski docelowej, co mo\u017Ce ukry\u0107 potrzeb\u0119 priorytetowego uzupe\u0142nienia zabezpieczenia w surowcach.',
							controls: [
								{ type: 'input', attributes: { id: 'considerOngoingTransports', type: 'checkbox', checked: Settings.considerOngoingTransports }, img: 'https://dspl.innogamescdn.com/asset/cbd6f76/graphic/btn/time.png' }
							]
						},
						{
							name: 'Rozszerzona optymalizacja',
							description: 'Czy plan transport\xF3w mo\u017Ce zawiera\u0107 wioski b\u0119d\u0105ce po\u015Brednikami, ale nie przyjmuj\u0105ce surowc\xF3w dla siebie. Skraca znacz\u0105co czasy transport\xF3w kosztem dodatkowego klikania przy wysy\u0142aniu transport\xF3w.',
							controls: [
								{ type: 'input', attributes: { id: 'extendedOptimization', type: 'checkbox', checked: Settings.extendedOptimization }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/premium/features/AccountManager_small.png' }
							]
						},
						{
							name: 'Minimalne wezwanie surowc\xF3w',
							description: 'Wioski, kt\xF3rych wezwania surowc\xF3w nie przekraczaj\u0105 zadanej warto\u015Bci minimalnej w \u017Cadnym z typ\xF3w surowc\xF3w, zostan\u0105 pomini\u0119te w planie. Je\u017Celi cho\u0107 jeden z trzech typ\xF3w surowc\xF3w przekracza w planie zadan\u0105 warto\u015B\u0107 wezwania do wioski, to wszystkie transporty do tej wioski zostan\u0105 wykonane. Przydatne na du\u017Cych kontach, aby ograniczy\u0107 ilo\u015B\u0107 klikania przy wykonywaniu planu.',
							controls: [
								{ type: 'input', attributes: { id: 'minSummon', size: 10, value: Settings.minSummon }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/buildings/storage.png' }
							]
						}
					];

					const div = document.createElement('div');
					div.style.margin = '0px 0px 10px 0px';
					div.setAttribute('id', namespace);
					div.classList.add('vis', 'vis_item');
					div.append(this.create_header());
					div.append(this.create_script_description());
					if (Settings.isNewerVersion()) { div.append(this.create_warning()); }
					div.append(this.create_stats_panel());
					div.append(this.create_main_panel());
					div.append(this.create_submition_panel());
					div.append(this.create_footer());

					$('#content_value')[0].prepend(div);
				} catch (ex) { Debugger.handle_error(ex); }
			},
			show_plan: function () {
				Debugger.logLine('show_plan()');

				const div = document.createElement('div');
				div.classList.add('vis');
				div.style.border = 'none';
				div.style.margin = 'auto';
				const title = document.createElement('h2');
				title.innerText = 'Plan Wezwań Surowców';
				div.append(title);

				const table = document.createElement('table');
				table.style['border-spacing'] = '2px';
				table.style['border-collapse'] = 'separate';
				table.classList.add('nowrap');

				let summons = Script.plan.summons;
				let res_classes = ['res wood', 'res stone', 'res iron'];

				for (let i=0; i<summons.length; i++) {
					let summon = summons[i];
					let res = [0,0,0];
					for (let j=0; j<summon.transports.length; j++) {
						for (let k=0; k<3; k++) { res[k] += summon.transports[j].resources[k]; }
					}
					
					const summonning_tr =	document.createElement('tr');

					const unroll_th = document.createElement('th');
					const unroll_img = document.createElement('img');
					unroll_img.src = 'https://dspl.innogamescdn.com/asset/34fb11bc/graphic/arrow_right.png';
					
					unroll_th.append(unroll_img);
					summonning_tr.append(unroll_th);

					const summoning_village_label = document.createElement('th');
					for (let j=0; j<Script.villagesHandler.villages.length; j++) {
						if (Script.villagesHandler.villages[j].ID == summons[i].destination) {
							summoning_village_label.innerHTML = Script.villagesHandler.villages[j].label;
							break;
						}
					}
					summonning_tr.append(summoning_village_label);


					for (let j=0; j<3; j++) {
						const resource_th = document.createElement('th');
						resource_th.innerHTML = `<span class="${res_classes[j]}" style="padding: 1px 1px 1px 18px;">${res[j]}</span>`;
						summonning_tr.append(resource_th);
					}

					table.append(summonning_tr);

					for (let j=0; j<summon.transports.length; j++) {
						const summon_tr = document.createElement('tr');
						summon_tr.classList.add("row_b");
						const village_label = document.createElement('td');
						village_label.colSpan = '2';
						for (let k=0; k<Script.villagesHandler.villages.length; k++) {
							if (Script.villagesHandler.villages[k].ID == summons[i].transports[j].origin) {
								village_label.innerHTML = Script.villagesHandler.villages[k].label;
								break;
							}
						}
						summon_tr.append(village_label);
						for (let k=0; k<3; k++) {
							const resource_td = document.createElement('td');
							
							resource_td.innerHTML = `<span class="${res_classes[k]}" style="padding: 1px 1px 1px 18px;">${summon.transports[j].resources[k]}</span>`;
							summon_tr.append(resource_td);
						}
						summon_tr.style.display = 'none';
						table.append(summon_tr);
					}

					unroll_img.setAttribute('onClick', `
						if (this.src == 'https://dspl.innogamescdn.com/asset/34fb11bc/graphic/arrow_down.png') {
							let tr = $(this).closest('tr')[0];
							let trs = $(tr).closest('table').find('tr');
							for (let i=0; i<trs.length; i++) {
								if (trs[i] == tr) {
									while (trs[i].innerHTML != '') {
										i++;
										trs[i].style.display = 'none';
									}
									break;
								}
							}
							this.src = 'https://dspl.innogamescdn.com/asset/34fb11bc/graphic/arrow_right.png';
						} else {
							let tr = $(this).closest('tr')[0];
							let trs = $(tr).closest('table').find('tr');
							for (let i=0; i<trs.length; i++) {
								if (trs[i] == tr) {
									while (trs[i].innerHTML != '') {
										i++;
										trs[i].style.display = 'table-row';
									}
									break;
								}
							}
							this.src = 'https://dspl.innogamescdn.com/asset/34fb11bc/graphic/arrow_down.png';
						}
					`);

					table.append(document.createElement('tr'));
				}

				div.append(table);

				Dialog.show(namespace, div.outerHTML);
				$('#popup_box_'+namespace)[0].style.width = 'auto';
			}
		},
		villagesHandler: {
			villages: [],
			addVillage: function (_coords, _ID, _resources, _granary, _traders, _label) {
				Debugger.logLine('addVillage()');

				let l = this.villages.push({
					coords: {
						x: _coords[0],
						y: _coords[1]
					},
					ID: _ID,
					resources: {
						present: _resources,	// w wiosce (bez toSend)
						comming: [0,0,0],		// przybywające
						owned: [0,0,0],			// present+comming+toGet
						toSend: [0,0,0],		// plan wysyłek
						toGet: [0,0,0]			// plan odbiorow
					},
					granary: _granary,
					traders: {
						free: _traders[0],
						toUse: 0,
						all: _traders[1]
					},
					receiver: false,
					label: _label
				});

				let village = this.villages[l-1];
				for (let i=0; i<3; i++) { village.resources.owned[i] = village.resources.present[i]; }

				return village;
			},
			getBaseData: function (data) {
				Debugger.logLine('getBaseData()');

				const table = $(data).find('#production_table')[0];
				for (let i=1; i<table.rows.length; i++) {
					let row = table.rows[i];

					let coords = row.cells[1].innerText.match(/\d{3}\|\d{3}/g);
					coords = coords[coords.length-1].split("|").map(x => Number(x));

					let ID = $(row.cells[1]).find('.quickedit-vn')[0].dataset.id;

					let resources = [0,0,0];
					row.cells[3].innerText.trim().split(' ').map(x => Number(x.replace('.', ''))).forEach((x, i) => {
						resources[i] = x;
					});
					if(resources.length != 3) { throw 'Wczytano z\u0142\u0105 liczb\u0119 rodzaj\xF3w surowc\xF3w'; }
					let granary = Number(row.cells[4].innerText);
					let traders = row.cells[5].innerText.split("/").map(x => Number(x));

					let errors = [];
					if (coords[0]<1 || coords[0]>1000 || coords[1]<1 || coords[1]>1000) {
						errors.push('Wrong coords!');
						Debugger.logLine('coords: ' + coord[0] + '|' + coords[1]);
					}
					if (ID <= 0) {
						errors.push('Wrong village ID!');
						Debugger.logLine('ID: ' + ID);
					}
					if (resources[0]<0 || resources[0]>700000 || resources[1]<0 || resources[1]>700000 || resources[2]<0 || resources[2]>700000) {
						errors.push('Wrong resources!');
						Debugger.logLine('resources: ' + resources[0] + ',' + resources[1] + ',' + resources[2]);
					}
					if (traders[0]<0 || traders[0]>traders[1] || traders[0]>411 || traders[1]>411) {
						errors.push('Wrong traders!');
						Debugger.log('Traders: ' + traders[0] + '/' + traders[1]);
					}
					if (errors[0]) {
						while (erros[0]) { Debugger.logLine(erros.shift()); }
						throw 'Niepoprawnie wczytano informacje o wiosce!';
					}

					this.addVillage(coords, ID, resources, granary, traders, row.cells[1].innerHTML);
				}
			},
			updateVillages: function (transport, plus_minus_1) {
				Debugger.logLine('updateVillages()');

				let origin 		= transport.origin;
				let destination	= transport.destination;
				destination.receiver = false;

				for (let i=0; i<3; i++) {
					var change = transport.resources[i] * plus_minus_1;

					origin.resources.present[i] -= change;
					origin.resources.owned[i] -= change;
					origin.resources.toSend[i] += change;

					destination.resources.toGet[i] += change;
					destination.resources.owned[i] += change;

					if (destination.resources.toGet[i] > 0) { destination.receiver = true; }

					if (change <= 0) { continue; }
					if (origin.resources.present[i] < Settings.resourcesSafeguard[i]) {
						Debugger.logLine('i: ' + i + ', present: ' + origin.resources.present[i] + ', change: ' + change);
						throw 'Zaktualizowano informacje o wiosce do obecnej liczby surowc\xF3w mniejszej, ni\u017C resourcesSafeguard!';
					}
					if (origin.resources.owned[i] < Settings.resourcesSafeguard[i]) {
						Debugger.logLine('i: ' + i + ', present: ' + origin.resources.present[i] + ', change: ' + change);
						throw 'Zaktualizowano informacje o wiosce do posiadanej liczby surowc\xF3w mniejszej, ni\u017C resourcesSafeguard!';
					}
				}

				let traders = transport.traders*plus_minus_1
				origin.traders.free -= traders;
				origin.traders.toUse += traders;
				
				if (origin.traders.free < 0) { throw 'Zaktualizowano informacje o wiosce do ujemnej liczby kupc\xF3w!'; }
				if (origin.traders.free > origin.traders.all) { throw 'Zaktualizowano informacje o wiosce do liczby wolnych kupc\xF3w wi\u0119kszej, ni\u017C wszyscy kupcy tej wioski!'; }
			},
			compareVillages: {
				refCoords: { x: 0, y: 0},
				noReverse: 1,
				resources: {
					0: function (vA, vB) { return Script.villagesHandler.compareVillages.noReverse * (vA.resources.owned[0] - vB.resources.owned[0]); },
					1: function (vA, vB) { return Script.villagesHandler.compareVillages.noReverse * (vA.resources.owned[1] - vB.resources.owned[1]); },
					2: function (vA, vB) { return Script.villagesHandler.compareVillages.noReverse * (vA.resources.owned[2] - vB.resources.owned[2]); },
					sum: function (vA, vB) {
						let vA_sum = vA.resources.owned[0] + vA.resources.owned[1] + vA.resources.owned[2];
						let vB_sum = vB.resources.owned[0] + vB.resources.owned[1] + vB.resources.owned[2];
						return Script.villagesHandler.compareVillages.noReverse * (vA_sum - vB_sum);
					}
				},
				distance: function (vA, vB) {
					let distA = Utilities.distance(Script.villagesHandler.compareVillages.refCoords, vA.coords);
					let distB = Utilities.distance(Script.villagesHandler.compareVillages.refCoords, vB.coords);
					return Script.villagesHandler.compareVillages.noReverse * (distA - distB);
				}
			}
		},
		transportsHandler: {
			ongoingTransports: [],
			priorityTransports: [],
			generalTransports: [],
			addTransport: function (_transports, _resources, _origin, _destination) {
				Debugger.logLine('addTransport()');

				if (_origin.ID == _destination.ID) {
					Debugger.logLine('resources: ' + _resources[0] + ',' + _resources[1] + ',' + _resources[2] + ', coords: (' + _origin.coords.x + '|' + _origin.coords.y + '), ' + ' ID: ' + _origin.ID);
					throw 'Pr\xF3ba utworzenia transportu z tej samej do tej samej wioski!';
				 }
				for (let i=0; i<3; i++) { 
					if (_resources[i] < 0) {
						throw 'Pr\xF3ba utworzenia transportu z ujemnymi surowcami! - ' + _resources[0] + ',' + _resources[1] + ',' + _resources[2];
					}
				}
				if (_resources[0] + _resources[1] + _resources[2] == 0) { throw 'Pr\xF3ba utworzenia pustego transportu!'; }

				let l = _transports.push({
					resources: _resources,
					traders: (_resources[0] + _resources[1] + _resources[2]) / 1000,
					origin: _origin,
					destination: _destination,
					distance: Utilities.distance(_origin.coords, _destination.coords),
				});

				let addedTransport = _transports[l-1];
				Debugger.logLine('	NEW TRANSPORT: (' + addedTransport.resources[0] + ',' + addedTransport.resources[1] + ',' + addedTransport.resources[2] + ')' + ' traders:' + addedTransport.traders);
				Script.villagesHandler.updateVillages(addedTransport, 1);

				return addedTransport;
			},
			compareTransports: {
				route: function (tA, tB) {
					if (tA.destination.ID == tB.destination.ID) {
						return tA.origin.ID - tB.origin.ID;
					} else {
						return tA.destination.ID - tB.destination.ID;
					}
				},
				cost: function (tA, tB) { return Script.transportsHandler.transportCost(tB) - Script.transportsHandler.transportCost(tA); }
			},
			transportCost: function (transport) { return transport.traders * transport.distance * transport.distance;
			},
			reduceTransport: function (reduction, transports, i) {
				Debugger.logLine('reduceTransport()');

				Debugger.logLine('	Reduction: i: ' + i + ', (' + reduction[0] +','+ reduction[1] +','+ reduction[2] + '), origin: ' + transports[i].origin.ID + ', destination: ' + transports[i].destination.ID);

				if( reduction[0]<0 || reduction[1]<0 || reduction[2]<0 ) {
					throw 'Pr\xF3ba zredukowania transportu o ujemn\u0105 warto\u015B\u0107! - redukcja: ' + reduction[0] + ',' + reduction[1] + ',' + reduction[0];
				}
				if(reduction[0]+reduction[1]+reduction[2] <= 0) { throw 'Pr\xF3ba zredukowania transportu o 0! - redukcja: ' + reduction[0] + ',' + reduction[1] + ',' + reduction[0]; }

				Script.villagesHandler.updateVillages(transports[i], -1);
				transports[i].traders -= ((reduction[0] + reduction[1] + reduction[2]) / 1000);
				for (let k=0; k<3; k++) { transports[i].resources[k] -= reduction[k]; }
				Script.villagesHandler.updateVillages(transports[i], 1);
			},
			getOngoingTransports: function (data) {
				Debugger.logLine('getOngoingTransports()');

				let table = $(data).find('#trades_table').get()[0];
				if (!table) { 
					if($(data).find('#paged_view_content > table:nth-child(7) > tbody > tr > td')[0].innerText.split(': ')[1] === '0') {
						return;
					}
					throw 'Wyst\u0105pi\u0142 b\u0142\u0105d podczas pobierania danych z przegl\u0105du transport\xF3w. Skrypt nie b\u0119dzie w stanie ich uwzgl\u0119dni\u0107 opracowuj\u0105c plan!';
				}	

				for (let i=1; i<table.rows.length-1; i++) {
					let cells = table.rows[i].cells;

					let id = $(cells[4]).find('a')[0].href.split('id=')[1];
					let traders = Number(cells[7].innerText);
					let resources = [0,0,0];

					let incommings = $(cells[8]).find('.nowrap');
					for (let j=0; j<incommings.length; j++) {
						let res = Number(incommings[j].innerText.replace('.', ''));

						let icon = incommings[j].getElementsByClassName("icon header")[0];
						let index = -1;
						if (icon.title == "Drewno")			{ index = 0; }
						if (icon.title == "Glina")			{ index = 1; }
						if (icon.title == "\u017Belazo")	{ index = 2; }
						if (index == -1) { throw 'B\u0142\u0105d w rozpoznawaniu tupu surowc\xF3w w aktywnym transporcie. Skrypt nie b\u0119dzie w stanie uwzgl\u0119dni\u0107 wszystkich trwaj\u0105cych transport\xF3w opracowuj\u0105c plan!'; }

						resources[index] = res;
					}
					this.ongoingTransports.push({villageID: id, traders: traders, resources: resources});
				}
			}
		},
		planCreator: {
			fillVillages: function (resoucesTargetLevel, transports) {
				Debugger.logLine('fillVillages('+resoucesTargetLevel[0]+','+resoucesTargetLevel[1]+','+resoucesTargetLevel[2]+')');
				let villages = Script.villagesHandler.villages;
				let compareVillages = Script.villagesHandler.compareVillages;
				
				let createdTransport = false;

				let shortages = [[], [], []];
				let surpluses = [];

				function if_capable_surplus(village, res) {
					if (village.traders.free <= Settings.tradersSafeguard)					{ return false; }
					if (village.resources.present[res] <= Settings.resourcesSafeguard[res])	{ return false; }
					if (village.resources.owned[res] <= resoucesTargetLevel[res])			{ return false; }
					return true;
				}

				for (let i=0; i<villages.length; i++) {
					let added_to_surpluses = false;
					for (let j=0; j<3; j++) {
						if (villages[i].resources.owned[j] > resoucesTargetLevel[j]) {
							if (!added_to_surpluses && if_capable_surplus(villages[i], j)) {
								added_to_surpluses = true;
								surpluses.push(villages[i]);
							}
						} else {
							shortages[j].push(villages[i]);
						}
					}
				}
				for (let i=0; i<3; i++) {
					compareVillages.noReverse = 1;
					shortages[i].sort(compareVillages.resources[i]);
					if(shortages[i][1] && shortages[i][0].resources[i] > shortages[i][1].resources[i]) {
						throw 'fillVillages() shortages sort failed';
					}
				}

				function anyShortage() {
					if (shortages[0].length > 0) { return true; }
					if (shortages[1].length > 0) { return true; }
					if (shortages[2].length > 0) { return true; }
					return false;
				}

				let counter_1 = 0
				Debugger.logLine('	fillVillages() while_1');
				while (	anyShortage() && surpluses.length > 0 ) {
					if(counter_1++ > 1000) { throw 'fillVillages(): '; }
					let receiver = null;
					let res = null;
					
					for (let i=0; i<3; i++) {
						if (!shortages[i][0]) { continue; }
						if (!receiver || receiver.resources.owned[res] > shortages[i][0].resources.owned[i]) {
							receiver = shortages[i][0];
							res = i;
						}
					}

					if (typeof receiver === null || typeof res === null) { throw 'fillVillages(): no receiver or no res'; }

					compareVillages.refCoords = receiver.coords;
					compareVillages.noReverse = 1;
					surpluses.sort(compareVillages.distance);

					if (surpluses[1] && Utilities.distance(surpluses[0].coords, receiver.coords) > Utilities.distance(surpluses[1].coords, receiver.coords)) {
						throw 'fillVillages() surpluses sort failed';
					}

					let lack = resoucesTargetLevel[res];
					let capacity = receiver.granary * Settings.overFlowThreshold / 100;
					if (capacity < lack) { lack = capacity;	}

					lack -= receiver.resources.owned[res];
					if (lack < 1000) {
						Debugger.logLine('		fillVillages() while_1 | (lack < 0) ==> shift()');
						shortages[res].shift();
						continue;
					}

					let firstLooper = null;
					let counter_2 = 0;
					Debugger.logLine('		fillVillages() while_1 while_2');
					while (surpluses[0] && surpluses[0] !== firstLooper) {
						if(counter_2++ > 1000) { throw 'fillVillages(): while_2 is infinite'; }

						let spare = surpluses[0].resources.owned[res] - resoucesTargetLevel[res];
						if (spare < 1000)
						{
							if (!firstLooper) { firstLooper = surpluses[0]; }
							surpluses.push(surpluses.shift());
							if (Settings.debug) { Debugger.logLine('			fillVillages() while_1 while_2 | (spare < 1000) ==> loop'); }
							continue;
						}
						if (surpluses[0].resources.present[res] - 1000 <= Settings.resourcesSafeguard[res]) {
							if (!firstLooper) { firstLooper = surpluses[0]; }
							surpluses.push(surpluses.shift());
							if (Settings.debug) { Debugger.logLine('			fillVillages() while_1 while_2 | (present - 1000 < safeguard) ==> loop'); }
							continue;
						}
						if (surpluses[0].traders.free - Settings.tradersSafeguard <= 0) {
							if (Settings.debug) { Debugger.logLine('			fillVillages() while_1 while_2 | (traders.free - tradersSafeguard <= 0) ==> shift()'); }
							surpluses.shift();
							continue;
						}
						if(surpluses[0] === receiver) { 
							if (!firstLooper) { firstLooper = surpluses[0]; }
							surpluses.push(surpluses.shift());
							if (Settings.debug) { Debugger.logLine('			fillVillages() while_1 while_2 | (surpluses[0] === receiver) ==> loop'); }
							continue;
						}

						let transportResources = [0,0,0];
						transportResources[res] = 1000;

						Debugger.logLine('			traders.free: ' + surpluses[0].traders.free + ', resources: (' + surpluses[0].resources.present[0]+','+surpluses[0].resources.present[1]+','+surpluses[0].resources.present[2] + ')');

						Script.transportsHandler.addTransport(transports, transportResources, surpluses[0], receiver);
						Debugger.logLine('			fillVillages() while_1 while_2 | NEW TRANSPORT');
						createdTransport = true;

						if (Settings.debug) { Debugger.verifyTransports(transports); }

						break;
					}
					if (surpluses[0] && surpluses[0] == firstLooper) {
						Debugger.logLine('		fillVillages() while_1 | (looper) ==> shift()');
						shortages[res].shift();
					}

					let pointer = 0;
					let counter_3 = 0;
					Debugger.logLine('		fillVillages() while_1 while_3')
					while (pointer < shortages[res].length-1) {
						if(counter_3++ > 1000) { throw 'fillVillages(): while_3 is infinite'; }
						if (shortages[res][pointer].resources.owned[res] < shortages[res][pointer+1].resources.owned[res]) { 
							if (Settings.debug) {  Debugger.logLine('			fillVillages() while_1 while_3 | end'); }
							break;
						}
						if (Settings.debug) {  Debugger.logLine('			fillVillages() while_1 while_3 | swap()'); }
						Utilities.swap(shortages[res], pointer, pointer+1);
						pointer++;
					}
				}

				if (createdTransport) {
					Debugger.verifyTransports(transports);
					Script.planOptimizer.normalization.init(transports);
				}
			},
			preventOverflowing: function (resoucesTargetLevel, transports) {
				Debugger.logLine("preventOverflowing()");

				let villages = Script.villagesHandler.villages;
				let compareVillages = Script.villagesHandler.compareVillages;

				let createdTransport = false;

				let villagesWithSpareGranary 	= [[], [], []];
				let villagesWithOverFlow 		= [[], [], []];

				for (let i=0; i<3; i++) {
					for (let j=0; j<villages.length; j++) {
						if (villages[j].resources.owned[i] / villages[j].granary > resoucesTargetLevel / 100) {
							if (villages[j].traders.free > Settings.tradersSafeguard) {
								villagesWithOverFlow[i].push(villages[j]);
							}
						} else {
							if (Settings.extendedOptimization == true || villages[j].receiver == true) {
								villagesWithSpareGranary[i].push(villages[j]);
							}
						}
					}
				}

				compareVillages.noReverse = -1;
				for (let i=0; i<3; i++) {
					villagesWithOverFlow[i].sort(compareVillages.resources[i]);
					if (villagesWithOverFlow[i][1] && villagesWithOverFlow[i][0].resources[i] < villagesWithOverFlow[i][1].resources[i]) {
						throw 'preventOverflowing(): overFlows sort failed';
					}
				}

				function preventionPossible() {
					if (villagesWithOverFlow[0].length > 0 && villagesWithSpareGranary[0].length > 0) { return true; }
					if (villagesWithOverFlow[1].length > 0 && villagesWithSpareGranary[1].length > 0) { return true; }
					if (villagesWithOverFlow[2].length > 0 && villagesWithSpareGranary[2].length > 0) { return true; }
					return false;
				}

				let counter_1 = 0;
				Debugger.logLine("	preventOverflowing() while_1");
				while (preventionPossible()) {
					if(counter_1++ > 1000) { throw 'preventOverflowing(): while_1 is infinite'; }
					let sender = null;
					let res = null;

					for (let i=0; i<3; i++) {
						if (!villagesWithOverFlow[i][0]) { continue; }
						if (!sender || sender.resources.owned[res] < villagesWithOverFlow[i][0].resources.owned[i]) {
							sender = villagesWithOverFlow[i][0];
							res = i;
						}
					}

					if (typeof sender === null || typeof res === null) { throw 'preventOverflowing(): no sender or no res'; }

					let overFlow = sender.resources.owned[res];
					overFlow -= sender.granary * resoucesTargetLevel / 100;
					if (overFlow <= 0) {
						if (Settings.debug) { Debugger.logLine("		preventOverflowing() while_1 | (overFlow <= 0) ==> shift()"); }
						villagesWithOverFlow[res].shift();
						continue;
					}

					if (sender.traders.free <= Settings.tradersSafeguard) {
						if (Settings.debug) { Debugger.logLine("		preventOverflowing() while_1 | (traders.free <= tradersSafeguard) ==> shift()"); }
						villagesWithOverFlow[res].shift();
						continue;
					}

					if (sender.resources.present[res] - overFlow < Settings.resourcesSafeguard[res]) {
						overFlow = sender.resources.present[res] - Settings.resourcesSafeguard[res];
						if (Settings.debug) { Debugger.logLine("		preventOverflowing() while_1 | (present - overFlow < safeguard) ==> overFlow = present - safeguard"); }
						if (overFlow <= 0) {
							if (Settings.debug) { Debugger.logLine("		preventOverflowing() while_1 | (overFlow <= 0) ==> shift()"); }
							villagesWithOverFlow[res].shift();
							continue;
						}
					}

					compareVillages.refCoords = sender.coords;
					compareVillages.noReverse = 1;
					villagesWithSpareGranary[res].sort(compareVillages.distance);

					if (villagesWithSpareGranary[res][1] && Utilities.distance(villagesWithSpareGranary[res][0].coords, sender.coords) > Utilities.distance(villagesWithSpareGranary[res][1].coords, sender.coords)) {
						throw 'preventOverflowing(): spareGranarys sort failed';
					}

					let counter_2 = 0;
					Debugger.logLine("		preventOverflowing() while_1 while_2");
					while (villagesWithSpareGranary[res][0]) {
						if(counter_2++ > 1000) { throw 'preventOverflowing(): while_2 is infinite'; }
						let receiver = villagesWithSpareGranary[res][0];
						let spereSpace = receiver.granary * resoucesTargetLevel / 100;
						spereSpace -= receiver.resources.owned[res];

						if (spereSpace < 1000) {
							if (Settings.debug) { Debugger.logLine("			preventOverflowing() while_1 while_2 | (spereSpace < 1000) ==> shift()"); }
							villagesWithSpareGranary[res].shift();
							continue;
						}

						let transportResources = [0,0,0];
						transportResources[res] = 1000;

						if(sender === receiver) { throw 'preventOverFlowing(): origin === destination'; }

						Script.transportsHandler.addTransport(transports, transportResources, sender, receiver);
						createdTransport = true;
						Debugger.logLine('			preventOverflowing() while_1 while_2 | NEW TRANSPORT');
						if (Settings.debug) { Debugger.verifyTransports(transports); }

						break;
					}
				}

				if (createdTransport) {
					Debugger.verifyTransports(transports);
					Script.planOptimizer.normalization.init(transports);
				}
			},
			createPlan: function () {
				Debugger.logLine('createPlan()');

				UI.SuccessMessage('Dane zosta\u0142y wczytane. Opracowuj\u0119 plan transport\xF3w...', 10000);

				this.fillVillages(Settings.resourcesSafeguard, Script.transportsHandler.priorityTransports);

				if (Settings.extendedOptimization) {
					let resTarget = [0,0,0];
					for (let i=0; i<3; i++) { resTarget[i] = Settings.resourcesRelayBuffer[i]; }

					let counter_4 = 0;
					let increase = false;
					do {
						this.fillVillages(resTarget, Script.transportsHandler.generalTransports);
						if(counter_4++ > 750) { throw 'createPlan(): while is infinite'; }
						increase = false;
						for (let i=0; i<3; i++) {
							if (resTarget[i] < Settings.resourcesFillTo[i]) {
								resTarget[i] += 1000;
								increase = true;
								if (resTarget[i] > Settings.resourcesFillTo[i]) {
									resTarget[i] = Settings.resourcesFillTo[i]
								}
							}
						}
					} while (increase)
				}
				else { this.fillVillages(Settings.resourcesFillTo, Script.transportsHandler.generalTransports); }
				if (Settings.overFlowThreshold < 100) { this.preventOverflowing(Settings.overFlowThreshold, Script.transportsHandler.generalTransports); }
				if (Script.transportsHandler.generalTransports.length > 0) { Script.planOptimizer.optimization.init(); }

				let p = Script.transportsHandler.priorityTransports;
				let g = Script.transportsHandler.generalTransports;
				if (p.length + g.length == 0) {
					UI.SuccessMessage('Zdaje si\u0119, \u017Ce nic nie potrzeba.', 5000);
					return;
				}
				let allTransports = [];
				for (let i=0; i<p.length; i++) { allTransports.push(p[i]); }
				for (let i=0; i<g.length; i++) { allTransports.push(g[i]); }

				Script.planOptimizer.normalization.init(allTransports);

				if (Settings.debug) { console.log(allTransports); }

				Script.plan = {
					summoned: 0,
					timestamp: Date.now(),
					group: Script.planCreator.loadGroup(),
					summons: []
				};

				for (let i=0; i<allTransports.length; i++) {
					let summon = null;
					for (let j=0; j<Script.plan.summons.length; j++) {
						if (Script.plan.summons[j] ) {
							if (Script.plan.summons[j].destination == allTransports[i].destination.ID) {
								summon = Script.plan.summons[j];
								break;
							}
						}
					}
					if (!summon) {
						Script.plan.summons.push({
							destination: allTransports[i].destination.ID,
							transports: [
								{
									origin: allTransports[i].origin.ID,
									resources: allTransports[i].resources
								}
							]
						});
					} else {
						summon.transports.push({
							origin: allTransports[i].origin.ID,
							resources: allTransports[i].resources
						});
					}
				}

				if (Settings.minSummon > 0) {
					for (let i=0; i<Script.plan.summons.length; i++) {
						let summon = Script.plan.summons[i];
						let res = [0,0,0];
						for (let j=0; j<summon.transports.length; j++) {
							res[0] += summon.transports[j].resources[0];
							res[1] += summon.transports[j].resources[1];
							res[2] += summon.transports[j].resources[2];
						}
						if (Math.max(res) < Settings.minSummon) {
							Utilities.swap(Script.plan.summons, 0, i);
							Script.plan.summons.shift();

							if (!Script.plan.summons[i]) { break; }
							i--;
						}
					}
				}

				function coord(id) {
					for (let i=0; i<Script.villagesHandler.villages.length; i++) {
						if (Script.villagesHandler.villages[i].ID == id) {
							return Script.villagesHandler.villages[i].coords.x + '|' + Script.villagesHandler.villages[i].coords.y;
						}
					}
				}

				Debugger.logLine("plan utworzony:");

				for (let i=0; i<Script.plan.summons.length; i++) {
					let summon = Script.plan.summons[i];
					let res = [0,0,0];
					for (let j=0; j<summon.transports.length; j++) {
						for (let k=0; k<3; k++) { res[k] += summon.transports[j].resources[k]; }
					}
					Debugger.logLine(coord(summon.destination) + ' (' + res[0] + ',' + res[1] + ',' + res[2]+')');
					for (let j=0; j<summon.transports.length; j++) {
						Debugger.logLine('	' + coord(summon.transports[j].origin) + ' ' + summon.transports[j].resources);
					}
				}

				this.savePlan();

				UI.SuccessMessage('Plan utworzony. Liczba transport\xF3w: ' + allTransports.length, 5000);
				Script.gui.activate_buttons();

				if (Settings.debug) { 
					throw 'DEBUGOWANIE';
				}
			},
			loadGroup: function () {
				Debugger.logLine('loadGroup()');

				let groups = $('.group-menu-item');
				for (let i=0; i<groups.length; i++) {
					if (groups[i].nodename == 'strong') {
						return groups[i].getAttribute('data-group-id');
					}
				}
				return null;
			},
			savePlan: function () {
				Debugger.logLine('savePlan()');

				localStorage.removeItem(namespace);
				if (!Script.plan.summons[0]) { return; }
				let planJSON = JSON.stringify(Script.plan);
				localStorage.setItem(namespace, planJSON);
			},
			init: async function () {
				Debugger.logLine("planCreator.init()");

				Script.gui.load_settings();

				Settings.resourcesRelayBuffer = [0,0,0];
				for (let i=0; i<3; i++) {
					let tmp = Settings.resourcesFillTo[i] + Settings.resourcesSafeguard[i];
					tmp = Math.floor(tmp/2);
					Settings.resourcesRelayBuffer[i] = tmp;
				}

				if (Settings.considerOngoingTransports && Script.transportsHandler.ongoingTransports[0]) {
					Debugger.logLine('ongoing transports consideration');
					let transports = Script.transportsHandler.ongoingTransports;
					let villages = Script.villagesHandler.villages;

					for (let i=0; i<transports.length; i++) {
						for (let j=0; j<villages.length; j++) {
							if (villages[j].ID == transports[i].villageID) {
								for (let k=0; k<3; k++) {
									villages[j].resources.comming[k] += transports[i].resources[k];
									villages[j].resources.owned[k] += transports[i].resources[k];
								}
								break;
							}
						}
					}
				}
				
				this.createPlan();
			}
		},
		planOptimizer: {
			normalization: {
				reduceSums: function (transports) {
					Debugger.logLine("reduceSums()");

					let swapDone = false;

					for (let i=0; i<transports.length-1; i++) {
						for (let j=i+1; j<transports.length; j++) {
							if (transports[i].origin == transports[j].destination) { continue; }
							if (transports[j].origin == transports[i].destination) { continue; }
							if (transports[i].origin == transports[j].origin) { continue; }
							if (transports[i].destination == transports[j].destination) { continue; }

							let potentialSumDist = 0;
							potentialSumDist += Utilities.distance(transports[i].origin.coords, transports[j].destination.coords);
							potentialSumDist += Utilities.distance(transports[j].origin.coords, transports[i].destination.coords);

							if (potentialSumDist < transports[i].distance + transports[j].distance) {
								let reduction = [0,0,0];

								for (let k=0; k<3; k++) {
									reduction[k] = Math.min(transports[i].resources[k], transports[j].resources[k]);
								}

								if (reduction[0]+reduction[1]+reduction[2] == 0) { continue; }

								Debugger.logLine("	reduceSums() | transport swap found");
								swapDone = true;
								
								Script.transportsHandler.reduceTransport(reduction, transports, i);
								Script.transportsHandler.reduceTransport(reduction, transports, j);

								for (let k=0; k<2; k++) {
									let resources = [reduction[0], reduction[1], reduction[2]];
									let origin = 		transports[i*(k) + j*(1-k)].origin;
									let destination =	transports[j*(k) + i*(1-k)].destination;

									if(origin === destination) { throw 'reduceSums(): origin === destination'; }

									Script.transportsHandler.addTransport(transports, resources, origin, destination);
								}
								if (Settings.debug) { Debugger.verifyTransports(transports); }
							}
						}
					}

					if (swapDone) { Debugger.verifyTransports(transports); }
				},
				merge: function (transports) {
					Debugger.logLine("merge()");
					let mergeDone = false;
					transports.sort(Script.transportsHandler.compareTransports.route);
					Debugger.verifyTransports(transports);

					function if_same_route(tA, tB) {
						if (tA.destination.ID	!= tB.destination.ID)	{ return false; }
						if (tA.origin.ID		!= tB.origin.ID)		{ return false; }
						return true;
					}

					let counter_1 = 0;
					for (let i=0; i < transports.length-1; i++) {
						if(counter_1++ > 1000) { throw 'merge(): for_1 is infinite'; }
						if (if_same_route(transports[i], transports[i+1])) {
							Debugger.logLine("	merge() | merging i: " + i + ", i+1: " + (i+1));
							mergeDone = true;
							let resources = [0,0,0];
							for (let j=0; j<3; j++) { resources[j] = transports[i].resources[j] + transports[i+1].resources[j];	}

							let origin = transports[i].origin;
							let destination = transports[i].destination;

							Script.villagesHandler.updateVillages(transports[i], -1);
							Utilities.swap(transports, 0, i);
							transports.shift();
							Script.villagesHandler.updateVillages(transports[i], -1);
							Utilities.swap(transports, 0, i);
							transports.shift();

							Script.transportsHandler.addTransport(transports, resources, origin, destination);

							if(transports.length == 1) { break;	}

							transports.sort(Script.transportsHandler.compareTransports.route);
							i--;

							if (Settings.debug) { Debugger.verifyTransports(transports); }
						}
					}

					if (mergeDone) { Debugger.verifyTransports(transports); }
				},
				reduceOpposing: function (transports) {
					Debugger.logLine("reduceOpposing()");
					let reductionDone = false;

					function if_opposinge_route(tA, tB) {
						if (tA.destination.ID	!= tB.origin.ID)	{ return false; }
						if (tA.origin.ID		!= tB.destination.ID)		{ return false; }
						return true;
					}

					for (let i=0; i < transports.length - 1; i++) {
						for (let j = i+1; j < transports.length; j++) {
							if (if_opposinge_route(transports[i], transports[j])) {
								let reduction = [0,0,0];
								let reduction_sum = 0;

								for (let k=0; k<3; k++) {
									reduction[k] = Math.min(transports[i].resources[k], transports[j].resources[k]);
									reduction_sum += reduction[k];
								}
								if (reduction_sum == 0) { continue; }

								Debugger.logLine('	reduceOpposing() | reduction ('+reduction[0]+','+reduction[1]+','+reduction[2]+')');
								reductionDone = true;

								if (reduction_sum < 0) { throw 'Calculated reduction sum is negative! - reduction: ('+reduction[0]+','+reduction[1]+','+reduction[2]+')'; }

								Script.transportsHandler.reduceTransport(reduction, transports, i);
								Script.transportsHandler.reduceTransport(reduction, transports, j);

								if (Settings.debug) { Debugger.verifyTransports(transports); }
							}
						}
					}

					if (reductionDone) { Debugger.verifyTransports(transports); }
				},
				removeEmptys: function (transports) {
					Debugger.logLine("removeEmptys()");
					let removalDone = false;

					let counter_1 = 0;
					for (let i=0; i<transports.length; i++) {
						if(counter_1++ > 1000) { throw 'removeEmptys(): for_1 is infinite'; }
						if (transports[i].traders == 0) {
							Debugger.logLine("	removeEmptys() | removal");
							removalDone = true;
							Script.villagesHandler.updateVillages(transports[i], -1);
							Utilities.swap(transports, 0, i);
							transports.shift();
							i--;
							if (Settings.debug) { Debugger.verifyTransports(transports); }
						}
					}

					if (removalDone) { Debugger.verifyTransports(transports); }
				},
				init: function (transports) {
					Debugger.logLine("normalization.init()");

					if (transports.length >= 1) {
						this.removeEmptys(transports);
					}
					if (transports.length >= 2) {
						this.merge(transports);
					}
					if (transports.length >= 2) {
						this.reduceSums(transports);
						this.removeEmptys(transports);
					}
					if (transports.length >= 2) {
						this.merge(transports);
					}
					if (transports.length >= 2) {
						this.reduceOpposing(transports);
						this.removeEmptys(transports);
					}
				}
			},
			optimization: {
				removeSuboptimalBrokers () {
					Debugger.logLine("removeSuboptimalBrokers()");

					let transports = Script.transportsHandler.generalTransports;
					let newTransport = false;

					for	(let i=0; i<transports.length; i++) {
						for (let j=0; j<transports.length; j++) {
							if (transports[i].destination == transports[j].origin) {
								let potShortcutDist = Utilities.distance(transports[i].origin.coords, transports[j].destination.coords);
								if (2 * potShortcutDist < transports[i].distance + transports[j].distance) {
									let res = [0,0,0];
									for (let k=0; k<3; k++) { res[k] = Math.min(transports[i].resources[k], transports[j].resources[k]); }

									let resSum = res[0] + res[1] + res[2];
									if (resSum > 0) {
										Debugger.logLine("	removeSuboptimalBrokers() | shortcut found!");
										Script.transportsHandler.reduceTransport(res, transports, i);
										Script.transportsHandler.reduceTransport(res, transports, j);

										if(transports[i].origin == transports[j].destination) { throw 'removeSuboptimalBrokers(): origin === destination'; }
										
										Script.transportsHandler.addTransport(transports, res, transports[i].origin, transports[j].destination);

										newTransport = true;

										if (Settings.debug) { Debugger.verifyTransports(transports); }
									}
								}
							}
						}
					}

					if(newTransport) { 
						Debugger.verifyTransports(transports);
						Script.planOptimizer.normalization.init(transports);
					}
				},
				relayThroughBrokers () {
					Debugger.logLine("relayThroughBrokers()");

					let villages = Script.villagesHandler.villages;
					let transports = Script.transportsHandler.generalTransports;
					if (transports.length == 0) { return; }

					let newTransport = false;

					let potBrokers = [];

					if (Settings.extendedOptimization) {
						for (let i=0; i<villages.length; i++) {
							if (villages[i].traders.free > Settings.tradersSafeguard) {
								potBrokers.push(villages[i]);
							}
						}
					} else {
						for (let i=0; i<villages.length; i++) {
							if (!villages[i].receiver) { continue; }
							if (villages[i].traders.free > Settings.tradersSafeguard) {
								potBrokers.push(villages[i]);
							}
						}
					}

					let refTrans = null;

					function maxDistRelay(village) { return Math.max(Utilities.distance(refTrans.origin.coords, village.coords), Utilities.distance(village.coords, refTrans.destination.coords));	}
					function comparePotentialBrokers(vA, vB) {	return maxDistRelay(vA) - maxDistRelay(vB);	}

					for (let i=0; i<transports.length; i++) {
						Debugger.logLine('	relayThroughBrokers() i = ' + i);
						transports.sort(Script.transportsHandler.compareTransports.cost);
						if (transports[1] && Script.transportsHandler.transportCost(transports[0]) < Script.transportsHandler.transportCost(transports[1])) {
							throw 'relayThroughBrokers() transports sort failed';
						}

						refTrans = transports[i];
						potBrokers.sort(comparePotentialBrokers);
						if (potBrokers[1] && maxDistRelay(potBrokers[0]) > maxDistRelay(potBrokers[1])) {
							throw 'relayThroughBrokers() potBrokers sort failed';
						}			

						for (let j=0; j<potBrokers.length; j++) {
							if (maxDistRelay(potBrokers[j]) >= refTrans.distance) { break; }

							let res = [1000,1000,1000];
							let res2 = [0,0,0];
							let traders = 0;
							for (let k=0; k<3; k++) {
								res[k] = Math.min(res[k], transports[i].resources[k]);
								res[k] = Math.min(res[k], potBrokers[j].resources.present[k] - Settings.resourcesRelayBuffer[k]);
								if (res[k] < 1000) { res[k] = 0; }
								traders += res[k] / 1000;
								res2[k] = res[k];
							}
							if (traders == 0) {
								if (Settings.debug) { Debugger.logLine('		relayThrougBrokers() | (traders == 0) => continue'); }
								continue;
							}
							if (traders > potBrokers[j].traders.free - Settings.tradersSafeguard) {
								if (Settings.debug) { Debugger.logLine('		relayThrougBrokers() | (traders > traders.free - Safeguard) => shift()'); }
								Utilities.swap(potBrokers, 0, j);
								potBrokers.shift();
								j--;
								continue;
							}

							if (res[0]+res[1]+res[2]<=0) { throw 'reduction is <= 0'; }

							Debugger.logLine('		relayThrougBrokers() | relay created for ' + i + ' !');
							
							Script.transportsHandler.reduceTransport(res, transports, i);

							if(transports[i].origin === potBrokers[j]) { throw 'relayThrougBrokers(): origin === destination (1)'; }
							Script.transportsHandler.addTransport(transports, res, transports[i].origin, potBrokers[j]);

							if(potBrokers[j] === transports[i].destination) { throw 'relayThrougBrokers(): origin === destination (2)'; }
							Script.transportsHandler.addTransport(transports, res2, potBrokers[j], transports[i].destination);

							newTransport = true;
							i--;

							if (Settings.debug) { Debugger.verifyTransports(transports); }
							break;
						}
					}

					Debugger.verifyTransports(transports);
					if (newTransport) {	Script.planOptimizer.normalization.init(transports); }
				},
				init: function () {
					Debugger.logLine('optimization.init()');

					this.removeSuboptimalBrokers();
					this.relayThroughBrokers();
				}
			}
		},
		planExecutor: {
			loadPlan: function () {
				Debugger.logLine('loadPlan()');

				Script.plan = JSON.parse(localStorage.getItem(namespace));
				if (Script.plan === null) { return false; }
				if (Date.now() - Script.plan.timestamp > 1800000) {
					Script.plan = {};
					localStorage.removeItem(namespace);
					return false;
				}
				return true;
			},
			setVillageAndGroup: function () {
				Debugger.logLine('setVillageAndGroup()');

				function reload() {
					Debugger.logLine('reload()');
					let url = '/game.php?screen=market&mode=call&village=' + Script.plan.summons[0].destination;
					if (Script.plan.group) { url += '&group=' + Script.plan.group; }
					location = url;
				}
				if (game_data.village.id != Script.plan.summons[0].destination) {
					reload();
					return true;
				}
				if (Script.plan.group && Script.plan.group != Script.planCreator.loadGroup()) {
					reload();
					return true;
				}
				if (game_data.screen != 'market') {
					reload();
					return true;
				}
				return false;
			},
			init: async function () {
				Debugger.logLine('planExecutor.init()');

				if(this.setVillageAndGroup()) { return; }

				let summon = Script.plan.summons[0];
				let inputs = $('#village_list tbody tr td input');

				for (let i=0; i<summon.transports.length; i++) {
					for (let j=0; j<inputs.length; j++) {
						if (inputs[j].type == 'checkbox' && inputs[j].value == summon.transports[i].origin) {
							$(inputs[j]).trigger('click');
							$(inputs[j-1]).val(summon.transports[i].resources[2]);
							$(inputs[j-2]).val(summon.transports[i].resources[1]);
							$(inputs[j-3]).val(summon.transports[i].resources[0]);
							break;
						}
					}
				}

				Script.plan.summons.shift();
				Script.plan.summoned++;

				let buttons = $('form[name=call-resources] .btn');

				buttons[0].focus();
				if (Script.plan.summons[0]) {
					for (button of buttons) {
						button.addEventListener('click', async function () {
							try {
								Script.planCreator.savePlan();
								Script.planExecutor.setVillageAndGroup();
							} catch (ex) { Debugger.handle_error(ex); }
						});
					}
					let progress = Script.plan.summoned / (Script.plan.summoned+Script.plan.summons.length);
					progress *= 25;
					progress = Math.floor(progress);
					let message = 'Dysponent Surowcowy: '
					for (let i=1; i<=25; i++) {
						if (i<=progress) {
							message += '\u2B22';
							continue;
						}
						message += '\u2B21';
					}
					UI.SuccessMessage(message, 5000);
				} else {
					for (button of buttons) {
						button.addEventListener('click', async function () {
							try { 
								Script.planCreator.savePlan();
								UI.SuccessMessage('Dysponent Surowcowy: Plan transport\xF3w!', 5000);
							} catch (ex) { Debugger.handle_error(ex); }
						});
					}
					UI.SuccessMessage('Dysponent Surowcowy: To ju\u017C ostatnie transporty!', 5000);
				}
			}
		},
        main: async function () {
			Debugger.logLine('main()');

			Settings.sitter = (game_data.player.sitter !== '0') ? '&t=' + game_data.player.id : '';

			if (game_data.screen == 'overview_villages') {
				Debugger.logLine('overview_villages');
				if ($('#'+namespace)[0]) {
					$('#'+namespace)[0].remove();
					return;
				} else {
					$.ajax({
						url: '/game.php?screen=overview_villages&mode=prod&page=-1' + Settings.sitter,
						type: 'GET',
						async: false,
						success: function (response) { try { Script.villagesHandler.getBaseData(response); } catch (ex) { Debugger.handle_error(ex); } }
					});

					$.ajax({
						url: '/game.php?screen=overview_villages&mode=trader&type=inc&page=-1' + Settings.sitter,
						type: 'GET',
						async: false,
						success: function (response) { try { Script.transportsHandler.getOngoingTransports(response); } catch (ex) { Debugger.handle_error(ex); } }
					});

					Script.gui.create_gui();
					return;
				}
			}

			if (document.URL.indexOf("screen=market") != -1 && document.URL.indexOf("mode=call") != -1) {
				Debugger.logLine('screen=market&mode=call');
				if (Script.planExecutor.loadPlan()) {
					Script.planExecutor.init();
					return;
				} else {
					UI.ErrorMessage('Dysponent Surowcowy: Uruchom skrypt w zak\u0142adce Przegl\u0105dy > Produkcja.', 10000);
					return;
				}
			}
			UI.ErrorMessage('Dysponent Surowcowy: Uruchom skrypt w zak\u0142adce Przegl\u0105dy > Produkcja lub Rynek > Wezwij.', 10000);
        }
    };
    try { await Script.main(); } catch (ex) { Debugger.handle_error(ex); }
})(TribalWars);

//	change log:
//		2.0.0.1-2.0.1.X by PabloCanaletto
//			> prototypes and alphas
//		2.0.2.0 - 17.01.2021 by PabloCanaletto
//			> first Beta
//			> major features complete
//		2.0.2.1 - 17.01.2021 by PabloCanaletto
//			> bug fix - reversed sort of potBrokers in relayThroughBrokers()
//			> bug fix - typo 'vilages' in preventOverflowing()
//		2.0.2.2 - 18.01.2021 by PabloCanaletto
//			> added version label
//		2.0.2.3 - 19.01.2021 by PabloCanaletto
//			> bug fix in village choosing of shortages and surpluses
//		2.0.2.4 - 20.01.2021 by PabloCanaletto
//			> throwing erros instead of just console logging
//			> added img in header
//			> handling groups with over 1k villages
//			> data loading reorganisation for future development
//		2.0.3.0 - 21.01.2021 by PabloCanaletto
//			> added stats panel
//			> added storing ongoing transports for stats
//		2.0.4.0 - 23.01.2021 by PabloCanaletto
//			> bug fix - multiple typos in texts
//			> bug fix - handling no ongoing transports
//			> bug fix - wrong referencing in insert sort of shortages
//			> added Debug Log for customer support
//			> bug fix - added normalization of allTransports
//		2.0.4.1 - 24.01.2021 by PabloCanaletto
//			> character escapes
//			> bug fix - wrong reference: (!eg) insted of (type of eg === null) in fillVillages and preventOverflowing
//			> bug fix - create_gui() out of error handling
//			> added plan age verification
//			> added plan age label
//			> added some more debug and logging
//		2.0.4.2 - 24.01.2021 by PabloCanaletto
//			> bug fix - loadPlan() was returning true if plan was outdated
//		2.0.5.0 - 25.01.2021 by PabloCanaletto
//			> bug fix - loadDefaults is now async to not stop script when failed
//			> added plan view
//		2.0.6.0 - 29.01.2021 by PabloCanaletto
//			> bug fix - relayThroughBrokers is no longer makeing 2 transport with the same array of resources
//			> debug logging optimized for release
//			> error handling modyfications
//			> added transports verification
//		2.0.6.1 - 1.02.2021 by PabloCanaletto
//			> more specific "Call resources" buttons searching (compatibility with other scripts)
//			> bug fix - addVillage is no longer using the same array to create owned resources and present resources arrays
//			> bug fix - addVillage no longer throws error, when surplus vilagge === lacking village, just loops back
//			> added some more debug and logging
//			> bug fix - preventOverfloving no longer leaves less then safeguard
//			> bug fix - updateVillages no longer updates traders 3 times
//			> bug fix - relayThroughBrokers now verifies free traders of broker
//			> bug fix - wrong village labels in plan table GUI (usage of an iterator of a different loop)
//		2.0.6.2 - 2.02.2021 by PabloCanaletto
//			> bug fix - loadSetting() was operating on copies of pimitives from Settings {}
//			> character escapes in stats panel
