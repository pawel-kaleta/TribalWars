javascript:

//	author:		PabloCanaletto
//	version:	2.0.2.2 (beta)
//	disclaimer:	You are free to use this script in any way you like and to submit changes.
//				I would only appreciate you to leave notification about my orginal authorship untouched
//				with the whole history of changes.

//	change log:
//		2.0.0.1-2.0.1.X by PabloCanaletto
//			> prototypes and alphas
//		2.0.2.0 - 17.01.2021 by PabloCanaletto
//			> first Beta
//			> first feature complete version
//		2.0.2.1 - 17.01.2021 by PabloCanaletto
//			> bug fix - reversed sort of potBrokers in relayThroughBrokers()
//			> bug fix - typo 'vilages' in preventOverflowing()
//		2.0.2.2 -  by PabloCanaletto
//			> version label

/*
var DysponentSurowcowy = {
	// USTAWIENIA DOMYŚLNE
	resourcesFillTo: [20000, 20000, 20000],		// wypełniaj do tej wartości
	resourcesSafeguard: [2000, 2000, 2000],		// zabezpieczenie w surowcach, wypełniane priorytetowo
	tradersSafeguard: 0,						// zabezpieczenie w kupcach
	considerOngoingTransports: false,			// uwzględnij przychodzące transporty (tak - true, nie - false)
	overFlowThreshold: 75,						// % pojemności spichlerza, powyżej którego zapobiegaj przelewaniu się
	extendedOptimization: true,					// czy optymalizacja może generować dodatkowych odbiorców (więcej klikania)
	minSummon: 0,
};
*/

(async function (TribalWars) {
	const namespace = 'Dysponent_Surowcowy_2';
	const version = 'v2.0.2.2';
    const ErrorHandler = {
        handle_error: function (error) {
			var gui = '';
            if (typeof (error) === 'string') {
				gui = `
				<h2>Coś poszło nie tak...</h2>
				<p>
					<strong>${error}</strong><br/>
					<br/>
					Po dodatkową pomoc i informacje zajrzyj do wątku dotyczącego tego skryptu na Forum Ogólnym.<br/>
					<a href="https://forum.plemiona.pl/index.php?threads/dysponent-surowcowy.127245/">Link do wątku na forum</a>
				</p>
				`;
            }
            else {
				gui = `
					<h2>WTF - What a Terrible Failure</h2>
					<p>
						<strong>Wystąpił nieoczekiwany błąd. Aby uzyskać pomoc zajrzyj do wątku dotyczącego tego skryptu na Forum ogólnym. Jeśli nie znajdziesz tam żadnych informacji napisz zgłoszenie załączając poniższy komunikat o błędzie.</strong><br/>
						<br/>
						<a href="https://forum.plemiona.pl/index.php?threads/dysponent-surowcowy.127245/">Link do wątku na forum</a><br/>
						<br/>
						<strong>Komunikat o b\u{142}\u{119}dzie:</strong><br/>
						<textarea rows='5' cols='100'>${error}\n\n${error.stack}</textarea><br/>
					</p>
				`;
			}
            Dialog.show(namespace, gui);
        }
	};
	const Utilities = {
		swap: function (tab, ia, ib) {
			let temp = tab[ia];
			tab[ia] = tab[ib];
			tab[ib] = temp;
		},
		distance: function (cA, cB) { return Math.sqrt(Math.pow(cB.x - cA.x, 2) + Math.pow(cB.y - cA.y, 2));
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
		sitter: '',
		isNewerVersion: function () { return typeof DysponentSurowcowy == 'undefined' && typeof settings != "undefined"; },
		loadDefaults: async function () {
			try {
				if (!DysponentSurowcowy) { throw 'Nie znaleziono ustawień domyślnych. Zaleca się ponowne skopiowanie sygnatury skryptu ze skryptoteki na FO.' }
				var errorSetting = 'Wykryto błąd w ustawieniach domyślnych.';
				var adviceMessage = 'Zaleca się ponowne skopiowanie sygnatury skryptu ze skryptoteki na FO.';
				for (const setting of Object.keys(DysponentSurowcowy)) {
					if (typeof this[setting] == "undefined") { throw errorSetting + ' Nieznane ustawienie: "' + setting + '". ' + adviceMessage; }
					if (typeof this[setting] != typeof DysponentSurowcowy[setting]) { throw errorSetting + ' Nie rozpoznano wartości ustawienia: "' + setting + '". ' + adviceMessage; }
					if (typeof this[setting] == typeof [0,0,0]) {
						if (this[setting].length != DysponentSurowcowy[setting].length) {
							throw errorSetting + ' Liczba wartości ustawienia: "' + setting + '" jest niewłaściwa. ' + adviceMessage; 
						}
					}
					this[setting] = DysponentSurowcowy[setting];
				}
			} catch (ex) { ErrorHandler.handle_error(ex); }
		}
	};
    const Script = {
		plan: {},
		gui: {
			options: [],
			create_option_input: function (option) {
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
				const option_title_row = document.createElement('tr');
				const option_title_cell = document.createElement('th');
				option_title_cell.setAttribute('colspan', 2);
				option_title_cell.innerText = option.name;
				option_title_row.append(option_title_cell);

				return option_title_row;
			},
			add_option_to_panel: function (option, table) {
				table.append(this.create_option_header(option));

				const option_content_row = document.createElement('tr');

				option_content_row.append(this.create_option_input(option));

				const option_content_descryption = document.createElement('td');
				option_content_descryption.innerText = option.description;
				option_content_row.append(option_content_descryption);

				table.append(option_content_row);
			},
			create_main_panel: function () {
				const panel = document.createElement('div');
				panel.classList.add('vis', 'vis_item');

				const table = document.createElement('table');
				panel.append(table);

				for (option of this.options) {
					this.add_option_to_panel(option, table);
				}

				return panel;
			},
			create_title: function () {
				const div = document.createElement('div');
				div.style.margin = '5px 5px 15px 5px';

				const title = document.createElement('h2');
				title.style.display = 'inline';
				title.innerText = "Dysponent Surowcowy";
				div.append(title);

				const signature = document.createElement('span');
				signature.innerText = ' by PabloCanaletto';
				div.append(signature);

				return div;
			},
			create_footer: function () {
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
				const info_box = document.createElement('div');
				info_box.classList.add('info_box');
				info_box.style.margin = '5px 5px 5px 5px';

				const content = document.createElement('div');
				content.classList.add('content');
				content.innerText = 'To jest skrypt służący do dystrybuowania surowców między wioskami. Działa on na całej aktywnej grupie przesyłając surowce, aby uzupełnić braki. Może też zapobiegać przelewaniu się spichlerzy. Opracowując plan transportów skrypt przekierowuje je przez pośredników (zamiast A------>C robi A-->B-->C). Kosztem czasowego zamrożenia części surowców i zaangarzowania dodatkowych kupców skraca się znacząco czas transportów. Przy wykonaniu planu skrypt korzysta z funkcjonalności rynku "Wezwij", aby ograniczyć liczbę kliknięć potrzebą do wysłania bardzo wielu transportów. Domyśle wartości ustawień moża łatwo zmienić w kodzie skryptu.';
				info_box.append(content);

				return info_box;
			},
			create_warning: function () {
				const error_box = document.createElement('div');
				error_box.classList.add('error_box');
				error_box.style.margin = '5px 5px 5px 5px';

				const content = document.createElement('div');
				content.classList.add('content');
				content.innerText = 'Pojawiła się nowa wersja skryptu. Zaleca się ponowne skopiowanie sygnatury ze skryptoteki na Forum Ogólnym, aby uniknąć niekompatybilności pomiędzy wersjami.';
				error_box.append(content);

				return error_box;
			},
			create_submition_panel: function () {
				const submition_panel = document.createElement('div');

				const submit_button = document.createElement('input');
				submit_button.setAttribute('id', namespace + '_submit');
				submit_button.setAttribute('value', 'Opracuj Plan');
				submit_button.setAttribute('type', 'button');
				submit_button.classList.add('btn');
				submit_button.addEventListener('click', async function () { try { await Script.planCreator.init(); } catch (ex) { ErrorHandler.handle_error(ex); } });
				submition_panel.append(submit_button);

				const marketplace_button = document.createElement('input');
				marketplace_button.setAttribute('id', 'marketplace_button');
				marketplace_button.setAttribute('value', 'Wykonaj Plan');
				marketplace_button.setAttribute('type', 'button');
				marketplace_button.classList.add('btn');
				if (!Script.planExecutor.loadPlan()) {
					marketplace_button.classList.add('btn-disabled');
				} else {
					marketplace_button.addEventListener('click', async function () { try { await Script.planExecutor.init(); } catch (ex) { ErrorHandler.handle_error(ex); } });
				}
				submition_panel.append(marketplace_button);

				return submition_panel;
			},
			load_settings: function () {
				Settings.sitter = (game_data.player.sitter !== '0') ? '&t=' + game_data.player.id : '';
				for (option of this.options) {
					var setting;
					if (option.controls.length == 1) {
						setting = Settings[option.controls[0].attributes.id];
						if (option.controls[0].attributes.type == 'checkbox') {
							setting = $('#'+option.controls[0].attributes.id)[0].checked;
						}
						else {
							setting = Number($('#'+option.controls[0].attributes.id)[0].value);
							if (setting == NaN || setting < 0) { throw 'Niewłaściwa wartość ustawienia "' + option.controls[0].attributes.id +'".' }
						}
					}
					else {
						setting = Settings[option.controls[0].attributes.id.split("_")[0]];
						for (var i=0; i<3; i++) {
							setting[i] = Number($('#'+option.controls[i].attributes.id)[0].value);
							if (setting[i] == NaN || setting[i] < 0 || setting[i] > 700000) { throw 'Niewłaściwa wartość ustawienia "' + option.controls[0].attributes.id +'".' }
						}
					}
				}
				if (Settings.overFlowThreshold > 100) { Settings.overFlowThreshold = 100; }
			},
			activate_marketplace_button: function () {
				$('#marketplace_button')[0].classList.forEach((x) => {
					if (x == 'btn-disabled') {
						$('#marketplace_button')[0].classList.remove('btn-disabled');
						$('#marketplace_button')[0].addEventListener('click', async function () { try { await Script.planExecutor.init(); } catch (ex) { ErrorHandler.handle_error(ex); } });
					}
				});
			},
			create_gui: async function () {
				await Settings.loadDefaults();
				
				this.options = [
					{
						name: 'Wypełniaj do wartości',
						description: 'Ilości surowców do jakich mają być standardowo wypełniane spichlerze. Główne ustawienie, które rozsyła surowce między wioskami dbając, aby ich dystrybucja na kondzie była równomiera i w każdym rejonie były zapasy. Ustawienie tej opcji na więcej niż średnia ilość surowców na wioskę nie ma sensu - skrypt nie wyczaruje surowców z powietrza.',
						controls: [
							{ type: 'input', attributes: { id: 'resourcesFillTo_wood',	size: 10, value: Settings.resourcesFillTo[0] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/holz.png' },
							{ type: 'input', attributes: { id: 'resourcesFillTo_stone',	size: 10, value: Settings.resourcesFillTo[1] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/lehm.png' },
							{ type: 'input', attributes: { id: 'resourcesFillTo_iron',	size: 10, value: Settings.resourcesFillTo[2] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/eisen.png' }
						]
					},
					{ 
						name: 'Zabezpieczenie w surowcach',
						description: 'Ilości surowców, które mają zostać uzupełnione priorytetowo. Najlepiej ustawić na minimum, jakie potrzebuje najbardziej rozwinięta wioska do podtrzymania nieprzerwanej rakrutacji i/lub rozbudowy.',
						controls: [
							{ type: 'input', attributes: { id: 'resourcesSafeguard_wood',	size: 10, value: Settings.resourcesSafeguard[0] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/holz.png' },
							{ type: 'input', attributes: { id: 'resourcesSafeguard_stone',	size: 10, value: Settings.resourcesSafeguard[1] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/lehm.png' },
							{ type: 'input', attributes: { id: 'resourcesSafeguard_iron',	size: 10, value: Settings.resourcesSafeguard[2] }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/eisen.png' }
						]
					},
					{
						name: 'Zabezpieczenie w kupcach',
						description: 'Liczba kupców, która ma być zostawiona w wioskach. W większości przypadków można zostawić na 0. Ustawienie czasem się przydaje na froncie, kiedy chcemy mieć nieprzerwaną możliwość wysłania szybkiego transportu do świerzo przejętej/odbitej wioski na odbudowę. Także daje daje nam ciągłą możliwość zrobienia uniku surowcami.',
						controls: [
							{ type: 'input', attributes: { id: 'tradersSafeguard', size: 1, value: Settings.tradersSafeguard }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/buildings/market.png' }
						]
					},
					{
						name: 'Maksymalne wypełnienie spichlerza (%)',
						description: 'Jeżeli w wiosce jest większe wypełnienie spichlerza, niż zadany procent, to wioska roześle surowce do innych wiosek. Wioski także nie wezwą surowców ponad taki procent pojemności spichlerza, nawet jeśli będzie to oznaczało nie wypełnienie do zadanej w innym ustawieniu wartości.',
						controls: [
							{ type: 'input', attributes: { id: 'overFlowThreshold', size: 1, value: Settings.overFlowThreshold }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/buildings/storage.png' }
						]
					},
					{
						name: 'Uwzględnianie trwających transportów',
						description: 'Czy skrypt ma uwzględniać surowce aktualnie transportowane. Uwaga: nie są brane pod uwagę czasy trwających transportów. Surowce w nich traktowane są jako przynależne do wioski docelowej, co może ukryć potrzebę priorytetowego uzupełnienia zabezpieczenia w surowcach.',
						controls: [
							{ type: 'input', attributes: { id: 'considerOngoingTransports', type: 'checkbox', checked: Settings.considerOngoingTransports }, img: 'https://dspl.innogamescdn.com/asset/cbd6f76/graphic/btn/time.png' }
						]
					},
					{
						name: 'Rozszerzona optymalizacja',
						description: 'Czy plan tansportów może zawierać wioski będące pośrednikami, ale nie przyjmujące surowców dla siebie. Skraca znacząco czasy transportów kosztem dodatkowego klikania przy wysyłaniu transportów.',
						controls: [
							{ type: 'input', attributes: { id: 'extendedOptimization', type: 'checkbox', checked: Settings.extendedOptimization }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/premium/features/AccountManager_small.png' }
						]
					},
					{
						name: 'Minimalne wezwanie surowców',
						description: 'Wioski, których wezwania surowców nie przekraczają zadanej wartości minimalnej w żadnym z typów surowców, zostaną pominięte w planie. Jeżeli choć jeden z trzech typów surowców przekracza w planie zadaną wartość wezwania do wioski, to wszystkie transporty do tej wioski zostaną wykonane. Przydatne na dużych kontach, aby ograniczyć ilość klikania przy wykonywaniu planu.',
						controls: [
							{ type: 'input', attributes: { id: 'minSummon', size: 10, value: Settings.minSummon }, img: 'https://dspl.innogamescdn.com/asset/6052b745/graphic/buildings/storage.png' }
						]
					}
				];

				const div = document.createElement('div');
				div.style.margin = '0px 0px 10px 0px';
				div.setAttribute('id', namespace);
				div.classList.add('vis', 'vis_item');
				div.append(this.create_title());
				div.append(this.create_script_description());
				if (Settings.isNewerVersion()) { div.append(this.create_warning()); }
				div.append(this.create_main_panel());
				div.append(this.create_submition_panel());
				div.append(this.create_footer());

				document.querySelector('#content_value').prepend(div);
			}
		},
		villagesHandler: {
			villages: [],
			addVillage: function (_coords, _ID, _resources, _granary, _traders) {
				this.villages.push({
					coords: {
						x: _coords[0],
						y: _coords[1]
					},
					ID: _ID,
					resources: {
						present: _resources,	// w wiosce (po odjęciu planu)
						comming: [0,0,0],		// przybywające
						owned: _resources,		// present+comming
						toSend: [0,0,0],		// plan wysyłek
						toGet: [0,0,0]			// plan odbiorów
					},
					granary: _granary,
					traders: {
						free: _traders[0],
						toUse: 0,
						all: _traders[1]
					},
					receiver: false
				});
			},
			getBaseData: function () {
				var table = $('#production_table')[0];
				for (var i = 1; i < table.rows.length; i++) {
					var row = table.rows[i];

					var coords = row.cells[1].innerText.match(/\d{3}\|\d{3}/g);
					coords = coords[coords.length-1].split("|").map(x => Number(x));

					var ID = $(row.cells[1]).find('.quickedit-vn')[0].dataset.id;

					var resources = [0,0,0];
					row.cells[3].innerText.split(" ").map(x => Number(x.replace('.', ''))).forEach((x, i) => {
						resources[i] = x;
					});
					if(resources.length != 3) { throw 'Wczytano złą liczbę rodzajów surowców'; }

					var granary = Number(row.cells[4].innerText);
					var traders = row.cells[5].innerText.split("/").map(x => Number(x));

					this.addVillage(coords, ID, resources, granary, traders);
				}
			},
			getOngoingTransports: function (data) {
				let table = $(data).find('#trades_table').get()[0];
				if (!table) { throw 'Wystąpił błąd podczas pobierania danych z przeglądu transportów.'; }

				for (var i = 1; i < table.rows.length - 1; i++) {
					var row = table.rows[i];

					var id = $(row.cells[4]).find('a')[0].href.split('id=')[1];

					var incommings = $(row.cells[8]).find('.nowrap');
					for (var j = 0; j < incommings.length; j++) {
						var res = Number(incommings[j].innerText.replace('.', ''));

						var icon = incommings[j].getElementsByClassName("icon header")[0];
						var index = -1;
						if (icon.title == "Drewno")	{ index = 0; }
						if (icon.title == "Glina")	{ index = 1; }
						if (icon.title == "Żelazo")	{ index = 2; }
						if (index == -1) { throw 'Błąd w rozpoznawaniu surowców w aktywnym transporcie'; }

						for (var k = 0; k < this.villages.length; k++) {
							if (this.villages[k].ID == id) {
								this.villages[k].resources.comming[index] += res;
								this.villages[k].resources.owned[index] += res;
								break;
							}
						}
					}
				}

				Script.planCreator.createPlan();
			},
			updateVillages: function (transport, plus_minus_1) {
				let origin 		= transport.origin;
				let destination	= transport.destination;
				destination.receiver = false;
				for (var i=0; i<3; i++) {
					var change = {
						resources: transport.resources[i]*plus_minus_1,
						traders: transport.traders*plus_minus_1
					};
					origin.resources.present[i] -= change.resources;
					origin.resources.owned[i] -= change.resources;
					origin.resources.toSend[i] += change.resources;
					origin.traders.free -= change.traders;
					origin.traders.toUse += change.traders;

					destination.resources.toGet[i] += change.resources;
					destination.resources.owned[i] += change.resources;
					if (destination.resources.toGet[i] > 0) {
						destination.receiver = true;
					}
				}
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
					var distA = Utilities.distance(Script.villagesHandler.compareVillages.refCoords, vA.coords);
					var distB = Utilities.distance(Script.villagesHandler.compareVillages.refCoords, vB.coords);
					return Script.villagesHandler.compareVillages.noReverse * (distA - distB);
				}
			}
		},
		transportsHandler: {
			priorityTransports: [],
			generalTransports: [],
			addTransport: function (_transports, _resources, _origin, _destination) {
				return _transports.push({
					resources: _resources,
					traders: (_resources[0] + _resources[1] + _resources[2]) / 1000,
					origin: _origin,
					destination: _destination,
					distance: Utilities.distance(_origin.coords, _destination.coords),
				});
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
			reduceTransport: function (resources, transport) {
				Script.villagesHandler.updateVillages(transport, -1);
				transport.traders -= (resources[0] + resources[1] + resources[2]) / 1000;
				for (var k=0; k<3; k++) { transport.resources[k] -= resources[k]; }
				Script.villagesHandler.updateVillages(transport, 1);
			}
		},
		planCreator: {
			fillVillages: function (resoucesTargetLevel, transports) {
				console.log("fillVillages()");
				var villages = Script.villagesHandler.villages;
				var compareVillages = Script.villagesHandler.compareVillages;
				
				var createdTransport = false;

				let shortages = [[], [], []];
				let surpluses = [];

				function if_capable_surplus(village, res) {
					if (village.traders.free < Settings.tradersSafeguard) {
						return false;
					}
					if (village.resources.present[res] < Settings.resourcesSafeguard[res]) {
						return false;
					}
					return true;
				}

				for (var i=0; i<villages.length; i++) {
					let added_to_surpluses = false;
					for (var j=0; j<3; j++) {
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
				for (var i=0; i<3; i++) {
					compareVillages.noReverse = 1;
					shortages[i].sort(compareVillages.resources[i]);
					if(shortages[i][1] && shortages[i][0].resources[i] > shortages[i][1].resources[i]) {
						console.log('ERROR: fillVillages() shortages sort is reversed');
					}
				}

				function anyShortage() {
					if (shortages[0].length > 0) { return true; }
					if (shortages[1].length > 0) { return true; }
					if (shortages[2].length > 0) { return true; }
					return false;
				}

				let counter_1 = 0
				while (	anyShortage() && surpluses.length > 0 ) {
					if(counter_1++ > 1000) {
						console.log("ERROR: fillVillages(): while_1 is infinite");
						break;
					}
					var receiver = null;
					var res = null;
					
					for (var i=0; i<3; i++) {
						if (receiver && shortages[i][0]) {
							if (receiver.resources.owned[res] < shortages[i][0].resources.owned[i]) {
								receiver = shortages[i][0];
								res = i;
							}
						} else {
							if (shortages[i][0]) {
								receiver = shortages[i][0];
								res = i;
							}
						}
					}

					if (!receiver || typeof(res) === null) { console.log('ERROR: fillVillages(): no receiver or no res'); }

					compareVillages.refCoords = receiver.coords;
					compareVillages.noReverse = 1;
					surpluses.sort(compareVillages.distance);

					if (surpluses[1] && Utilities.distance(surpluses[0].coords, receiver.coords) > Utilities.distance(surpluses[1].coords, receiver.coords)) {
						console.log('ERROR: fillVillages() surpluses sort is reversed');
					}

					var lack = resoucesTargetLevel[res];
					let capacity = receiver.granary * Settings.overFlowThreshold / 100;
					if (capacity < lack) { lack = capacity;	}

					lack -= receiver.resources.owned[res];
					if (lack < 1000) {
						shortages[res].shift();
						continue;
					}

					var firstLooper = null;
					let counter_2 = 0;
					while (surpluses[0] && surpluses[0] != firstLooper) {
						if(counter_2++ > 1000) {
							console.log("ERROR: fillVillages(): while_2 is infinite");
							break;
						}
						var spare = surpluses[0].resources.present[res] - resoucesTargetLevel[res];
						if (spare < 1000)
						{
							if (!firstLooper) { firstLooper = surpluses[0]; }
							surpluses.push(surpluses.shift());
							continue;
						}

						if (surpluses[0].traders.free - Settings.tradersSafeguard <= 0) {
							surpluses.shift();
							continue;
						}

						if(surpluses[0] === receiver) { console.log("ERROR: fillVillages(): origin === destination"); }

						var transportResources = [0,0,0];
						transportResources[res] = 1000;

						var l = Script.transportsHandler.addTransport(transports, transportResources, surpluses[0], receiver);
						Script.villagesHandler.updateVillages(transports[l-1], 1);
						createdTransport = true;
						break;
					}
					if (surpluses[0] && surpluses[0] == firstLooper) {
						shortages[res].shift();
					}

					var pointer = 0;
					let counter_3 = 0;
					while (pointer < shortages[res].length-1) {
						if(counter_3++ > 1000) {
							console.log("ERROR: fillVillages(): while_3 is infinite");
							break;
						}
						if (shortages[res][pointer].resources[res] > shortages[res][pointer+1]) { break; }
						Utilities.swap(shortages[res], pointer, pointer+1);
						pointer++;
					}
				}

				if (createdTransport) {
					Script.planOptimizer.normalization.init(transports);
				}
			},
			preventOverflowing: function (resoucesTargetLevel, transports) {
				console.log("preventOverflowing()");
				let villages = Script.villagesHandler.villages;
				let compareVillages = Script.villagesHandler.compareVillages;

				var createdTransport = false;

				var villagesWithSpareGranary 	= [[], [], []];
				var villagesWithOverFlow 		= [[], [], []];

				for (var i=0; i<3; i++) {
					for (var j=0; j<villages.length; j++) {
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
				for (var i=0; i<3; i++) {
					villagesWithOverFlow[i].sort(compareVillages.resources[i]);
					if (villagesWithOverFlow[i][1] && villagesWithOverFlow[i][0].resources[i] < villagesWithOverFlow[i][1].resources[i]) {
						console.log("ERROR: preventOverflowing(): overFlows sort is reversed");
					}
				}

				function preventionPossible() {
					if (villagesWithOverFlow[0].length > 0 && villagesWithSpareGranary[0].length > 0) { return true; }
					if (villagesWithOverFlow[1].length > 0 && villagesWithSpareGranary[1].length > 0) { return true; }
					if (villagesWithOverFlow[2].length > 0 && villagesWithSpareGranary[2].length > 0) { return true; }
					return false;
				}

				var counter_1 = 0;
				while (preventionPossible()) {
					if(counter_1++ > 1000) {
						console.log("ERROR: preventOverflowing(): while_1 is infinite");
						break;
					}
					var sender = null;
					var res = null;

					for (var i=0; i<3; i++) {
						if ( ! (sender && sender.resources.owned[res] > villagesWithOverFlow[i][0].resources.owned[i]) ) {
							sender = villagesWithOverFlow[i][0];
							res = i;
						}
					}

					if (!sender || !res) {
						console.log('ERROR: preventOverflowing(): no sender or no res');
					}

					var overFlow = sender.resources.owned[res];
					overFlow -= sender.granary * resoucesTargetLevel / 100;

					if (sender.traders.free <= Settings.tradersSafeguard) {
						villagesWithOverFlow[res].shift();
						continue;
					}

					compareVillages.refCoords = sender.coords;
					compareVillages.noReverse = 1;
					villagesWithSpareGranary[res].sort(compareVillages.distance);

					if (villagesWithSpareGranary[res].length > 1 && Utilities.distance(villagesWithSpareGranary[res][0].coords, sender.coords) > Utilities.distance(villagesWithSpareGranary[res][1].coords, sender.coords)) {
						console.log("ERROR: preventOverflowing(): spareGranarys sort is reversed");
					}

					var counter_2 = 0;
					while (villagesWithSpareGranary[res][0]) {
						if(counter_2++ > 1000) {
							console.log("ERROR: preventOverflowing(): while_2 is infinite");
							break;
						}
						var receiver = villagesWithSpareGranary[res][0];
						var spereSpace = receiver.granary * resoucesTargetLevel / 100;
						spereSpace -= receiver.resources.owned[res];

						if (spereSpace < 1000) {
							villagesWithSpareGranary[res].shift();
							continue;
						}

						var transportResources = [0,0,0];
						transportResources[res] = 1000;

						if(transportVillages.origin === transportVillages.destination) { console.log("ERROR: preventOverFlowing(): origin === destination"); }

						var l = Script.transportsHandler.addTransport(transports, transportResources, sender, receiver);
						Script.villagesHandler.updateVillages(transports[l-1], 1);
						createdTransport = true;
						break;
					}
				}

				if (createdTransport) {
					Script.planOptimizer.normalization.init(transports);
				}
			},
			createPlan: function () {
				console.log("createPlan()");
				UI.SuccessMessage('Dane zostały wczytane. Opracowuję plan transportów...', 10000);

				this.fillVillages(Settings.resourcesSafeguard, Script.transportsHandler.priorityTransports);

				if (Settings.extendedOptimization) {
					var resTarget = [0,0,0];
					for (var i=0; i<3; i++) { resTarget[i] = Settings.resourcesRelayBuffer[i]; }

					var counter_4 = 0;
					while (true) {
						if(counter_4++ > 500) {
							console.log("ERROR: createPlan(): while is infinite");
							throw Error('createPlan(): while is infinite');
						}
						var increase = false;
						for (var i=0; i<3; i++) {
							if (resTarget[i] < Settings.resourcesFillTo[i]) {
								resTarget[i] += 1000;
								increase = true;
								if (resTarget[i] > Settings.resourcesFillTo[i]) {
									resTarget[i] = Settings.resourcesFillTo[i]
								}
							}
						}
						if (!increase) { break;	}
						this.fillVillages(resTarget, Script.transportsHandler.generalTransports);
					}
				}
				else
				{
					this.fillVillages(Settings.resourcesFillTo, Script.transportsHandler.generalTransports);
				}

				if (Settings.overFlowThreshold < 100) {
					this.preventOverflowing(Settings.overFlowThreshold, Script.transportsHandler.generalTransports);
				}

				if (Script.transportsHandler.generalTransports.length > 0) {
					Script.planOptimizer.optimization.init();
				}

				var p = Script.transportsHandler.priorityTransports;
				var g = Script.transportsHandler.generalTransports;
				if (p.length + g.length == 0) {
					UI.SuccessMessage('Zdaje się, że nic nie potrzeba.', 10000);
					return;
				}
				var allTransports = [];
				for (var i=0; i<p.length; i++) { allTransports.push(p[i]); }
				for (var i=0; i<g.length; i++) { allTransports.push(g[i]); }

				Script.plan = {
					summoned: 0,
					timestamp: Date.now(),
					group: Script.planCreator.loadGroup(),
					summons: []
				};

				console.log(allTransports);

				for (var i=0; i<allTransports.length; i++) {
					var summon = null;
					for (var j=0; j<Script.plan.summons.length; j++) {
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
					for (var i=0; i<Script.plan.summons.length; i++) {
						var summon = Script.plan.summons[i];
						var res = [0,0,0];
						for (var j=0; j<summon.transports.length; j++) {
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
					for (var i=0; i<Script.villagesHandler.villages.length; i++) {
						if (Script.villagesHandler.villages[i].ID == id) {
							return Script.villagesHandler.villages[i].coords.x + '|' + Script.villagesHandler.villages[i].coords.y;
						}
					}
				}

				console.log("plan utworzony:");
				console.log(Script.plan);
				for (var i=0; i<Script.plan.summons.length; i++) {
					var summon = Script.plan.summons[i];
					console.log(coord(summon.destination));
					for (var j=0; j<summon.transports.length; j++) {
						console.log('  ' + coord(summon.transports[j].origin) + ' ' + summon.transports[j].resources);
					}
				}

				this.savePlan();

				UI.SuccessMessage('Plan utworzony. Liczba transportów: ' + allTransports.length, 10000);
				Script.gui.activate_marketplace_button();
			},
			loadGroup: function () {
				var groups = $('.group-menu-item');
				for (var i=0; i<groups.length; i++) {
					if (groups[i].nodename == 'strong') {
						return groups[i].getAttribute('data-group-id');
					}
				}
				return null;
			},
			savePlan: function () {
				localStorage.removeItem(namespace);
				if (!Script.plan.summons[0]) { return; }
				var planJSON = JSON.stringify(Script.plan);
				localStorage.setItem(namespace, planJSON);
			},
			init: async function () {
				console.log("planCreator.init()");
				Script.gui.load_settings();

				Settings.resourcesRelayBuffer = [0,0,0];
				for (var i=0; i<3; i++) {
					var tmp = Settings.resourcesFillTo[i] - Settings.resourcesSafeguard[i];
					tmp = Math.floor(tmp/2);
					tmp += Settings.resourcesSafeguard[i];
					Settings.resourcesRelayBuffer[i] = tmp;
				}

				Script.villagesHandler.getBaseData();

				if (Settings.considerOngoingTransports) {
					$.ajax({
						url: '/game.php?screen=overview_villages&mode=trader&type=inc&page=-1' + Settings.sitter,
						type: 'GET',
						success: function (response) { Script.villagesHandler.getOngoingTransports(response); }
					});
				}
				else {
					this.createPlan();
				}
			}
		},
		planOptimizer: {
			normalization: {
				reduceSums: function (transports) {
					console.log("reduceSums()");
					for (var i=0; i<transports.length-1; i++) {
						for (var j=i+1; j<transports.length; j++) {
							if (transports[i].origin == transports[j].destination) { continue; }
							if (transports[j].origin == transports[i].destination) { continue; }

							var potentialSumDist = 0;
							potentialSumDist += Utilities.distance(transports[i].origin.coords, transports[j].destination.coords);
							potentialSumDist += Utilities.distance(transports[j].origin.coords, transports[i].destination.coords);

							if (potentialSumDist < transports[i].distance + transports[j].distance) {
								var reduction = [0,0,0];

								for (var k=0; k<3; k++) {
									reduction[k] = Math.min(transports[i].resources[k], transports[j].resources[k]);
								}

								if (reduction[0]+reduction[1]+reduction[2] == 0) { continue; }

								Script.transportsHandler.reduceTransport(reduction, transports[i]);
								Script.transportsHandler.reduceTransport(reduction, transports[j]);

								for (var k=0; k<2; k++) {
									var resources = [reduction[0], reduction[1], reduction[2]];
									var origin = 		transports[i*(k) + j*(1-k)].origin;
									var destination =	transports[j*(k) + i*(1-k)].destination;

									if(origin === destination) { console.log("ERROR: reduceSums(): origin === destination"); }

									var l = Script.transportsHandler.addTransport(transports, resources, origin, destination);
									Script.villagesHandler.updateVillages(transports[l-1], 1);
								}
							}
						}
					}
					console.log("end of reduceSums()");
				},
				merge: function (transports) {
					console.log("merge()");
					transports.sort(Script.transportsHandler.compareTransports.route);

					function if_same_route(tA, tB) {
						if (tA.destination.ID	!= tB.destination.ID)	{ return false; }
						if (tA.origin.ID		!= tB.origin.ID)		{ return false; }
						return true;
					}

					var counter_1 = 0;
					for (var i=0; i < transports.length-1; i++) {
						if(counter_1++ > 1000) {
							console.log("ERROR: merge(): for_1 is infinite");
							break;
						}
						if (if_same_route(transports[i], transports[i+1])) {
							let resources = [0,0,0];
							for (var j=0; j<3; j++) { resources[j] = transports[i].resources[j] + transports[i+1].resources[j];	}

							Script.transportsHandler.addTransport(transports, resources, transports[i].origin, transports[i].destination);

							Utilities.swap(transports, 0, i);
							transports.shift();
							Utilities.swap(transports, 0, i);
							transports.shift();

							if(transports.length == 1) {
								break;
							}

							transports.sort(Script.transportsHandler.compareTransports.route);
							i--;
						}
					}
				},
				reduceOpposing: function (transports) {
					console.log("reduceOpposing()");
					function if_opposinge_route(tA, tB) {
						if (tA.destination.ID	!= tB.origin.ID)	{ return false; }
						if (tA.origin.ID		!= tB.destination.ID)		{ return false; }
						return true;
					}

					for (var i=0; i < transports.length - 1; i++) {
						for (var j = i+1; j < transports.length; j++) {
							if (if_opposinge_route(transports[i], transports[j])) {
								var reduction = [0,0,0];

								for (var k=0; k<3; k++) {
									reduction[k] = Math.min(transports[i].resources[k], transports[j].resources[k]);
								}

								Script.transportsHandler.reduceTransport(reduction, transports[i]);
								Script.transportsHandler.reduceTransport(reduction, transports[j]);
							}
						}
					}
				},
				removeEmptys: function (transports) {
					console.log("removeEmptys()");
					var counter_1 = 0;
					for (var i=0; i<transports.length; i++) {
						if(counter_1++ > 1000) {
							console.log("ERROR: removeEmptys(): for_1 is infinite");
							break;
						}
						if (transports[i].traders == 0) {
							Utilities.swap(transports, 0, i);
							transports.shift();
							i--;
						}
					}
				},
				init: function (transports) {
					console.log("normalization.init()");
					if (transports.length < 2) { return; }
					this.reduceSums(transports);
					this.merge(transports);
					this.reduceOpposing(transports);
					this.removeEmptys(transports);
				}
			},
			optimization: {
				removeSuboptimalBrokers () {
					console.log("removeSuboptimalBrokers()");
					var transports = Script.transportsHandler.generalTransports;

					var newTransport = false;

					for	(var i=0; i<transports.length; i++) {
						for (var j=0; j<transports.length; j++) {
							if (transports[i].destination == transports[j].origin) {
								let potShortcutDist = Utilities.distance(transports[i].origin.coords, transports[j].destination.coords);
								if (2 * potShortcutDist < transports[i].distance + transports[j].distance) {
									var res = [0,0,0];
									for (var k=0; k<3; k++) { res[k] = Math.min(transports[i].resources[k], transports[j].resources[k]); }

									var resSum = res[0] + res[1] + res[2];
									if (resSum > 0) {
										Script.transportsHandler.reduceTransport(res, transports[i]);
										Script.transportsHandler.reduceTransport(res, transports[j]);

										if(route.origin == route.destination) { console.log("ERROR: removeSuboptimalBrokers(): origin === destination"); }
										
										var l = Script.transportsHandler.addTransport(transports, res, transports[i].origin, transports[j].destination);
										Script.villagesHandler.updateVillages(transports[l-1], 1);

										newTransport = true;
									}
								}
							}
						}
					}

					if(newTransport) { Script.planOptimizer.normalization.init(transports); }
				},
				relayThroughBrokers () {
					console.log("relayThrougBrokers()");
					var villages = Script.villagesHandler.villages;
					var transports = Script.transportsHandler.generalTransports;
					if (transports.length == 0) { return; }
					
					var newTransport = false;

					var potBrokers = [];

					if (Settings.extendedOptimization) {
						for (var i=0; i<villages.length; i++) {
							if (villages[i].traders.free > Settings.tradersSafeguard) {
								potBrokers.push(villages[i]);
							}
						}
					} else {
						for (var i=0; i<villages.length; i++) {
							if (!villages[i].receiver) { continue; }
							if (villages[i].traders.free > Settings.tradersSafeguard) {
								potBrokers.push(villages[i]);
							}
						}
					}

					var refTrans = null;

					function maxDistRelay(village) { return Math.max(Utilities.distance(refTrans.origin.coords, village.coords), Utilities.distance(village.coords, refTrans.destination.coords));	}
					function comparePotentialBrokers(vA, vB) {	return maxDistRelay(vA) - maxDistRelay(vB);	}

					for (var i=0; i<transports.length; i++) {
						transports.sort(Script.transportsHandler.compareTransports.cost);
						if (transports[1] && Script.transportsHandler.transportCost(transports[0]) < Script.transportsHandler.transportCost(transports[1])) {
							console.log('ERROR: relayThroughBrokers() transports sort is reversed');
						}

						refTrans = transports[i];
						potBrokers.sort(comparePotentialBrokers);
						if (potBrokers[1] && maxDistRelay(potBrokers[0]) > maxDistRelay(potBrokers[1])) {
							console.log('ERROR: relayThroughBrokers() potBrokers sort is reversed');
						}

						for (var j=0; j<potBrokers.length; j++) {
							if (maxDistRelay(potBrokers[j]) >= refTrans.distance) { break; }

							var res = [1000,1000,1000];
							var traders = 0;
							for (var k=0; k<3; k++) {
								res[k] = Math.min(res[k], transports[i].resources[k]);
								res[k] = Math.min(res[k], potBrokers[j].resources.present[k] - Settings.resourcesRelayBuffer[k]);
								if (res[k] < 1000) { res[k] = 0; }
								traders += res[k] / 1000;
							}
							if (traders == 0) {
								continue;
							}
							if (traders > potBrokers[j].free - Settings.tradersSafeguard) {
								Utilities.swap(potBrokers, 0, poiterB);
								potBrokers.shift();
								j--;
								continue;
							}

							Script.transportsHandler.reduceTransport(res, transports[i]);

							if(transports[i].origin == potBrokers[j]) { console.log("ERROR: relayThrougBrokers(): origin === destination (1)"); }
							var l = Script.transportsHandler.addTransport(transports, res, transports[i].origin, potBrokers[j]);
							Script.villagesHandler.updateVillages(transports[l-1], 1);

							if(potBrokers[j] == transports[i].destination) { console.log("ERROR: relayThrougBrokers(): origin === destination (2)"); }
							l = Script.transportsHandler.addTransport(transports, res, potBrokers[j], transports[i].destination);
							Script.villagesHandler.updateVillages(transports[l-1], 1);

							newTransport = true;
							i--;
							break;
						}
					}

					if (newTransport) {	Script.planOptimizer.normalization.init(transports); }
				},
				init: function () {
					this.removeSuboptimalBrokers();
					this.relayThroughBrokers();
				}
			}
		},
		planExecutor: {
			loadPlan: function () {
				Script.plan = JSON.parse(localStorage.getItem(namespace));
				if (Script.plan === null) { return false; }
				return true;
			},
			setVillageAndGroup: function () {
				function reload() {
					var url = '/game.php?screen=market&mode=call&village=' + Script.plan.summons[0].destination;
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
				return false;
			},
			init: async function () {
				if(this.setVillageAndGroup()) { return; }

				var summon = Script.plan.summons[0];

				console.log("a");
				var inputs = $('#village_list tbody tr td input');
				console.log(summon.destination);

				for (var i=0; i<summon.transports.length; i++) {
					for (var j=0; j<inputs.length; j++) {
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

				$('.btn')[0].focus();
				if (Script.plan.summons[0]) {
					$('.btn')[0].addEventListener('click', async function () {
						try {
							Script.planCreator.savePlan();
							Script.planExecutor.setVillageAndGroup();
						} catch (ex) { ErrorHandler.handle_error(ex); }
					});
					var progress = Script.plan.summoned / (Script.plan.summoned+Script.plan.summons.length);
					progress *= 25;
					progress = Math.ceil(progress);
					var message = 'Dysponent Surowcowy: '
					for (var i=1; i<=25; i++) {
						if (i<=progress) {
							message += '⬢';
							continue;
						}
						message += '⬡';
					}
					UI.SuccessMessage(message, 10000);
				} else {
					$('.btn')[0].addEventListener('click', async function () {
						try {
							Script.planCreator.savePlan();
						} catch (ex) { ErrorHandler.handle_error(ex); }
					});
					UI.SuccessMessage('Dysponent Surowcowy: To już ostatnie transporty!', 10000);
				}
			}
		},
        main: async function () {
			if (document.URL.indexOf("screen=overview_villages") != -1) {
				if (game_data.mode == "prod" || document.URL.indexOf("mode=prod") != -1) {
					if ($('#'+namespace)[0]) {
						$('#'+namespace)[0].remove();
						return;
					}
					Script.gui.create_gui();
					return;
				} else {
					UI.ErrorMessage('Dysponent Surowcowy: Spróbuj ponownie otworzyć przegląd produkcji.', 10000);
					return;
				}
			}

			if (document.URL.indexOf("screen=market") != -1 && document.URL.indexOf("mode=call") != -1) {
				if (Script.planExecutor.loadPlan()) {
					Script.planExecutor.init();
					return;
				} else {
					UI.ErrorMessage('Dysponent Surowcowy: Uruchom skrypt w zakładce Przeglądy > Produkcja.', 10000);
					return;
				}
			}
			UI.ErrorMessage('Dysponent Surowcowy: Uruchom skrypt w zakładce Przeglądy > Produkcja lub Rynek > Wezwij.', 10000);
        }
    };
    try { await Script.main(); } catch (ex) { ErrorHandler.handle_error(ex); }
})(TribalWars);
