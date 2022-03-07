// IN DEVELOPMENT

var FarmOptimizer_DefaultTemplates = {
	farming: [
		{ units: { spear: 2, sword: 2, archer: 0, axe: 0, spy: 0, light: 0, marcher: 0, heavy: 0, knight: 0 }, name: 'miecze' },
		{ units: { spear: 0, sword: 0, archer: 0, axe: 2, spy: 0, light: 0, marcher: 0, heavy: 0, knight: 0 }, name: 'topory' },
		{ units: { spear: 0, sword: 0, archer: 0, axe: 0, spy: 0, light: 1, marcher: 0, heavy: 0, knight: 0 }, name: '1 LK' },
		{ units: { spear: 0, sword: 0, archer: 0, axe: 0, spy: 0, light: 10, marcher: 0, heavy: 0, knight: 0 }, name: '10 LK' }
	],
	wallbreakers: {
		1: { spear: 0, sword: 0, archer: 0, axe: 0, spy: 1, light:  4, marcher: 0, heavy: 0, ram:  2, catapult: 0, knight: 0, snob: 0 },
		2: { spear: 0, sword: 0, archer: 0, axe: 0, spy: 1, light:  4, marcher: 0, heavy: 0, ram:  4, catapult: 0, knight: 0, snob: 0 },
		3: { spear: 0, sword: 0, archer: 0, axe: 0, spy: 1, light:  7, marcher: 0, heavy: 0, ram:  8, catapult: 0, knight: 0, snob: 0 },
		4: { spear: 0, sword: 0, archer: 0, axe: 0, spy: 1, light:  8, marcher: 0, heavy: 0, ram: 11, catapult: 0, knight: 0, snob: 0 },
		5: { spear: 0, sword: 0, archer: 0, axe: 0, spy: 1, light: 13, marcher: 0, heavy: 0, ram: 15, catapult: 0, knight: 0, snob: 0 }
	}
};

(async function (TribalWars) {
	const namespace = 'Farm_Optimizer';
	const version = '1.0.0';
	const author = 'PabloCanaletto';
	const forum_thread_link = '';

	const i18e = {
		//en_DK = {},
		pl_PL: {
			TITLE: 'Optymalizator Farmy',
			DESCRIPTION: 'To jest Optymalizator Farmy blablabla...',
			FORUM_THREAD: 'Link do wątku na forum',
			POPUPS: {
				WRONG_SCREEN_ERROR: 'Uruchom skrypt w Asystencie Farmera',
				LOADING: 'Wczytywanie...',
				LOADING_FINISHED: 'Wczytywanie zakończone',
				DELAY: 'Klikasz za szybko!',
				DOWNLOADING_REPORTS: 'Pobieranie raportów...',
				INGAME_TEMPLATES_CREATION: 'Tworzenie szablonów w grze. Gdy strona się odświeży, uruchom skrypt ponownie.',
				NOT_A_NUMBER: 'To nie jest liczba: ',
				TEMPLATE_ACTIVATED: 'Szablon aktywowany',
				LACKING_UNITS: 'Brakuje jednostek',
				TOO_EARLY: 'Za wcześnie na kolejny atak'
			},
			ERRORS: {
				TITLE: 'Coś poszło nie tak...',
				MESSAGE_GENERAL: 'Wystąpił błąd w działaniu skryptu:',
				TIP_1: 'Aby uzyska\u0107 pomoc zajrzyj do w\u0105tku dotycz\u0105cego tego skryptu na Forum og\xF3lnym. Je\u015Bli nie znajdziesz tam \u017Cadnych informacji mo\u017Cesz napisa\u0107 zg\u0142oszenie.',
				TIP_2: 'Za\u0142\u0105cz poni\u017Cszy Komunikat o B\u0142\u0119dzie.',
				STACK: 'Komunikat o b\u{142}\u{119}dzie',
				TEMPLATES: {
					ERROR_1: 'Nie rozpoznano szablonu przy próbie aktywacji!',
					ERROR_2: 'Nie udało się ustawić szablonu, status żądania: ',
					ERROR_3: 'Nie uzyskano dostępu do szablonu w grze.',
					ERROR_4: 'Nie udało się ustawić szablonu na serwerze gry.'
				},
				DATA_LOADER: {
					REPORTS: {
						ERROR_1: 'Nie udało się pobrać raportu: ',
						ERROR_2: 'Raport skasowany. Odświerz stronę, aby podejrzeć nowy.',
						ERROR_3: 'Nie udało się odczytać pobranego raportu.',
						ERROR_4: 'Nie udało się pobrać strony z raportami ataków: ',
						ERROR_5: 'Nie udało się ustawić liczby raportów na stronie w podglądzie raportów na 1000: ',
						ERROR_6: 'Nie udało się pobrać raportu spoza Asystenta Farmera: '
					},
					VILLAGE_GROUP: 'Nie udało się wczytać listy wiosek w aktywnej grupie.',
					PLUNDER_LIST_PAGE: 'Nie udało się pobrać strony z plądrowaniami, status żądania: ',
					INTERFACE_WORLD: 'Nie udało się pobrać z /interface.php ustawień świata, status żądania: ',
					INTERFACE_UNITS: 'Nie udało się pobrać z /interface.php informacji o jednostkach, status żądania: ',
					ATTACKS: 'Nie udało się pobrać strony z trwającymi atakami, status żądania: ',
					NO_REPORTS: 'Przecież nie masz żadnego raportu z plądrowania...'
				},
				DATE_RECOGNITION: 'Nie rozpoznano formatu daty'
			},
			BUTTONS: {
				SAVE: 'Zapisz',
				REFRESH: 'Odśwież',
				DELETE: 'Skasuj',
				ADD_TEMPLATE: 'Dodaj szablon',
				REMOVE_TEMPLATE: 'Usuń szablon',
				APPLY: 'Zastosuj'
			},
			UNITS: {
				SPEAR: 'Pikinier',
				SWORD: 'Miecznik',
				AXE: 'Topornik',
				ARCHER: 'Łucznik',
				SPY: 'Zwiadowca',
				LIGHT: 'Lekki kawalerzysta',
				MARCHER: 'Łucznik na koniu',
				HEAVY: 'Ciężki kawalerzysta',
				RAM: 'Taran',
				CATAPULT: 'Katapulta',
				KNIGHT: 'Rycerz',
				SNOB: 'Szlachcic'
			},
			FILTERS_1: [
				'są bliżej innej wioski w aktywnej grupie',
				'są obecnie atakowane',
				'dały niepełny łup',
				'spowodowały częściowe straty',
				'spowodowały pełne straty',
				'wymagają indywidualnej uwagi'
			],
			FILTERS_2: [
				'posiadają murek powyżej',
				'mają EKO sumarycznie poniżej',
				'są dalej, niż',
				'do ataku LK będą miały mniej surowców, niż',
				'są wyszpiegowane dawniej, niż (h)'
			],
			DATES: {
				YESTERDAY: 'wczoraj',
				TODAY: 'dzisiaj',
				TOMORROW: 'jutro',
				AT: 'o'
			},
			WARNINGS: {
				WARNING: 'UWAGA:',
				CAUTION: 'Uwaga:',
				WALL: 'Mur: ',
				HIGH_WALL: 'MUR: ',
				UNITS: 'Jednostki',
				FULL_LOSES: 'Pełne Straty',
				PRODUCTION: 'Niskie EKO',
				OLD_INFO: 'Stare info'
			},
			FARM_TEMPLATES: 'Szablony Farmiące',
			WALLBREAKING_TEMPLATES: 'Szablony Burzące',
			SETTINGS: 'Ustawienia',
			NAME: 'Nazwa',
			SPEED: 'Prędkość',
			DELETED_REPORT_IN_GAME_ERROR_MESSAGE: 'Nie masz upowa\u017cnienia',
			BARB_ATTACK: 'Atak na Wioska barbarzyńska',
			NOMAD_ATTACK: 'Atak na Osada koczowników',
			BARB_REPORT_ATTACK: 'atakuje Wioska barbarzyńska',
			NOMAD_REPORT_ATTACK: 'atakuje Osada koczowników',
			BARB_REPORT_SCOUT: 'szpieguje Wioska barbarzyńska',
			NOMAD_REPORT_SCOUT: 'szpieguje Osada koczowników',
			TOTAL_DEFEAT: 'Żaden żołnierz nie wrócił żywy. Nie można ustalić żadnych informacji o wielkości wojsk przeciwnika.',
			REPORT: 'Raport',
			NONE: 'nie ma',
			TIME_SPAN: 'Czas trwania: '
		}
	};
	var LOCALE = i18e.pl_PL;
	const ICONS = {
		MAIN:		image_base + 'awards/award3.png',
		SPEED:		image_base + 'unit/speed.png',
		FARM:		image_base + 'buildings/storage.png',
		WALBREAKER:	image_base + 'events/assault/logo_mini.png',
		SETTINGS:	image_base + 'icons/settings.png',
		WARNING:	image_base + 'exclamationmark.png',
		ERROR:		image_base + 'error.png',
		ATTACK:		image_base + 'command/attack.png',
		REPORT:		image_base + 'report.png',
		GREY_DOT:	image_base + 'dots/grey.png',
		LOOT:		image_base + 'max_loot/0.png',
		MAX_LOOT:	image_base + 'max_loot/1.png',
		OPTIMIZER:	image_base + 'premium/features/AccountManager_small.png',
		UNITS: {
			spear:		image_base + 'unit/unit_spear.png',
			sword:		image_base + 'unit/unit_sword.png',
			axe:		image_base + 'unit/unit_axe.png',
			archer:		image_base + 'unit/unit_archer.png',
			spy:		image_base + 'unit/unit_spy.png',
			light:		image_base + 'unit/unit_light.png',
			marcher:	image_base + 'unit/unit_marcher.png',
			heavy:		image_base + 'unit/unit_heavy.png',
			ram:		image_base + 'unit/unit_ram.png',
			catapult:	image_base + 'unit/unit_catapult.png',
			knight:		image_base + 'unit/unit_knight.png',
			snob:		image_base + 'unit/unit_snob.png'
		},
		BUILDINGS: {
			TIMBER_CAMP:	image_base + 'buildings/wood.png',
			CLAY_PIT:		image_base + 'buildings/stone.png',
			IRON_MINE:		image_base + 'buildings/iron.png',
			WALL:			image_base + 'buildings/wall.png',
			WAREHOUSE:		image_base + 'buildings/storage.png'
		}
	};

	var script_data = {
		templates: {
			farming: [],
			wallbreaking: []
		},
		/*	farming_template:
		 *	{
		 *		id: 1,
		 *		name: "",
		 *		units: { spear: 0, sword: 0, axe: 0, archer: 0, spy: 0, light: 0, marcher: 0, heavy: 0, knight: 0 }
		 *	}
		 *	wallbreaking_template:
		 *	{
		 *		spear: 0, sword: 0, archer: 0, axe:   0, spy: 1, light:  4, marcher: 0, heavy: 0, ram:  2, catapult: 0, knight: 0, snob: 0
		 *	}
		 */
		settings: {
			filters: {
				find_1: [false, false, false, false, false, false],
				hide_1: [false, false, false, false, false, false],
				find_2: [false, false, false, false, false],
				hide_2: [false, false, false, false, false],
				params: [5, 1, 18, 80, 24]
			},
			open_panels: {
				farming_templates: true,
				wallbreaker_templates: false,
				settings: true
			},
			optimizer: {

			}
		},
		/*	village:
		 *	{
		 *		id: 0,
		 *		coords: { x: 0, y: 0},
		 *		timeStamps: { build: 0, res: 0 },
		 *		report_ids: { farm: 0, nonFarm: 0},
		 *		resources: [0,0,0],
		 *		units: false,
		 *		buildings: {
		 *			eco: [0,0,0],
		 *			eco_sum: 0,
		 *			wall: 0,
		 *			storage: 0,
		 *			hiding: 0
		 *		}
		 *	}
		 */
		villages: [],
		time_stamp: 0
	};
	var plunder_list = [];
	/*	plunder:
	 *	{
	 *		row: {},
	 *		village: {},
	 *		filters_1: [false, false, false, false, false, false],
	 *		dist: 0
	 *	}
	 */
	var base_data = {
		template_form: $('a.farm_icon.farm_icon_a.decoration').closest('form')[0],
		template_ids: {
			a: $('a.farm_icon.farm_icon_a.decoration').closest('form').find('input[type=hidden][name*=id]')[0].value,
			b: $('a.farm_icon.farm_icon_a.decoration').closest('form').find('input[type=hidden][name*=id]')[1].value
		},
		units: {
			send_units: game_data.units.filter(u => u !== 'militia'),
			speed: {},
			capacity: {},
			farm_units: game_data.units.filter(u => u !== 'ram' && u !== 'catapult' && u !== 'snob' && u !== 'militia')
		},
		csrf: game_data.csrf,
		villages_group: [],
		village: {
			x: game_data.village.x,
			y: game_data.village.y,
			id: game_data.village.id
		},
		last_click: 0,
		active_template_radio: {
			a: {},
			b: {}
		},
		active_template_units: {
			a: [],
			b: []
		},
		world_speed: 0,
		plunder_of_active_command_popup: null
	};

	const errorHandler = {
		handle_error: function (error) {
			if (typeof (error) === 'string' && error == '') {
				console.log(namespace + ': Silent break.');
				return;
			}
			
			let tip = LOCALE.ERRORS.TIP_1 + '<br/>';

			if (typeof (error) === 'string') {
				console.log(namespace + ': ' + error);
				tip += `
					<br/>
					<a href="${forum_thread_link}">${LOCALE.FORUM_THREAD}</a><br/>
				`;
			} else {
				console.log(namespace + ':');
				console.log(error);
				tip += `
					${LOCALE.ERRORS.TIP_2}<br/>
					<br/>
					<a href="${forum_thread_link}">${LOCALE.FORUM_THREAD}</a><br/>
					<br/>
					<strong>${LOCALE.ERRORS.STACK}:</strong><br/>
					<textarea rows='5' cols='100'>[spoiler=${LOCALE.ERRORS.STACK}][b]${error}[/b]\n[code]\n${error.stack}\n[/code][/spoiler]</textarea><br/>
				`;
			}

			let gui = `
				<h2>${LOCALE.ERRORS.TITLE}</h2>
				<p>
					<strong>${LOCALE.ERRORS.MESSAGE_GENERAL}</strong><br/>
					<br/>
					<strong>${error}</strong><br/>
					<br/>
					${tip}
				</p>
			`;

			Dialog.show(namespace, gui);
		}
	};
	const script = {
		utilitys: {
			screen_check: function () {
				if (document.URL.indexOf("screen=am_farm") != -1)
					return true;

				UI.ErrorMessage(LOCALE.TITLE + ': ' + LOCALE.POPUPS.WRONG_SCREEN_ERROR, 5000);
				return false;
			},
			sleep: function (ms = 350) {
				if (ms != 350) {
					console.log(ms);
				}
				return new Promise(resolve => setTimeout(resolve, ms));
			},
			coordsFromName: function (name) {
				let a = name.match(/\d{3}\|\d{3}/g);
				a = a[a.length - 1];
				let coords = {
					x: Number(a.match(/\d{3}/g)[0]),
					y: Number(a.match(/\d{3}/g)[1])
				};
				return coords;
			},
			distance: function (cA, cB) {
				return Math.sqrt(Math.pow(cB.x - cA.x, 2) + Math.pow(cB.y - cA.y, 2));
			},
			parse_date: function (date_string) {
				let time_offset = 0;

				const date_matches = date_string.match(new RegExp(LOCALE.DATES.TOMORROW + '|' + LOCALE.DATES.TODAY + '|' + LOCALE.DATES.YESTERDAY + '|\\d+\\.\\d+(?:\\.\\d+)?', 'g'));
				
				if (date_matches) {
					time_offset = date_string.indexOf(date_matches[0]) + date_matches[0].length;
				}

				const time_matches = date_string.slice(time_offset).match(/\d+(?::\d+)*/g);
				if (!time_matches || time_matches.length > 1 || (date_matches && date_matches.length > 1)) {
					console.log(time_matches);
					throw LOCALE.ERRORS.DATE_RECOGNITION + ': "' + date_string + '"';
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
						case LOCALE.DATES.YESTERDAY:
							parts.date = today.getDate() - 1;
							break;
						case LOCALE.DATES.TODAY:
							break;
						case LOCALE.DATES.TOMORROW:
							parts.date = today.getDate() + 1;
							break;
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
			},
		},
		progress_bar: {
			normalized_size: 25,
			size: 0,
			progress: 0,
			message: '',
			symbol_1: '\u2B22',
			symbol_2: '\u2B21',
			init: function (new_size, new_message) {
				this.size = new_size;
				this.progress = 0;
				this.message = new_message;
				var bar = '';
				for (let i=1; i<=this.normalized_size; i++) {
					bar += this.symbol_2;
				}
				UI.InfoMessage(this.message + ' ' + bar, 5000);
			},
			update: function (stage = this.progress + 1) {
				this.progress = stage;

				let progress_normalised = Math.round( this.progress * this.normalized_size / this.size);
				let bar = '';
				for (let i=1; i<=this.normalized_size; i++) {
					if (i<=progress_normalised) {
						bar += this.symbol_1;
						continue;
					}
					bar += this.symbol_2;;
				}
				UI.InfoMessage(this.message + ' ' + bar, 5000);
			}
		},
		reports_previewer: {
			PREVIEW_DESIRED_SIZE: 518,
			PREVIEW_MIN_SCALE: .70,
			previewing: !1,
			hover: !1,
			data: {},
			init: function () {
				var styleSheet = document.createElement("style");
				styleSheet.type = "text/css";
				styleSheet.innerText = this.preview_css_styles;
				document.head.appendChild(styleSheet);

				const report_preview_div = document.createElement('div');
				$('#' + namespace)[0].append(report_preview_div);
				report_preview_div.outerHTML = `
					<div id="${namespace}_report_preview" class="report-preview" style="display: none; left: 0px; transform: scale(1.0);">
						<div class="report-preview-content"></div>
					</div>
				`;
			},
			create_link: function (url, td) {
				var innerText = td.innerText;
				td.innerHTML = '';

				const link = document.createElement('a');
				td.append(link);
				link.innerHTML = `<img src="${ICONS.REPORT}" style="margin: 0px 5px 0px 0px;">` + innerText;
				link.href = url;
				link.setAttribute('data_id', url.split('view=')[1]);

				link.addEventListener('mouseenter', function () {
					try {
						var e = this;
						script.reports_previewer.hover = true;
						script.reports_previewer.previewing = e.getAttribute('data_id');
						setTimeout(function () {
							if (script.reports_previewer.hover) { script.reports_previewer.showPreview(e); }
						}, 250);
					} catch (error) { errorHandler.handle_error(error); }
				});

				link.addEventListener('mouseleave', function () {
					try {
						var e = this;
						script.reports_previewer.hover = false;
						if (script.reports_previewer.previewing) { script.reports_previewer.closePreview(e); }
					} catch (error) { errorHandler.handle_error(error); }
				});
			},
			showPreview: async function (e) {
				let id = e.getAttribute('data_id');

				if (script.reports_previewer.previewing == id) {
					if (typeof this.data[id] == 'undefined') {
						await script.data_loader.reports.load_report(id);
					}
					e.style.color = '#e01f0f';

					var n = $('#' + namespace + '_report_preview')[0];
					n.style.display = null;

					$(n).find('.report-preview-content')[0].innerHTML = script.reports_previewer.data[id];

					var s = window.innerHeight;
					var t = e.closest('td');
					var r = t.getBoundingClientRect().left;
					var i = r > this.PREVIEW_DESIRED_SIZE ? 1 : r / this.PREVIEW_DESIRED_SIZE;
					var j = n.getBoundingClientRect().height < s ? 1 : s / n.getBoundingClientRect().height;

					var scale = Math.min(i, j);
					if (scale < this.PREVIEW_MIN_SCALE) { scale = this.PREVIEW_MIN_SCALE; }
					n.style.transform = 'scale(' + scale + ')';

					var a = t.getBoundingClientRect().left - this.PREVIEW_DESIRED_SIZE * scale - 50;
					if (a < 0) { a = 0; }
					n.style.left = a + 'px';

					var l = t.getBoundingClientRect().bottom;
					var c = n.getBoundingClientRect().height;

					if (s - c < 0) {
						l = (s - c) / 2;
					} else {
						l = l - c > 0 ? l - c : 0;
					}

					n.style.top = l + 'px';
				}
			},
			closePreview: function (e) {
				e.style.color = '#603000';
				script.reports_previewer.previewing = !1;
				$('#' + namespace + '_report_preview')[0].style.display = 'none';
			},
			preview_css_styles: `
				.report-preview {
					width: 518px;
					position: fixed;
					z-index: 17000;
					border: 9px solid #804000;
					-moz-border-image: url(${image_base}popup/border_slim.png) 9 9 9 9 repeat;
					-webkit-border-image: url(${image_base}popup/border_slim.png) 9 9 9 9 repeat;
					-o-border-image: url(${image_base}popup/border_slim.png) 9 9 9 9 repeat;
					border-image: url(${image_base}popup/border_slim.png) 9 9 9 9 repeat;
					-webkit-backface-visibility: hidden;
					-moz-backface-visibility: hidden;
					backface-visibility: hidden;
					transform-origin: left top;
					-webkit-font-smoothing: subpixel-antialiased;
				}

				.report-preview-content {
					background: #f4e4bc;
					padding: 5px;
					overflow: hidden;
				}

				.report-preview-content .no-preview {
					display: none;
				}
			`
		},
		reports_handler: {
			important_reports: [],
			nonFarm_reports: [],
			get_units_from_report: function (plunder, date) {
				var units_table = $('.report-preview-content #attack_info_def_units')[0];
				if (typeof units_table != 'undefined') {
					for (var i = 1; i < units_table.rows[2].cells.length; i++) {
						var unit_num = Number(units_table.rows[1].cells[i].innerText);
						var loses = Number(units_table.rows[2].cells[i].innerText);
						if (unit_num - loses > 0) {
							plunder.village.units = true;
							plunder.filters_1[5] = true;
							break;
						}
					}
				}
			},
			get_resources_from_report: function (plunder, date) {
				var res_table = $('.report-preview-content #attack_spy_resources')[0];
				if (typeof res_table != 'undefined') {
					plunder.village.resources = [0,0,0];
					plunder.village.timeStamps.res = Number(date);
					if (res_table.rows[0].cells[1].innerText != LOCALE.NONE) {
						var spans = $(res_table.rows[0].cells[1]).find('span');
						for (span of spans) {
							var res = Number(span.innerText.replace('.',''));
							if (span.innerHTML.indexOf('wood') != -1) {
								plunder.village.resources[0] = res;
								continue;
							}
							if (span.innerHTML.indexOf('stone') != -1) {
								plunder.village.resources[1] = res;
								continue;
							}
							if (span.innerHTML.indexOf('iron') != -1) {
								plunder.village.resources[2] = res;
								continue;
							}
						}
					}
				}
				else {
					res_table = $('.report-preview-content #attack_results')[0];
					if (typeof res_table != 'undefined') {
						plunder.village.timeStamps.res = Number(date);

						var capacity = res_table.rows[0].cells[2].innerText.split('/');
						console.log(capacity);
						if (capacity[0] != capacity[1]) {
							plunder.village.resources = [0,0,0];
							return;
						}

						var spans = $(res_table.rows[0].cells[1]).find('span');
						for (span of spans) {
							var res = Number(span.innerText.replace('.',''));
							if (span.innerHTML.indexOf('wood') != -1) {
								plunder.village.resources[0] = res;
								continue;
							}
							if (span.innerHTML.indexOf('stone') != -1) {
								plunder.village.resources[1] = res;
								continue;
							}
							if (span.innerHTML.indexOf('iron') != -1) {
								plunder.village.resources[2] = res;
								continue;
							}
						}
					}
				}
			},
			get_build_info_from_report: function (plunder, date, build_info) {
				plunder.village.timeStamps.build = Number(date);
				build_info = JSON.parse(build_info.value);
				plunder.village.buildings = {
					eco: [0,0,0],
					eco_sum: 0,
					wall: 0,
					storage: 0,
					hiding: 0
				};
				var b = plunder.village.buildings;
				for (var i=0; i<build_info.length; i++) {
					if (build_info[i].id == "wood")	{
						b.eco[0] = Number(build_info[i].level);
						b.eco_sum += b.eco[0];
						continue;
					}
					if (build_info[i].id == "stone")	{
						b.eco[1] = Number(build_info[i].level);
						b.eco_sum += b.eco[1];
						continue;
					}
					if (build_info[i].id == "iron") {
						b.eco[2] = Number(build_info[i].level);
						b.eco_sum += b.eco[2];
						continue;
					}
					if (build_info[i].id == "storage" ) {
						b.storage = script.optimizer.storage(Number(build_info[i].level));
						continue;
					}
					if (build_info[i].id == "hide" ) {
						b.hiding = script.optimizer.hiding(Number(build_info[i].level));
						continue;
					}
					if (build_info[i].id == "wall") {
						b.wall = Number(build_info[i].level);
						if (b.wall > script_data.settings.filters.params[0]) {
							plunder.filters_1[5] = true;
						}
						continue;
					}
				}
			},
			handle_report: function (report, date) { 
				$('#' + namespace + '_report_preview').find('.report-preview-content')[0].innerHTML = report;
				
				var village_id = Number($('#attack_info_def .village_anchor')[0].dataset.id);
				//console.log(village_id);
				
				var plunder = null;
				for (var i = 0; i < plunder_list.length; i++) {
					if (village_id == plunder_list[i].village.id) {
						plunder = plunder_list[i];
						break;
					}
				}

				if (typeof plunder == 'undefined') {
					return;
				}
	
				this.get_units_from_report(plunder);
				this.get_resources_from_report(plunder, date);

				var buildings_data = $('.report-preview-content #attack_spy_building_data')[0];
				if (typeof buildings_data != 'undefined') {
					this.get_build_info_from_report(plunder, date, buildings_data);
				}

				script.gui.plunder_list.refresh_row(plunder);

				for (var i = 0; i < script_data.villages.length; i++) {
					if (village_id == script_data.villages[i].id) {
						console.log('known village');
						return;
					}
				}
				
				script_data.villages.push(plunder.village);
			},
			get_reports: async function () {
				if (this.nonFarm_reports.length + this.important_reports.length > 0) {
					script.progress_bar.init(this.important_reports.length + this.nonFarm_reports.length, LOCALE.TITLE + ': ' + LOCALE.POPUPS.DOWNLOADING_REPORTS);
					
					await this.get_nonFarm_reports();
					await this.get_important_reports();
					
					script_data.time_stamp = Date.now();
					script.data_loader.script_data.save();
				}
			},
			get_important_reports: async function () {
				var reps = this.important_reports;
				while (reps[0]) {
					if (reps[0].date > reps[0].village.timeStamps.build) {
						var rep = script.data_loader.reports.load_report(reps[0].id);
						await script.utilitys.sleep();
						if (rep !== 'deleted') {
							this.handle_report(rep, reps[0].date);
							reps[0].village.report_ids.farm = Number(reps[0].id);
						}
					}
					this.important_reports.shift();
					script.progress_bar.update();
					script.data_loader.script_data.save();
				}
			},
			get_nonFarm_reports: async function () {
				var reps = this.nonFarm_reports;
				while (reps[0]) {
					var rep = await script.data_loader.reports.load_nonFarm_report(reps[0].id);

					if (rep.precise_date > reps[0].village.timeStamps.build) {
						script.reports_handler.handle_report(rep.content, rep.precise_date);
						reps[0].village.report_ids.nonFarm = Number(reps[0].id);
					}

					reps.shift();
					script.progress_bar.update();
					script.data_loader.script_data.save();
				}
			}
		},
		attacks_handler: {
			attacks: [],
			new_attacks_num: 0,
			/*	attack:
			 *	{
			 *		id: 0,	
			 *		village: { x: 0, y: 0 },
			 * 		time_HTML: 0,
			 * 		time: 0,
			 * 		capacity: 0,
			 * 		units: {},
			 * 		u_speed: 'img src',
			 * 		spy: true/false
			 * }
			 */
			init_preview: function () {
				var styleSheet = document.createElement("style");
				styleSheet.type = "text/css";
				styleSheet.innerText = this.css_styles;
				document.head.appendChild(styleSheet);

				UI.ToolTip($(`.${namespace}_attack`), {
					bodyHandler: script.attacks_handler.get_Tooltip_body
				});

				setInterval(10000, function() {
					var attacks = $(`li.${namespace}_attack`);
					var attack_time;
					for (var i = 0; i<attacks.length; i++) {
						attack_time = script.utilitys.parse_date(attacks[i].getAttribute('attack_time'));
						if (attack_time.getTime() < Date.now()) {
							attacks[i].remove();
						}
					}
				});
			},
			get_Tooltip_body: function() {
				var id = $(this)[0].getAttribute('attack_id');
				var attack;
				for (var i = 0; i < script.attacks_handler.attacks.length; i++) {
					if (script.attacks_handler.attacks[i].id == id) {
						attack = script.attacks_handler.attacks[i];
						break;
					}
				}
				var Tooltip = `<b>${attack.time_HTML}<br>`;
				for (var i = 0; i < base_data.units.send_units.length; i++) {
					var unit = base_data.units.send_units[i];
					if (typeof attack.units[unit] != 'undefined') {
						Tooltip += `<img src="${ICONS.UNITS[unit]}"> ${attack.units[unit]}<br>`;
					}
				}
				if (attack.capacity > 0) {
					Tooltip += `<span class="icon header ressources"></span> ${attack.capacity}`;
				}
				Tooltip += `</b>`;
				return Tooltip;
			},
			get_attacks_at_coords(coords) {
				let attacks_at_coords = [];
				for (var i = 0; i < this.attacks.length; i++) {
					if (this.attacks[i].village.x == coords.x && this.attacks[i].village.y == coords.y) {
						attacks_at_coords.push(this.attacks[i]);
					}
				}
				return attacks_at_coords;
			},
			crete_attack_list: function (td, coords) {
				var attacks = this.get_attacks_at_coords(coords);
				const attacks_list = document.createElement('ul');
				attacks_list.classList.add(`${namespace}_attacks_list`);
				td.append(attacks_list);
				for (attack of attacks) {
					const li = document.createElement('li');
					attacks_list.append(li);
					li.classList.add(`${namespace}_attack`);
					li.setAttribute('attack_id', attack.id);
					li.setAttribute('attack_time', attack.time);
					if (attack.spy) {
						const spy_div = document.createElement('div');
						li.append(spy_div);
						spy_div.classList.add(`${namespace}_attack_spy`);
					}
					const attack_div = document.createElement('div');
					li.append(attack_div);

					const icon = document.createElement('img');
					attack_div.append(icon);
					icon.src = attack.u_speed;
				}
			},
			add_attack_preview: function (attack, speed, attacks_list) {
				var travel_time = script.utilitys.distance(attack.village, base_data.village) * speed;
				travel_time *= 60 * 1000;

				var today = new Date();
				var arrival = new Date(today.getTime() + travel_time);
				var midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

				var arrival_formatted = '';

				if (arrival.getTime() < midnight.getTime() + 24*60*60*1000) {
					arrival_formatted = LOCALE.DATES.TODAY;
				}
				else if (arrival.getTime() < midnight.getTime() + 48*60*60*1000) {
					arrival_formatted = LOCALE.DATES.TOMORROW;
				}
				else {
					arrival_formatted = arrival.getDate() + '.' + arrival.getMonth();
				}

				arrival_formatted += ' ' + LOCALE.DATES.AT + ' ' + arrival.getHours() + ':';
				if (arrival.getMinutes() < 10) 
					arrival_formatted += '0';
				arrival_formatted += arrival.getMinutes() + ':';
				if (arrival.getSeconds() < 10) 
					arrival_formatted += '0';
				arrival_formatted += arrival.getSeconds();

				attack.time_HTML = arrival_formatted;
				attack.time = script.utilitys.parse_date(arrival_formatted).getTime();

				this.attacks.push(attack);

				const li = document.createElement('li');

				var attacks = $(attacks_list).find(`li.${namespace}_attack`);

				var not_done = true;
				for (var i=0; i<attacks.length; i++) {
					var next_attack_time = attacks[i].getAttribute('attack_time');
					if (next_attack_time > arrival.getTime()) {
						attacks[i].before(li);
						not_done = false;
						break;
					}
				}
				if (not_done) {
					attacks_list.append(li);
				}

				li.classList.add(`${namespace}_attack`);
				li.setAttribute('attack_id', attack.id);
				li.setAttribute('attack_time', attack.time);
				if (attack.spy) {
					const spy_div = document.createElement('div');
					li.append(spy_div);
					spy_div.classList.add(`${namespace}_attack_spy`);
				}
				const attack_div = document.createElement('div');
				li.append(attack_div);

				const icon = document.createElement('img');
				attack_div.append(icon);
				icon.src = attack.u_speed;

				UI.ToolTip($(li), {
					bodyHandler: script.attacks_handler.get_Tooltip_body
				});
			},
			add_attack: function (d) {
				var attack_data = {};
				for (var i=0; i<d.length; i++) {
					attack_data[d[i].name] = d[i].value;
				}

				let attack = {
					id: 'new_attack_' + this.new_attacks_num++,
			 		village: { x: attack_data.x, y: attack_data.y },
			  		time_HTML: 0,
					time: 0,
			  		capacity: 0,
			  		units: {},
			  		u_speed: 'img src',
			  		spy: false
				};

				var speed = 0;
				for (let j=0; j<base_data.units.send_units.length; j++) {
					var unit = base_data.units.send_units[j];
					var unit_num = Number(attack_data[unit]);
					if (unit_num > 0) {
						attack.capacity += unit_num * base_data.units.capacity[unit];
						attack.units[unit] = unit_num;
						if (unit == 'spy') {
							attack.spy = true;
						}
						if (speed < base_data.units.speed[unit]) {
							speed = base_data.units.speed[unit];
							attack.u_speed = ICONS.UNITS[unit];
						}
					}
				}
				if (attack.units['axe'] && speed == base_data.units.speed['axe']) {
					attack.u_speed = ICONS.UNITS['axe'];
				}

				var attacks_list;
				for (var i=0; i<plunder_list.length; i++) {
					if (plunder_list[i].village.coords.x == attack.village.x && plunder_list[i].village.coords.y == attack.village.y) {
						attacks_list = $(plunder_list[i].row).find(`ul.${namespace}_attacks_list`)[0];
						break;
					}
				}

				this.add_attack_preview(attack, speed, attacks_list);
			},
			add_farm_attack: function (d) {
				let attack = {
					id: 'new_attack_' + this.new_attacks_num++,
			 		village: { x: 0, y: 0 },
			  		time_HTML: 0,
					time: 0,
			  		capacity: 0,
			  		units: {},
			  		u_speed: 'img src',
			  		spy: false
				};

				var speed = 0;
				for (let j=0; j<base_data.units.send_units.length; j++) {
					var unit = base_data.units.send_units[j];
					var unit_num = Accountmanager.farm.templates['t_' + d.template_id][unit];
					if (unit_num && unit_num > 0) {
						attack.capacity += unit_num * base_data.units.capacity[unit];
						attack.units[unit] = unit_num;
						if (unit == 'spy') {
							attack.spy = true;
						}
						if (speed < base_data.units.speed[unit]) {
							speed = base_data.units.speed[unit];
							attack.u_speed = ICONS.UNITS[unit];
						}
					}
				}
				if (attack.units['axe'] && speed == base_data.units.speed['axe']) {
					attack.u_speed = ICONS.UNITS['axe'];
				}

				var attacks_list;
				for (var i=0; i<plunder_list.length; i++) {
					if (plunder_list[i].village.id == d.target) {
						attacks_list = $(plunder_list[i].row).find(`ul.${namespace}_attacks_list`)[0];
						attack.village.x = plunder_list[i].village.coords.x;
						attack.village.y = plunder_list[i].village.coords.y;
						break;
					}
				}

				this.add_attack_preview(attack, speed, attacks_list);
			},
			css_styles: `
				.${namespace}_attacks_list {
					list-style: none;
					margin: 0;
					padding: 0;
				}

				.${namespace}_attack {
					position: relative;
					width: 18px;
					float: left;
					text-align: left;
					margin-right: 3px;
				}

				.${namespace}_attack_spy {
					background-color: blue;
					position: absolute;
					top: 0;
					left: 0;
					width: 5px;
					height: 5px;
					z-index: 2;
				}
			`
		},
		data_loader: {
			farm_assistant_options: {
				reset_in_game_filters : async function () {
					var checkbox;

					checkbox = $('#all_village_checkbox')[0];
					if (checkbox.checked) {
						checkbox.click();
						await script.utilitys.sleep();
					}
					script.progress_bar.update();

					checkbox = $('#attacked_checkbox')[0];
					if (!checkbox.checked) {
						checkbox.click();
						await script.utilitys.sleep();
					}
					script.progress_bar.update();

					checkbox = $('#full_losses_checkbox')[0];
					if (!checkbox.checked) {
						checkbox.click();
						await script.utilitys.sleep();
					}
					script.progress_bar.update();

					checkbox = $('#partial_losses_checkbox')[0];
					if (!checkbox.checked) {
						checkbox.click();
						await script.utilitys.sleep();
					}
					script.progress_bar.update();

					checkbox = $('#full_hauls_checkbox')[0];
					if (checkbox.checked) {
						checkbox.click();
						await script.utilitys.sleep();
					}
					script.progress_bar.update();
				},
				set_page_size: async function () {
					if (Accountmanager.farm.page_size < 100) {
						TribalWars.post(
							'am_overview',
							{
								ajaxaction: 'set_page_size'
							},
							{
								widget_id: 'Farm',
								page_size: 100
							}
						);
						await script.utilitys.sleep();
					}
					script.progress_bar.update();
				},
				set_sorting_order: async function () {
					$.ajax({
						async: false,
						url: '/game.php?screen=am_farm&&order=distance&dir=asc',
						type: 'GET'
					});
					await script.utilitys.sleep();
					script.progress_bar.update();
				},
				prepare: async function () {
					await this.reset_in_game_filters();
					await this.set_page_size();
					await this.set_sorting_order();

					// dirty way to reload page 1
					var checkbox = $('#all_village_checkbox')[0];
					for (let i = 0; i < 2; i++) {
						Accountmanager.farm.waiting_for_display_queue_load = true;
						checkbox.click();
						while (Accountmanager.farm.waiting_for_display_queue_load) {
							await script.utilitys.sleep();
						}
						script.progress_bar.update();
					}
				}
			},
			script_data: {
				load: function () {
					var saved_script_data = JSON.parse(localStorage.getItem(namespace));

					if (saved_script_data == null) {
						console.log('SCRIPT DATA INIT !!!')
						this.init();
						return;
					}

					script_data = saved_script_data;
				},
				init: function () {
					for (let i = 0; i < FarmOptimizer_DefaultTemplates.farming.length; i++) {
						var template = FarmOptimizer_DefaultTemplates.farming[i];
						script_data.templates.farming.push({
							id: i + 1,
							name: template.name,
							units: template.units
						});
					}

					for (let i = 1; i <= 20; i++) {
						var template = FarmOptimizer_DefaultTemplates.wallbreakers[i];
						if (template == null) {
							break;
						}

						script_data.templates.wallbreaking.push(template);
					}

					this.save();
				},
				save: function () {
					localStorage.removeItem(namespace);
					let script_data_JSON = JSON.stringify(script_data);
					localStorage.setItem(namespace, script_data_JSON);
				}
			},
			reports: {
				load_report: function (id) {
					var report_preview;
					$.ajax({
						async: false,
						url: '/game.php?screen=report&ajax=view&id=' + id,
						dataType: 'json',
						success: function (response) {
							report_preview = response;
						},
						complete: function (XHR, textStatus) {
							if (textStatus != 'success') {
								throw LOCALE.ERRORS.DATA_LOADER.REPORTS.ERROR_1 + textStatus;
							}
						}
					});
					//await script.utilitys.sleep() is in script.reports_handler.get_important_reports() to not block previewing reports
	
					if (typeof report_preview.dialog != 'undefined') {
						script.reports_previewer.data[id] = report_preview.dialog;
						return report_preview.dialog;
					}
					else {
						if (report_preview.error.length == 1 && report_preview.error[0] == LOCALE.DELETED_REPORT_IN_GAME_ERROR_MESSAGE) {
							script.reports_previewer.data[id] = LOCALE.ERRORS.DATA_LOADER.REPORTS.ERROR_2;
							return 'deleted';
						}
						else {
							throw {
								name: LOCALE.ERRORS.DATA_LOADER.REPORTS.ERROR_3,
								toString: function () { return this.name; },
								stack: report_preview
							};
						}
					}
				},
				load_nonFarm_report: async function (id) {
					var rep;
					$.ajax({
						async: false,
						url: 'game.php?screen=report&view=' + id,
						success: function (response) {
							rep = response;
						},
						complete: function (XHR, textStatus) {
							if (textStatus != 'success') {
								throw LOCALE.ERRORS.DATA_LOADER.REPORTS.ERROR_6 + textStatus;
							}
						}
					});
					await script.utilitys.sleep();
	
					var precise_date_text = $(rep).find('#content_value > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(2) > td:nth-child(2)')[0].innerText;
					var precise_date = script.utilitys.parse_date(precise_date_text).getTime();
	
					rep = $(rep).find('.report_ReportAttack')[0].innerHTML;
	
					return {content: rep, precise_date: precise_date};
				},
				load_nonFarm_reports_list: async function () {
					var reports_list;
					$.ajax({
						async: false,
						url: 'game.php?screen=report&mode=attack&group_id=-1',
						success: function (response) {
							reports_list = response;
						},
						complete: function (XHR, textStatus) {
							if (textStatus != 'success') {
								throw LOCALE.ERRORS.DATA_LOADER.REPORTS.ERROR_4 + textStatus;
							}
						}
					});
					await script.utilitys.sleep();
					script.progress_bar.update();
	
					if ($(reports_list).find('input[name=page_size]')[0].value < 1000) {
						$.ajax({
							async: false,
							url: '/game.php?screen=report&action=change_page_size&mode=attack&from=0',
							dataType: 'json',
							type: 'POST',
							data: {
								h: base_data.csrf,
								page_size: 1000
							},
							success: function (response) {
								reports_list = response;
							},
							complete: function (XHR, textStatus) {
								if (textStatus != 'success') {
									throw LOCALE.ERRORS.DATA_LOADER.REPORTS.ERROR_5 + textStatus;
								}
							}
						});
						await script.utilitys.sleep();
					}
					script.progress_bar.update();
	
					reports_list = $(reports_list).find('#report_list')[0].rows; 				
	
					for (var i=1; i<reports_list.length-1; i++) {
						var date = script.utilitys.parse_date(reports_list[i].cells[2].innerText).getTime() + 1000*60;

						if (date < script_data.time_stamp) {
							break;
						}
	
						if (reports_list[i].cells[1].innerHTML.indexOf('/graphic/command/farm.png') != -1) {
							continue;
						}
	
						if (reports_list[i].cells[1].innerHTML.indexOf('/graphic/command/spy.png') == -1) {
							continue;
						}
	
						var report_tytle = $(reports_list[i]).find('span.quickedit-label')[0].innerText;
						if (report_tytle.indexOf(LOCALE.BARB_REPORT_ATTACK) == -1 &&
							report_tytle.indexOf(LOCALE.NOMAD_REPORT_ATTACK) == -1 &&
							report_tytle.indexOf(LOCALE.BARB_REPORT_SCOUT) == -1 &&
							report_tytle.indexOf(LOCALE.NOMAD_REPORT_SCOUT) == -1
							) {
							continue;
						}
	
						let report = {};
						var coords = script.utilitys.coordsFromName(report_tytle);
						var older_raport = false;
						for (var j=0; j<plunder_list.length; j++) {
							if (coords.x == plunder_list[j].village.coords.x && coords.y == plunder_list[j].village.coords.y) {
								report['village'] = plunder_list[j].village;
								for (var k=0; k<script.reports_handler.nonFarm_reports.length; k++) {
									if (report['village'] === script.reports_handler.nonFarm_reports[k].village) {
										older_raport = true;
										break;
									}
								}
								break;
							}
						}
						if (typeof report.village == 'undefined' || older_raport) {
							continue;
						}
	
						if (date < report.village.timeStamps.build) {
							continue;
						}
	
						report['id'] = $(reports_list[i].cells[1]).find('a')[0].href.split('view=')[1];

						if (report.id != report.village.report_ids.nonFarm) {
							if (coords.x == 509 && coords.y == 299) console.log('HAAA!');
							script.reports_handler.nonFarm_reports.push(report);
						}
					}
				}
			},
			load_full_plunder_list: async function () {
				var plunder_table = $('#plunder_list')[0];
				if (typeof plunder_table == 'undefined' || typeof plunder_table.rows[2] == 'undefined') {
					throw LOCALE.ERRORS.DATA_LOADER.NO_REPORTS;
				}
				while (plunder_table.rows.length > 2) {
					plunder_list.push({ row: plunder_table.rows[2] });
					plunder_table.rows[2].remove();
				}

				var page_nav = $('#plunder_list_nav')[0];
				var pages = $(page_nav).find('a.paged-nav-item');
				for (let i = 0; i < pages.length; i++) {
					$.ajax({
						async: false,
						url: pages[i].href,
						type: 'GET',
						success: function (response) {
							var table = $(response).find('#plunder_list')[0];
							for (let i = 2; i < table.rows.length; i++) {
								plunder_list.push({ row: table.rows[i] });
							}
						},
						complete: function (XHR, textStatus) {
							if (textStatus != 'success') {
								throw LOCALE.ERRORS.DATA_LOADER.PLUNDER_LIST_PAGE + textStatus;
							}
						}
					});
					await script.utilitys.sleep();
				}
				script.progress_bar.update();
			},
			load_game_data: async function () {
				let create_game_template = false;
				if (base_data.template_ids.a == 0) {
					$(base_data.template_form).find('input[name=spear\\[' + base_data.template_ids.a + '\\]')[0].value = 1;
					create_game_template = true;
				}
				if (base_data.template_ids.b == 1) {
					$(base_data.template_form).find('input[name=spear\\[' + base_data.template_ids.b + '\\]')[0].value = 1;
					create_game_template = true;
				}
				if (create_game_template) {
					UI.InfoMessage(LOCALE.POPUPS.INGAME_TEMPLATES_CREATION, 10000);
					await script.utilitys.sleep(3000);
					$(base_data.template_form).find('.btn')[0].click();
					throw '';
				}

				let units_speed = 0;
				$.ajax({
					async: false,
					url: '/interface.php?func=get_config',
					dataType: 'xml',
					success: function(response){
						base_data.world_speed =  Number($(response).find("config speed").text());
						units_speed = Number($(response).find("config unit_speed").text());
					},
					complete: function (XHR, textStatus) {
						if (textStatus != 'success') {
							throw LOCALE.ERRORS.DATA_LOADER.INTERFACE_WORLD + textStatus;
						}
					}
				});
				await script.utilitys.sleep();
				script.progress_bar.update();
				
				$.ajax({
					async: false,
					url: '/interface.php?func=get_unit_info',
					dataType: 'xml',
					success: function (response) {
						for (let i = 0; i < base_data.units.send_units.length; i++) {
							var unit = base_data.units.send_units[i];
							base_data.units.capacity[unit] = Number($(response).find(unit + ' carry').text());
							base_data.units.speed[unit] = Number($(response).find(unit + ' speed').text());
							base_data.units.speed[unit] /= (units_speed * base_data.world_speed);
						}
					},
					complete: function (XHR, textStatus) {
						if (textStatus != 'success') {
							throw LOCALE.ERRORS.DATA_LOADER.INTERFACE_UNITS + textStatus;
						}
					}
				});
				await script.utilitys.sleep();
				script.progress_bar.update();

				let table = $('#group_popup_content_container > #group_table')[0];

				if (typeof table == 'undefined') {
					await script.game_code_interactions.load_villageDock();
					table = $('#group_popup_content_container > #group_table')[0];
				}
				else {
					script.progress_bar.update();
					script.progress_bar.update();
				}

				if (typeof table == 'undefined') {
					throw LOCALE.ERRORS.DATA_LOADER.VILLAGE_GROUP;
				}

				for (let i = 0; i < table.rows.length; i++) {
					var village = table.rows[i].cells[1].innerText;
					if (game_data.village.coord == village)
						continue;
					base_data.villages_group.push(script.utilitys.coordsFromName(village));
				}

				for (let i = 0; i < base_data.units.farm_units.length; i++) {
					var unit = base_data.units.farm_units[i];
					if (typeof Accountmanager.farm.templates['t_'+base_data.template_ids.a][unit] != 'undefined') {
						base_data.active_template_units.a[unit] = Accountmanager.farm.templates['t_'+base_data.template_ids.a][unit];
					}
					else {
						base_data.active_template_units.a[unit] = 0;
					}
					if (typeof Accountmanager.farm.templates['t_'+base_data.template_ids.b][unit] != 'undefined') {
						base_data.active_template_units.b[unit] = Accountmanager.farm.templates['t_'+base_data.template_ids.b][unit];
					}
					else {
						base_data.active_template_units.b[unit] = 0;
					}
				}
			},
			load_attacks: async function () {
				var rows;

				$.ajax({
					async: false,
					url: '/game.php?screen=overview_villages&mode=commands&type=attack&page=-1&order=command_date_arrival&dir=asc',
					type: 'GET',
					success: function (response) {
						rows = $(response).find('#commands_table tr.nowrap');
					},
					complete: function (XHR, textStatus) {
						if (textStatus != 'success') {
							throw LOCALE.ERRORS.DATA_LOADER.ATTACKS + textStatus;
						}
					}
				});
				await script.utilitys.sleep();
				script.progress_bar.update();

				for (let i=0; i<rows.length; i++) {
					var att_name = rows[i].cells[0].innerText;
					if (att_name.indexOf(LOCALE.BARB_ATTACK) != -1 || att_name.indexOf(LOCALE.NOMAD_ATTACK) != -1) {
						let attack = {
							id: $(rows[i].cells[0]).find('a')[0].href.split('&id=')[1].split('&')[0],
							village: script.utilitys.coordsFromName(att_name),
							time_HTML: rows[i].cells[2].innerHTML,
							time: script.utilitys.parse_date(rows[i].cells[2].innerText).getTime(),
							capacity: 0,
							units: {},
							u_speed: '',
							spy: false
						};
						var speed = 0;
						var unit_cells = $(rows[i]).find('td.unit-item');
						for (let j=0; j<base_data.units.send_units.length; j++) {
							var unit = base_data.units.send_units[j];
							var unit_num = Number(unit_cells[j].innerText);
							if (unit_num > 0) {
								attack.capacity += unit_num * base_data.units.capacity[unit];
								attack.units[unit] = unit_num;
								if (unit == 'spy') {
									attack.spy = true;
								}
								if (speed < base_data.units.speed[unit]) {
									speed = base_data.units.speed[unit];
									attack.u_speed = ICONS.UNITS[unit];
								}
							}
						}
						if (attack.units['axe'] && speed == base_data.units.speed['axe']) {
							attack.u_speed = ICONS.UNITS['axe'];
						}
						script.attacks_handler.attacks.push(attack);
					}
				}

			},
			main_loading: async function () {
				await this.load_game_data();
				await this.farm_assistant_options.prepare();
				await this.load_full_plunder_list();
				await this.load_attacks();
				this.script_data.load();
			}
		},
		optimizer: {
			active_icon_a: null,
			income: function(lvl) {
				if (lvl == 0) { return 5 * base_data.world_speed; }
				return 25.807 * Math.pow(Math.E, 0.1511*lvl) * base_data.world_speed;
			},   
			storage: function(lvl) {
				return Math.floor(813.35 * Math.pow(Math.E, 0.2066*lvl));
			},
			hiding: function(lvl) {
				if (lvl == 0) { return 0; }
				return Math.ceil(112.51 * Math.pow(Math.E, 0.2878*lvl));
			},
			prepare_template: function (plunder, a_element, ab) {
				var icon = $(a_element).find('img')[0];
				if (icon.src == ICONS.LOOT) return;

				if (Accountmanager.farm.last_click && Timing.getElapsedTimeSinceLoad() - Accountmanager.farm.last_click < 200) {
					UI.ErrorMessage(LOCALE.TITLE + ': ' + LOCALE.POPUPS.DELAY, 3000);
					return;
				}

				if (Accountmanager.farm.current_units.light == 0) {
					UI.ErrorMessage(LOCALE.TITLE + LOCALE.POPUPS.LACKING_UNITS, 4000);
					return;
				}

				var optimised_attack = this.calculate_attack(plunder);

				if (optimised_attack.lk == 0) {
					if (true) { //toggle w ui
						icon.src = ICONS.LOOT;
						UI.ErrorMessage(LOCALE.TITLE + LOCALE.POPUPS.TOO_EARLY, 4000);
						setTimeout(function() {
							icon.src = ICONS.OPTIMIZER;
						}, 10000);
						return;
					}
					else {
						optimised_attack.lk = 1;
						optimised_attack.capacity = 80;
					}
				}

				if (Accountmanager.farm.current_units.light < optimised_attack.lk) {
					optimised_attack.lk = Accountmanager.farm.current_units.light;
					optimised_attack.capacity = optimised_attack.lk * 80;
				}

				var ab_2 = 'a';
				if (ab == 'a') ab_2 = 'b';

				var form_data = {};

				form_data['template['+base_data.template_ids[ab]	+ '][id]'] = base_data.template_ids[ab];
				form_data['template['+base_data.template_ids[ab_2]	+ '][id]'] = base_data.template_ids[ab_2];
				form_data['template['+base_data.template_ids[ab]	+ '][new]'] = 0;
				form_data['template['+base_data.template_ids[ab_2]	+ '][new]'] = 0;

				for (let i = 0; i < base_data.units.farm_units.length; i++) {
					var unit = base_data.units.farm_units[i];
					var unit_num = base_data.active_template_units[ab_2][unit];
					form_data[unit+'['+base_data.template_ids[ab_2]	+']'] = unit_num;
					form_data[unit+'['+base_data.template_ids[ab]	+']'] = 0;
				}
				form_data['light['+base_data.template_ids[ab]+']'] = optimised_attack.lk;
				form_data['h'] = base_data.csrf;

				var tooltip = `<img src="${ICONS.UNITS['light']}">${optimised_attack.lk}<br>`;
				tooltip += `<span class="icon header ressources"></span>${optimised_attack.capacity}<br>`;
				
				var time = new Date(optimised_attack.time);
				var time_h = (time.getUTCDate() - 1) * 24 + time.getUTCHours();
				var time_m = time.getUTCMinutes();
				var time_s = time.getUTCSeconds() + Math.round(time.getUTCMilliseconds() / 1000);
				tooltip += time_h + ':';
				if (time_m < 10) tooltip += '0';
				tooltip += time_m + ':';
				if (time_s < 10) tooltip += '0';
				tooltip += time_s;
				
				Accountmanager.farm.last_click = Timing.getElapsedTimeSinceLoad();
				$.ajax({
					async: false,
					url: base_data.template_form.action,
					type: 'POST',
					data: form_data,
					complete: function (XHR, textStatus) {
						if (textStatus != 'success') { throw LOCALE.ERRORS.TEMPLATES.ERROR_2 + textStatus; }

						var game_template = Accountmanager.farm.templates['t_' + base_data.template_ids[ab]];
						if (typeof game_template == 'undefined') { throw LOCALE.ERRORS.TEMPLATES.ERROR_3; }

						game_template = {};
						for (let i = 0; i < base_data.units.farm_units.length; i++) {
							var unit_search;
							var unit = base_data.units.farm_units[i];
							var unit_num = base_data.active_template_units[ab_2][unit];
							if (unit_num > 0) {
								unit_search = XHR.responseText.indexOf(`Accountmanager.farm.templates['t_${base_data.template_ids[ab_2]}']['${unit}'] = ${unit_num};`);
								if (unit_search == -1) { throw LOCALE.ERRORS.TEMPLATES.ERROR_4; }
							}
							else {
								unit_search = XHR.responseText.indexOf(`Accountmanager.farm.templates['t_${base_data.template_ids[ab_2]}']['${unit}'] = `);
								if (unit_search != -1) { throw LOCALE.ERRORS.TEMPLATES.ERROR_4; }
							}

							unit_num = 0;
							if (unit == 'light') {
								unit_num = optimised_attack.lk;
								unit_search = XHR.responseText.indexOf(`Accountmanager.farm.templates['t_${base_data.template_ids[ab]}']['${unit}'] = ${unit_num};`);
								if (unit_search == -1) { throw LOCALE.ERRORS.TEMPLATES.ERROR_4; }
								game_template[unit] = unit_num;
							}
							else {
								unit_search = XHR.responseText.indexOf(`Accountmanager.farm.templates['t_${base_data.template_ids[ab]}']['${0}'] = `);
								if (unit_search != -1) { throw LOCALE.ERRORS.TEMPLATES.ERROR_4; }
							}
							
							base_data.active_template_units[ab][unit] = unit_num;
						}

						Accountmanager.farm.templates[`t_${base_data.template_ids[ab]}`] = game_template;

						base_data.active_template_radio[ab] = $('#' + namespace + '_radio_' + ab + '_template_0')[0];
						base_data.active_template_radio[ab].checked = true;

						for (var i=0; i<plunder_list.length; i++) {
							var send_icon = $(plunder_list[i].row).find(`.farm_icon_${ab}`);
							send_icon.prop('tooltipText', '???');
							send_icon[0].classList.add('farm_icon_disabled');			
						}

						if (script.optimizer.active_icon_a) script.optimizer.active_icon_a.remove();
						script.optimizer.active_icon_a = a_element;

						icon.src = ICONS.ATTACK;
						$(a_element).prop('tooltipText', tooltip);
						Accountmanager.initTooltips();
						a_element.onclick = function (event) {
							event.preventDefault();
							
							return Accountmanager.farm.sendUnits(this, plunder.village.id, base_data.template_ids[ab], true);
						}

						UI.SuccessMessage(LOCALE.POPUPS.TEMPLATE_ACTIVATED + ' | LK: ' + game_template.light, 10000);
					}
				});
			},
			calculate_attack: function (plunder) {
				var travel_time = plunder.dist * base_data.units.speed.light * 60 * 1000;
				var arrival_time = new Date(Date.now() + travel_time).getTime();
				var max_res = this.storage(plunder.village.buildings.storage) - this.hiding(plunder.village.buildings.hiding);
				var res = [0,0,0];
				var prod = [0,0,0];

				for (var i = 0; i < 3; i++) {
					res[i] = plunder.village.resources[i];
					prod[i] = this.income(plunder.village.buildings.eco[i]);
				}

				var attacks = script.attacks_handler.get_attacks_at_coords(plunder.village.coords);
				var attacks_before_arrival = [];

				for (var i = 0; i < attacks.length; i++) {
					if (attacks[i].time < arrival_time) {
						attacks_before_arrival.push(attacks[i]);
					}
				}

				attacks_before_arrival.sort((a,b)=>{
					return a.time < b.time;
				});

				var last_attack_time = plunder.village.timeStamps.res;
				var prod_time = 0;

				var calculate_resources = function (time, loot) {
					prod_time = time - last_attack_time;
					last_attack_time = time;
					prod_time /= 1000 * 60 * 60; // ms => h

					var res_sum = 0;
					for (var i = 0; i < 3; i++) {
						res[i] += prod[i] * prod_time;
						if (res[i] > max_res) {
							res[i] = max_res;
						}
						res_sum += res[i];
					}

					var res_ratio = 0;
					if (res_sum > 0)
						res_ratio = loot / res_sum;
					for (var i = 0; i < 3; i++) {
						res[i] -= res[i] * res_ratio;
						if (res[i] < 0) {
							res[i] = 0;
						}
					}
				};
				
				for (attack of attacks_before_arrival) {
					calculate_resources(attack.time, attack.capacity);
				}
				calculate_resources(arrival_time, 0);

				var lk = Math.floor((res[0]+res[1]+res[2])/80);

				return { lk: lk, time: travel_time, capacity: lk*80 };
			},
			after_send: function (element) {
				if (script.optimizer.active_icon_a) script.optimizer.active_icon_a.remove();
				var optimizer_icons = $(element).closest('tr').find(`.${namespace}_optimizer`);
				for (icon of optimizer_icons) {
					icon.remove();
				}
			}
		},
		plunders_handler: {
			handle_plunders: async function () {
				var any_new_data = false;
				var aaaaa = 0;
				for (plunder of plunder_list) {
					var new_village = this.get_village_data(plunder);
					if (this.read_filters_flags(plunder)) {
						any_new_data = true;
						if (new_village) {
							script_data.villages.push(plunder.village);
						}
					}
				}
				if (any_new_data) {
					script.data_loader.script_data.save();
				}

				await script.data_loader.reports.load_nonFarm_reports_list();

				for (plunder of plunder_list) {
					this.determine_report_importance(plunder);
				}

				for (plunder of plunder_list) {
					script.gui.plunder_list.format_row(plunder);
				}
			},
			get_village_data: function (plunder) {
				plunder['village'] = {
					id: -1,
					coords: { x: -1, y: -1 },
					timeStamps: { build: -1, res: -1 },
					report_ids: { farm: -1, nonFarm: -1 },
					resources: [-1, -1, -1],
					units: false,
					buildings: {
						eco: [-1, -1, -1],
						eco_sum: -1,
						wall: -1,
						storage: -1,
						hiding: -1
					}
				};

				plunder['filters_1'] = [false, false, false, false, false, false];

				var cell = plunder.row.cells[11];
				plunder.village.id = Number($(cell).find('a')[0].attributes[1].value.match(/\d+/)[0]);

				var new_village = true;

				for (v of script_data.villages) {
					if (v.id == plunder.village.id) {
						new_village = false;
						plunder.village = v;
						break;
					}
				}

				cell = plunder.row.cells[3];
				if (new_village) {
					plunder.village.coords = script.utilitys.coordsFromName(cell.innerText);
				}
				plunder['dist'] = script.utilitys.distance(base_data.village, plunder.village.coords);

				return new_village;
			},
			read_filters_flags: function (plunder) {
				var new_data = false;

				var cell;

				cell = plunder.row.cells[4];
				var date = script.utilitys.parse_date(cell.innerText).getTime();
				
				// LOSSES
				cell = plunder.row.cells[1];
				var green = $(cell).find('img')[0].src.indexOf('/green.png') != -1 ? true : false
				var blue = $(cell).find('img')[0].src.indexOf('/blue.png') != -1 ? true : false
				if (!green && !blue) {
					if (plunder.row.cells[6].innerText == '?') {
						if (date > plunder.village.timeStamps.build) {
							if (plunder.village.buildings.wall != -1) {
								plunder.village.buildings.wall = -1;
								plunder.filters_1[5] = true;
								new_data = true;
							}
						}
					}
					
					var yellow = $(cell).find('img')[0].src.indexOf('/yellow.png') != -1 ? true : false;

					if (yellow) {
						plunder.filters_1[3] = true;

						if (plunder.village.units) {
							plunder.village.units = false;
							new_data = true;
						}
					}
					else {
						plunder.filters_1[4] = true;
						plunder.filters_1[5] = true;
					}
				}
				else {
					if (green && plunder.village.units) {
						plunder.village.units = false;
						new_data = true;
					}
				}

				// LOOT
				cell = plunder.row.cells[2];
				var img = $(cell).find('img')[0];
				if (typeof img != 'undefined') {
					plunder.filters_1[2] = img.src.indexOf('max_loot/0.png') != -1 ? true : false;
					cell = plunder.row.cells[4];
					if (date > plunder.village.timeStamps.res) {
						new_data = true;
						plunder.village.timeStamps.res = Number(date);
						plunder.village.resources = [0,0,0];
					}
				}

				// DISTANCE
				for (v of base_data.villages_group) {
					if (script.utilitys.distance(plunder.village.coords, v) < plunder.dist) {
						plunder.filters_1[0] = true;
						break;
					}
				}

				// ATTACKED
				cell = plunder.row.cells[3];
				img = $(cell).find('img')[0];
				if (typeof img != 'undefined') {
					plunder.filters_1[1] = true;
				}

				//wall
				cell = plunder.row.cells[6];
				if (cell.innerText != '?') {
					if (date > plunder.village.timeStamps.build) {
						if (plunder.village.buildings.wall != Number(cell.innerText)) {
							plunder.village.buildings.wall = Number(cell.innerText);
							new_data = true;
						}
					}
				}
				if (plunder.village.buildings.wall >= 0) {
					if (plunder.village.buildings.wall > script_data.settings.filters.params[0]) {
						plunder.filters_1[5] = true;
					}
				}

				return new_data;
			},
			determine_report_importance: function (plunder) {
				var report_id = $(plunder.row.cells[3]).find('a')[0].href.split('view=')[1];
	
				if (plunder.village.report_ids.farm == report_id) {
					return;
				}

				if (plunder.village.report_ids.nonFarm == report_id) {
					return;
				}

				var nonFarm_reps = script.reports_handler.nonFarm_reports;
				for (var i=0; i<nonFarm_reps.length; i++) {
					if (nonFarm_reps[i].id == report_id) {
						return;
					}
				}

				var date = script.utilitys.parse_date(plunder.row.cells[4].innerText).getTime();
				
				var c = $(plunder.row.cells[10]).find('a')[0];
				if (typeof c != 'undefined') {
					script.reports_handler.important_reports.push({id: report_id, date: date, village: plunder.village});
					return;
				}
				
				if (!plunder.filters_1[2]) {
					if (plunder.village.timeStamps.build != -1) {
						script.reports_handler.important_reports.push({id: report_id, date: date, village: plunder.village});
						return;
					}
					var nonFarm_reps = script.reports_handler.nonFarm_reports;
					for (var i=0; i<nonFarm_reps.length; i++) {
						if (nonFarm_reps[i].village === plunder.village) {
							script.reports_handler.important_reports.push({id: report_id, date: date, village: plunder.village});
							return;
						}
					}
				}
			},
			send_lock: function () {
				var ab_elements = $('.farm_icon');
				for (var i=0; i<ab_elements.length; i++) {
					if ($(ab_elements[i]).hasClass('decoration') || $(ab_elements[i]).hasClass('farm_icon_disabled')) {
						continue;
					}
					ab_elements[i].classList.add('farm_icon_disabled');
				}
			},
			send_unlock: function (element) {
				var n = Timing.getElapsedTimeSinceLoad();
				if (Accountmanager.farm.last_click) {
					n -= Accountmanager.farm.last_click;
					if (n > 200)
						n = 200;
				}
				else
					n = 0;

				setTimeout(function() {
					var ab_elements = $('#plunder_list td .farm_icon');
					for (var i=0; i<ab_elements.length; i++) {
						if ($(ab_elements[i]).hasClass('farm_icon_disabled') ) {
							if (element !== ab_elements[i])
								ab_elements[i].classList.remove('farm_icon_disabled');
						}
					}
				}, 200 - n);
					
				setTimeout(function() {
					element.classList.remove('farm_icon_disabled');
				}, 2000);
			}
		},
		panels: {
			farm: {
				add: function () {
					var table = $('#' + namespace + '_farming_table')[0];

					let template = {
						id: 1,
						name: '',
						units: { spear: 1, sword: 0, axe: 0, archer: 0, spy: 0, light: 0, marcher: 0, heavy: 0, knight: 0 }
					};

					let searching_free = true;
					while (searching_free) {
						searching_free = false;
						for (let i = 0; i < script_data.templates.farming.length; i++) {
							if (template.id == script_data.templates.farming[i].id) {
								template.id++;
								searching_free = true;
								break;
							}
						}
					}

					console.log(template);

					const template_row = document.createElement('tr');
					template_row.innerHTML = script.gui.panels.farm.template_row_innerHTML(template);
					template_row.id = namespace + '_farm_template_' + template.id;
					table.tBodies[0].append(template_row);

					var template_buttons = $(template_row).find('.btn');
					template_buttons[0].addEventListener('click', async function () {
						try {
							script.panels.farm.save(template);
						} catch (error) { errorHandler.handle_error(error); }
					});
					template_buttons[1].addEventListener('click', async function () {
						try {
							script.panels.farm.refresh(template);
						} catch (error) { errorHandler.handle_error(error); }
					});
					template_buttons[2].addEventListener('click', async function () {
						try {
							script.panels.farm.delete(template);
						} catch (error) { errorHandler.handle_error(error); }
					});

					var radio_other_a = $('#' + namespace + '_radio_a_template_0')[0];
					const radio_a = script.gui.panels.settings.create_template_radio('a', template);
					radio_other_a.before(radio_a);
					radio_other_a.before(script.gui.panels.settings.create_radio_label(radio_a, template));
					radio_other_a.before(document.createElement('br'));

					var radio_other_b = $('#' + namespace + '_radio_b_template_0')[0];
					const radio_b = script.gui.panels.settings.create_template_radio('b', template);
					radio_other_b.before(radio_b);
					radio_other_b.before(script.gui.panels.settings.create_radio_label(radio_b, template));
					radio_other_b.before(document.createElement('br'));

					script_data.templates.farming.push(template);
					script.data_loader.script_data.save();
				},
				save: function (template) {
					var template_row = $('#' + namespace + '_farm_template_' + template.id)[0];
					var inputs = $(template_row).find('input');

					var speed = 0;
					var capacity = 0;

					var dif = false;
					for (let i = 0; i < base_data.units.farm_units.length; i++) {
						var unit = base_data.units.farm_units[i];
						var unit_num = parseInt(inputs[i + 1].value, 10);
						if (Number.isNaN(unit_num)) {
							UI.ErrorMessage(LOCALE.TITLE + ': ' + LOCALE.POPUPS.NOT_A_NUMBER + inputs[i + 1].value);
							unit_num = template.units[unit];
							inputs[i + 1].value = unit_num;
						}
						if (unit_num > 0) {
							capacity += base_data.units.capacity[unit] * unit_num;
							if (speed < base_data.units.speed[unit]) {
								speed = base_data.units.speed[unit];
							}
						}
						if (template.units[unit] != unit_num) {
							template.units[unit] = unit_num;
							dif = true;
						}
					}

					var radio_a = $('#' + namespace + '_radio_a_template_' + template.id)[0];
					var radio_b = $('#' + namespace + '_radio_b_template_' + template.id)[0];

					if (dif) {
						if (radio_a.checked) {
							$('#' + namespace + '_radio_a_template_0')[0].checked = true;
						}
						if (radio_b.checked) {
							$('#' + namespace + '_radio_b_template_0')[0].checked = true;
						}
					}

					if (template.name != inputs[0].value) {
						template.name = inputs[0].value;
						radio_a.labels[0].innerText = template.name;
						radio_b.labels[0].innerText = template.name;
						dif = true;
					}

					if (dif) {
						template_row.cells[base_data.units.farm_units.length+1].innerText = capacity;
						template_row.cells[base_data.units.farm_units.length+2].innerText = speed;
						script.data_loader.script_data.save();
					}
				},
				refresh: function (template) {
					var template_row = $('#' + namespace + '_farm_template_' + template.id)[0];
					var inputs = $(template_row).find('input');

					inputs[0].value = template.name;
					for (let i = 0; i < base_data.units.farm_units.length; i++) {
						var unit = base_data.units.farm_units[i];
						inputs[i + 1].value = template.units[unit];
					}
				},
				delete: function (template) {
					var template_row = $('#' + namespace + '_farm_template_' + template.id)[0];
					var inder = script_data.templates.farming.indexOf(template);
					template_row.remove();

					var radio_a = $('#' + namespace + '_radio_a_template_' + template.id)[0];
					var radio_b = $('#' + namespace + '_radio_b_template_' + template.id)[0];

					if (radio_a.checked) {
						$('#' + namespace + '_radio_a_template_0')[0].checked = true;
					}
					if (radio_b.checked) {
						$('#' + namespace + '_radio_b_template_0')[0].checked = true;
					}
				
					radio_a.labels[0].remove();
					radio_b.labels[0].remove();
					radio_a.remove();
					radio_b.remove();

					var list_a = $('#Farm_Optimizer_radio_list_a')[0];
					var list_b = $('#Farm_Optimizer_radio_list_b')[0];
					$(list_a).find('br')[inder].remove();
					$(list_b).find('br')[inder].remove();

					script_data.templates.farming.splice(inder, 1);
					script.data_loader.script_data.save();
				},
			},
			wallbreaker: {
				add: function () {
					var i = script_data.templates.wallbreaking.length;
					if (i >= 20) {
						return;
					}

					i++;

					var table = $('#' + namespace + '_wallbreakers_table')[0];
					let template = { spear: 0, sword: 0, archer: 0, axe: 0, spy: 0, light: 0, marcher: 0, heavy: 0, ram: 0, catapult: 0, knight: 0, snob: 0 };

					const template_row = document.createElement('tr');
					template_row.innerHTML = script.gui.panels.wallbreaker.template_row_innerHTML(i, template);
					template_row.id = namespace + '_walbreaker_template_' + i;
					table.tBodies[0].append(template_row);
					var template_buttons = $(template_row).find('.btn');
					template_buttons[0].addEventListener('click', async function () {
						try {
							script.panels.wallbreaker.save(template);
						} catch (error) { errorHandler.handle_error(error); }
					});
					template_buttons[1].addEventListener('click', async function () {
						try {
							script.panels.wallbreaker.refresh(template);
						} catch (error) { errorHandler.handle_error(error); }
					});

					script_data.templates.wallbreaking.push(template);
					script.data_loader.script_data.save();
				},
				save: function (template) {
					var lvl = script_data.templates.wallbreaking.indexOf(template) + 1;
					var template_row = $('#' + namespace + '_walbreaker_template_' + lvl)[0];
					var inputs = $(template_row).find('input');
					var capacity = 0;
					var dif = false;
					for (let i = 0; i < base_data.units.send_units.length; i++) {
						var unit = base_data.units.send_units[i];
						var unit_num = inputs[i].value;
						if (unit_num > 0) {
							capacity += base_data.units.capacity[unit] * unit_num;
						}
						if (template[unit] != unit_num) {
							template[unit] == unit_num;
							dif = true;
						}
					}
					if (dif) {
						template_row.cells[13].innerText = capacity;
						script.data_loader.script_data.save();
					}
				},
				refresh: function (template) {
					var lvl = script_data.templates.wallbreaking.indexOf(template) + 1;
					var template_row = $('#' + namespace + '_walbreaker_template_' + lvl)[0];
					var inputs = $(template_row).find('input');
					for (let i = 0; i < base_data.units.send_units.length; i++) {
						var unit = base_data.units.send_units[i];
						inputs[i].value = template[unit];
					}
				},
				delete: function () {
					var lvl = script_data.templates.wallbreaking.length;
					var template_row = $('#' + namespace + '_walbreaker_template_' + lvl)[0];
					template_row.remove();
					script_data.templates.wallbreaking.pop();
					script.data_loader.script_data.save();
				}
			},
			settings: {
				activate_template: function (ab, t_id) {
					if (base_data.active_template_radio[ab] === $('#' + namespace + '_radio_' + ab + '_template_' + t_id)[0]) {
						return;
					}

					var time = Timing.getElapsedTimeSinceLoad();

					if (Accountmanager.farm.last_click && time - Accountmanager.farm.last_click < 200) {
						UI.ErrorMessage(LOCALE.TITLE + ': ' + LOCALE.ERRORS.POPUPS.DELAY, 3000);
						base_data.active_template_radio[ab].checked = true;
						return;
					}

					var ab_2;
					if (ab == 'a')
						ab_2 = 'b';
					else
						ab_2 = 'a';

					var template;
					for (var i = 0; i < script_data.templates.farming.length; i++) {
						if (t_id == script_data.templates.farming[i].id) {
							template = script_data.templates.farming[i];
							break;
						}
					}
					if (typeof template == 'undefined') {
						throw LOCALE.ERRORS.TEMPLATES.ERROR_1;
					}

					var form_data = {};

					form_data['template['+base_data.template_ids.a+'][id]'] = base_data.template_ids.a;
					form_data['template['+base_data.template_ids.b+'][id]'] = base_data.template_ids.b;
					form_data['template['+base_data.template_ids.a+'][new]'] = 0;
					form_data['template['+base_data.template_ids.b+'][new]'] = 0;
					var tooltip = '';
					var capacity = 0;
					var speed = 0;
					for (let i = 0; i < base_data.units.farm_units.length; i++) {
						var unit = base_data.units.farm_units[i];
						var unit_num = template.units[unit];
						form_data[unit+'['+base_data.template_ids[ab]+']'] = unit_num;
						if (unit_num != 0) {
							tooltip += `<img src="${ICONS.UNITS[unit]}">${unit_num}<br>`;
							capacity += base_data.units.capacity[unit] * unit_num;
							if (speed < base_data.units.speed[unit]) {
								speed = base_data.units.speed[unit];
							}
						}

						unit_num = base_data.active_template_units[ab_2][unit];
						form_data[unit+'['+base_data.template_ids[ab_2]+']'] = unit_num;
					}
					if (capacity > 0) {
						tooltip += `<span class="icon header ressources"> </span>${capacity}<br>`;
					}

					tooltip += LOCALE.TIME_SPAN;
					form_data['h'] = base_data.csrf;

					Accountmanager.farm.last_click = time;
					
					$.ajax({
						async: false,
						url: base_data.template_form.action,
						type: 'POST',
						data: form_data,
						complete: function (XHR, textStatus) {
							if (textStatus != 'success') {
								base_data.active_template_radio[ab].checked = true;
								throw LOCALE.ERRORS.TEMPLATES.ERROR_2 + textStatus;
							}

							var game_template = Accountmanager.farm.templates['t_' + base_data.template_ids[ab]];
							if (typeof game_template == 'undefined') {
								base_data.active_template_radio[ab].checked = true;
								throw LOCALE.ERRORS.TEMPLATES.ERROR_3;
							}

							for (let i = 0; i < base_data.units.farm_units.length; i++) {
								var unit = base_data.units.farm_units[i];
								var unit_num = template.units[unit];
								var unit_search;
								if (unit_num > 0) {
									unit_search = XHR.responseText.indexOf(`Accountmanager.farm.templates['t_${base_data.template_ids[ab]}']['${unit}'] = ${unit_num};`);
									if (unit_search == -1) {
										base_data.active_template_radio[ab].checked = true;
										throw LOCALE.ERRORS.TEMPLATES.ERROR_4;
									}
								}
								else {
									unit_search = XHR.responseText.indexOf(`Accountmanager.farm.templates['t_${base_data.template_ids[ab]}']['${unit}'] = `);
									if (unit_search != -1) {
										base_data.active_template_radio[ab].checked = true;
										throw LOCALE.ERRORS.TEMPLATES.ERROR_4;
									}
								}
							}

							game_template = {};
							var units_available = true;
							for (let i = 0; i < base_data.units.farm_units.length; i++) {
								var unit = base_data.units.farm_units[i];
								var unit_num = template.units[unit];
								if (unit_num > 0) {
									game_template[unit] = unit_num;
									if (unit_num > Accountmanager.farm.current_units[unit])
										units_available = false;
								}
								base_data.active_template_units[ab][unit] = unit_num;
							}
							Accountmanager.farm.templates[`t_${base_data.template_ids[ab]}`] = game_template;

							base_data.active_template_radio[ab] = $('#' + namespace + '_radio_' + ab + '_template_' + template.id)[0];

							if (script.optimizer.active_icon_a) script.optimizer.active_icon_a.remove();

							for (var i=0; i<plunder_list.length; i++) {
								var time = new Date(plunder_list[i].dist*speed*60*1000);
								var time_h = (time.getUTCDate() - 1) * 24 + time.getUTCHours();
								var time_m = time.getUTCMinutes();
								var time_s = time.getUTCSeconds() + Math.round(time.getUTCMilliseconds() / 1000);
								var tooltipText = tooltip + time_h + ':';
								if (time_m < 10)
									tooltipText += '0';
								tooltipText += time_m + ':';
								if (time_s < 10)
									tooltipText += '0';
								tooltipText += time_s;

								var send_icon = $(plunder_list[i].row).find(`.farm_icon_${ab}`);
								send_icon.prop('tooltipText', tooltipText);

								if (units_available) {
									send_icon[0].classList.remove(`farm_icon_disabled`);
								}
							}

							UI.SuccessMessage(LOCALE.POPUPS.TEMPLATE_ACTIVATED + ' | ' + ab.toUpperCase() + ': ' + template.name);
						}
					});
				},
				filter_plunder: function (plunder) {
					var filters = script_data.settings.filters;

					var hide = false;
					for (let i = 0; i < filters.find_1.length; i++) {
						if (filters.find_1[i] && !plunder.filters_1[i]) {
							hide = true;
							break;
						}
						if (filters.hide_1[i] && plunder.filters_1[i]) {
							hide = true;
							break;
						}
					}

					for (let i = 0; i < filters.find_2.length; i++) {
						var param = script_data.settings.filters.params[i];
						if (filters.find_2[i]) {
							switch (i) {
								case 0:
									if (plunder.village.buildings.wall <= param) {
										hide = true;
									}
									break;
								case 1:
									if (plunder.village.buildings.eco_sum == -1 || plunder.village.buildings.eco_sum >= param) {
										hide = true;
									}
									break;
								case 2:
									if (plunder.dist <= param) {
										hide = true;
									}
									break;
								case 3:
									if (0 <= param) {
										// NOT IMPLEMENTED YET
										console.log('NOT IMPLEMENTED YET: filters.find_2[i], case 3');
										hide = true;
									}
									break;
								case 4:
									let scouted_time = (Date.now() - plunder.village.timeStamps.build) / (1000 * 60 * 60);
									if (scouted_time <= param) {
										hide = true;
									}
									break;
							}
						}
						if (filters.hide_2[i]) {
							switch (i) {
								case 0:
									if (plunder.village.buildings.wall > param) {
										hide = true;
									}
									break;
								case 1:
									if (plunder.village.buildings.eco_sum != -1 && plunder.village.buildings.eco_sum < param) {
										hide = true;
									}
									break;
								case 2:
									if (plunder.dist > param) {
										hide = true;
									}
									break;
								case 3:
									if (0 > param) {
										// NOT IMPLEMENTED YET
										console.log('NOT IMPLEMENTED YET: filters.hide_2[i], case 3');
										hide = true;
									}
									break;
								case 4:
									let scouted_time = (Date.now() - plunder.village.timeStamps.build) / (1000 * 60 * 60);
									if (scouted_time > param) {
										hide = true;
									}
									break;
							}
						}
					
						if (hide) {
							break;
						}
					}	

					if (hide) {
						plunder.row.style.display = 'none';
					}
					else {
						plunder.row.style.display = null;
					}
				},
				aplly_filters: function () {
					var form_1 = $('#' + namespace + '_filters_1_form')[0];
					var form_2 = $('#' + namespace + '_filters_2_form')[0];

					var filters = script_data.settings.filters;

					for (let i = 0; i < filters.find_1.length; i++) {
						filters.find_1[i] = form_1['find_' + i].checked;
						filters.hide_1[i] = form_1['hide_' + i].checked;
					}

					for (let i = 0; i < filters.hide_2.length; i++) {
						filters.find_2[i] = form_2['find_' + i].checked;
						filters.hide_2[i] = form_2['hide_' + i].checked;
						var param = Number.parseInt(form_2['val_' + i].value);
						if (Number.isNaN(param)) {
							UI.ErrorMessage(LOCALE.TITLE + ': ' + LOCALE.POPUPS.NOT_A_NUMBER + form_2['val_' + i].value);
							form_2['val_' + i].value = filters.params[i];
							continue;
						}
						filters.params[i] = param;
					}

					script.data_loader.script_data.save();

					for (plunder of plunder_list) {
						this.filter_plunder(plunder);
						script.gui.plunder_list.refresh_row(plunder);
					}
				}
			}
		},
		gui: {
			toggle_visibility: function (element) {
				if (element.style.display == 'none')
					element.style.display = null;
				else
					element.style.display = 'none';
			},
			panels: {
				farm: {
					template_row_innerHTML: function (template) {
						var capacity = 0;
						var speed = 0;

						var html = `<td align="center"><input type="text" name="name" size="10" value="${template.name}" maxlength="15"></td>`;

						for (let i = 0; i < base_data.units.farm_units.length; i++) {
							var unit = base_data.units.farm_units[i];
							var unit_num = template.units[unit];
							if (unit_num > 0) {
								capacity += base_data.units.capacity[unit] * unit_num;
								if (speed < base_data.units.speed[unit]) {
									speed = base_data.units.speed[unit];
								}
							}
							html += `<td align="center"><input type="text" name="${unit}" size="1" value="${template.units[unit]}"></td>`;
						}

						html += `
							<td class='${namespace}_haul' style="text-align:center">${capacity}</td>
							<td class='${namespace}_speed' style="text-align:center">${speed}</td>
							<td align="center">
								<div>
									<input class="btn btn-confirm-yes"	type="button" value="${LOCALE.BUTTONS.SAVE}">
									<input class="btn btn-default"		type="button" value="${LOCALE.BUTTONS.REFRESH}">
									<input class="btn btn-confirm-no"	type="button" value="${LOCALE.BUTTONS.DELETE}">
								</div>
							</td>
						`;

						return html;
					},
					create_header: function () {
						const farm_title = document.createElement('h4');
						farm_title.style.height = '18px';
						farm_title.style.fontSize = '10pt';
						farm_title.addEventListener('click', async function () {
							try {
								script_data.settings.open_panels.farming_templates = !script_data.settings.open_panels.farming_templates;
								script.data_loader.script_data.save();
								script.gui.toggle_visibility($(this).closest('div')[0].lastChild);
							} catch (error) { errorHandler.handle_error(error); }
						});

						const farm_title_link = document.createElement('a');
						farm_title_link.innerText = LOCALE.FARM_TEMPLATES;
						farm_title.append(farm_title_link);

						const farm_img = document.createElement('img');
						farm_img.src = ICONS.FARM;
						farm_img.style.float = 'left';
						farm_img.style.margin = '0px 3px 0px 0px';
						farm_title.prepend(farm_img);

						return farm_title;
					},
					table_innerHTML: function () {
						let html = `
							<th style="text-align:center">
								${LOCALE.NAME}
							</th>`;

						for (let i = 0; i < base_data.units.farm_units.length; i++) {
							var unit = base_data.units.farm_units[i];
							html += `
								<th style="text-align:center">
									<a href="#" class="unit_link" data-unit="${unit}">
										<img src="${ICONS.UNITS[unit]}" title="${LOCALE.UNITS[unit]}" alt="" class="">
									</a>
								</th>
							`;
						}

						html += `
							<th style="text-align:center">
								<span class="icon header ressources"></span>
							</th>
							<th style="text-align:center">
								<img src="${ICONS.SPEED}" title="${LOCALE.SPEED}" alt="" class="">
							</th>
							<th></th>
						`;

						return html;
					},
					create_template_row: function (template) {
						const template_row = document.createElement('tr');
						template_row.classList.add('nowrap');
						template_row.innerHTML = this.template_row_innerHTML(template);
						template_row.id = namespace + '_farm_template_' + template.id;

						let row_template = template;
						var template_buttons = $(template_row).find('.btn');
						template_buttons[0].addEventListener('click', async function () {
							try {
								script.panels.farm.save(row_template);
							} catch (error) { errorHandler.handle_error(error); }
						});
						template_buttons[1].addEventListener('click', async function () {
							try {
								script.panels.farm.refresh(row_template);
							} catch (error) { errorHandler.handle_error(error); }
						});
						template_buttons[2].addEventListener('click', async function () {
							try {
								script.panels.farm.delete(row_template);
							} catch (error) { errorHandler.handle_error(error); }
						});

						return template_row;
					},
					create_add_template_button: function () {
						const add_template_button = document.createElement('input');
						add_template_button.type = 'button';
						add_template_button.classList.add('btn');
						add_template_button.id = namespace + '_add_farm_template';
						add_template_button.value = LOCALE.BUTTONS.ADD_TEMPLATE;
						add_template_button.style.margin = '5px';
						add_template_button.addEventListener('click', async function () {
							try {
								script.panels.farm.add();
							} catch (error) { errorHandler.handle_error(error); }
						});

						return add_template_button;
					},
					create: function () {
						const div_farm = document.createElement('div');
						div_farm.classList.add('vis');
						div_farm.style.background = "#e3d5b3";

						div_farm.append(this.create_header());

						const farm_templates_div = document.createElement('div');
						div_farm.append(farm_templates_div);
						if (!script_data.settings.open_panels.farming_templates) {
							farm_templates_div.style.display = 'none';
						}

						const farm_table = document.createElement('table');
						farm_table.id = namespace + '_farming_table';
						farm_table.classList.add('vis');
						farm_table.width = '100%';
						farm_templates_div.append(farm_table);
						farm_table.innerHTML = this.table_innerHTML();

						for (template of script_data.templates.farming) {
							farm_table.tBodies[0].append(this.create_template_row(template));
						}

						const add_template_div = document.createElement('div');
						add_template_div.align = 'center';
						farm_templates_div.append(add_template_div);

						add_template_div.append(this.create_add_template_button());

						return div_farm;
					},
				},
				wallbreaker: {
					template_row_innerHTML: function (i, template) {
						var capacity = 0;

						var html = `<td align="center"><strong>${i}</strong></td>`;

						for (let i = 0; i < base_data.units.send_units.length; i++) {
							var unit = base_data.units.send_units[i];
							var unit_num = template[unit];
							if (unit_num > 0) {
								capacity += base_data.units.capacity[unit] * unit_num;
							}
							html += `<td align="center"><input type="text" name="${unit}" size="1" value="${template[unit]}"></td>`;
						}

						html += `
							<td class='${namespace}_haul' style="text-align:center">${capacity}</td>
							<td align="center">
								<div>
									<input class="btn btn-confirm-yes"	type="button" value="${LOCALE.BUTTONS.SAVE}">
									<input class="btn btn-default"		type="button" value="${LOCALE.BUTTONS.REFRESH}">
								</div>
							</td>
						`;

						return html;
					},
					create_header: function () {
						const wallbreakers_title = document.createElement('h4');
						wallbreakers_title.style.height = '18px';
						wallbreakers_title.style.fontSize = '10pt';
						wallbreakers_title.addEventListener('click', async function () {
							try {
								script_data.settings.open_panels.wallbreaker_templates = !script_data.settings.open_panels.wallbreaker_templates;
								script.data_loader.script_data.save();
								script.gui.toggle_visibility($(this).closest('div')[0].lastChild);
							} catch (error) { errorHandler.handle_error(error); }
						});

						const wallbreakers_img = document.createElement('img');
						wallbreakers_img.src = ICONS.WALBREAKER;
						wallbreakers_img.style.float = 'left';
						wallbreakers_img.style.margin = '0px 3px 0px 0px';
						wallbreakers_title.append(wallbreakers_img);

						const wallbreakers_title_link = document.createElement('a');
						wallbreakers_title_link.innerText = LOCALE.WALLBREAKING_TEMPLATES;
						wallbreakers_title.append(wallbreakers_title_link);

						return wallbreakers_title;
					},
					table_innerHTML: function () {
						var html = `
							<th style="text-align:center">
								<img src="${ICONS.BUILDINGS.WALL}">
							</th>
						`;

						for (let i = 0; i < base_data.units.send_units.length; i++) {
							var unit = base_data.units.send_units[i];
							html += `
								<th style="text-align:center">
									<a href="#" class="unit_link" data-unit="${unit}">
										<img src="${ICONS.UNITS[unit]}" title="${LOCALE.UNITS[unit]}" alt="" class="">
									</a>
								</th>
							`;
						}

						html += `
							<th style="text-align:center" width="60">
								<span class="icon header ressources"></span>
							</th>
							<th>
							</th>
						`;

						return html;
					},
					create_template_row: function (i) {
						const template_row = document.createElement('tr');
						template_row.classList.add('nowrap');
						template_row.innerHTML = this.template_row_innerHTML(i + 1, script_data.templates.wallbreaking[i]);
						template_row.id = namespace + '_walbreaker_template_' + (i + 1);
						var template_buttons = $(template_row).find('.btn');
						template_buttons[0].addEventListener('click', async function () {
							try {
								script.panels.wallbreaker.save(script_data.templates.wallbreaking[i]);
							} catch (error) { errorHandler.handle_error(error); }
						});
						template_buttons[1].addEventListener('click', async function () {
							try {
								script.panels.wallbreaker.refresh(script_data.templates.wallbreaking[i]);
							} catch (error) { errorHandler.handle_error(error); }
						});

						return template_row;
					},
					create_add_template_button: function () {
						const add_template_button = document.createElement('input');
						add_template_button.type = 'button';
						add_template_button.classList.add('btn');
						add_template_button.id = namespace + '_add_wallbreaker_template';
						add_template_button.value = LOCALE.BUTTONS.ADD_TEMPLATE;
						add_template_button.style.margin = '5px';
						add_template_button.addEventListener('click', async function () {
							try {
								script.panels.wallbreaker.add();
							} catch (error) { errorHandler.handle_error(error); }
						});

						return add_template_button;
					},
					create_remove_template_button: function () {
						const remove_template_button = document.createElement('input');
						remove_template_button.type = 'button';
						remove_template_button.classList.add('btn');
						remove_template_button.id = namespace + 'remove_wallbreaker_template';
						remove_template_button.value = LOCALE.BUTTONS.REMOVE_TEMPLATE;
						remove_template_button.style.margin = '5px';
						remove_template_button.addEventListener('click', async function () {
							try {
								script.panels.wallbreaker.delete();
							} catch (error) { errorHandler.handle_error(error); }
						});

						return remove_template_button;
					},
					create: function () {
						const div_wallbreakers = document.createElement('div');
						div_wallbreakers.classList.add('vis');
						div_wallbreakers.style.background = "#e3d5b3";

						div_wallbreakers.append(this.create_header());

						const wallbreaker_templates_div = document.createElement('div');
						if (!script_data.settings.open_panels.wallbreaker_templates) {
							wallbreaker_templates_div.style.display = 'none';
						}
						div_wallbreakers.append(wallbreaker_templates_div);

						const wallbreakers_table = document.createElement('table');
						wallbreakers_table.id = namespace + '_wallbreakers_table';
						wallbreakers_table.classList.add('vis');
						wallbreakers_table.width = '100%';
						wallbreaker_templates_div.append(wallbreakers_table);
						wallbreakers_table.innerHTML = this.table_innerHTML();

						for (let i = 0; i < 20; i++) {
							if (script_data.templates.wallbreaking[i] == null) {
								break;
							}
							wallbreakers_table.tBodies[0].append(this.create_template_row(i));
						}

						const add_template_div = document.createElement('div');
						add_template_div.align = 'center';
						wallbreaker_templates_div.append(add_template_div);

						add_template_div.append(this.create_add_template_button());
						add_template_div.append(this.create_remove_template_button());

						return div_wallbreakers;
					}
				},
				settings: {
					create_header: function () {
						const settings_title = document.createElement('h4');
						settings_title.style.height = '18px';
						settings_title.style.fontSize = '10pt';
						settings_title.addEventListener('click', async function () {
							try {
								script_data.settings.open_panels.settings = !script_data.settings.open_panels.settings;
								script.gui.toggle_visibility($(this).closest('div')[0].lastChild);
							} catch (error) { errorHandler.handle_error(error); }
						});

						const settings_img = document.createElement('img');
						settings_img.src = ICONS.SETTINGS;
						settings_img.style.margin = '0px 3px 0px 0px';
						settings_img.style.float = 'left';
						settings_title.append(settings_img);

						const settings_title_link = document.createElement('a');
						settings_title_link.innerText = LOCALE.SETTINGS;
						settings_title.append(settings_title_link);

						return settings_title;
					},
					create_template_radio: function (slot_ab, template) {
						const radio = document.createElement('input');
						radio.type = 'radio';
						radio.id = namespace + '_radio_' + slot_ab + '_template_' + template.id;
						radio.name = namespace + '_radio_' + slot_ab;
						radio.value = template.id;
						radio.style.margin = '0px 5px 0px 0px';

						let t_id = template.id;
						let ab = slot_ab;

						radio.addEventListener('click', async function () {
							try {
								script.panels.settings.activate_template(ab, t_id);
							} catch (error) { errorHandler.handle_error(error); }
						});

						return radio;
					},
					create_radio_label: function (radio, template) {
						const label = document.createElement('label');
						label.setAttribute('for', radio.id);
						label.innerText = template.name;
						label.style.display = 'inline';

						return label;
					},
					create_radio_other: function (slot_ab, activated) {
						const radio_other = document.createElement('input');
						radio_other.type = 'radio';
						radio_other.id = namespace + '_radio_' + slot_ab + '_template_0';
						radio_other.name = namespace + '_radio_' + slot_ab;
						radio_other.value = 0;
						radio_other.style.margin = '0px 5px 0px 0px';
						radio_other.disabled = true;
						base_data.active_template_radio[slot_ab] = radio_other;

						if (!activated) {
							radio_other.checked = true;
							for (var i=0; i<plunder_list.length; i++) {
								$(plunder_list[i].row).find(`.farm_icon_${slot_ab}`)[0].classList.add('farm_icon_disabled');
							}
						}

						return radio_other;
					},
					create_template_list_cell: function (slot_ab) {
						var slot_id;
						if (slot_ab == 'a')
							slot_id = base_data.template_ids.a;
						else
							slot_id = base_data.template_ids.b;

						const list_cell = document.createElement('td');
						list_cell.rowSpan = '2';

						const list_form = document.createElement('form');
						list_form.style.fontSize = '12pt';
						list_form.id = namespace + '_radio_list_' + slot_ab;
						list_cell.append(list_form);

						let activated = false;

						for (template of script_data.templates.farming) {
							const radio = this.create_template_radio(slot_ab, template);
							list_form.append(radio);

							list_form.append(this.create_radio_label(radio, template));

							const br = document.createElement('br');
							list_form.append(br);

							if (!activated) {
								var dif = false;
								for (let i = 0; i < base_data.units.farm_units.length; i++) {
									var unit = base_data.units.farm_units[i];
									var slot_unit = Accountmanager.farm.templates['t_' + slot_id][unit];
									var template_unit = template.units[unit];
									if (slot_unit) {
										if (slot_unit != template_unit) {
											dif = true;
											break;
										}
									}
									else if (template_unit != 0) {
										dif = true;
										break;
									}
								}
								if (!dif) {
									activated = true;
									radio.checked = true;
								}
							}
					
						}

						const radio_other = this.create_radio_other(slot_ab, activated);
						list_form.append(radio_other);

						const label_other = document.createElement('label');
						label_other.setAttribute('for', radio_other.id);
						label_other.innerText = '???';
						label_other.style.display = 'inline';
						list_form.append(label_other);

						return list_cell;
					},
					create_filters_1_cell: function () {
						const cell = document.createElement('td');

						const filters_form = document.createElement('form');
						filters_form.style.fontSsize = '10pt';
						filters_form.id = namespace + '_filters_1_form';
						cell.append(filters_form);
				
						for (let i = 0; i < LOCALE.FILTERS_1.length; i++) {
							const input_find = document.createElement('input');
							input_find.type = 'checkbox';
							input_find.name = 'find_' + i;
							input_find.checked = script_data.settings.filters.find_1[i];
							filters_form.append(input_find);

							const input_hide = document.createElement('input');
							input_hide.type = 'checkbox';
							input_hide.name = 'hide_' + i;
							input_hide.checked = script_data.settings.filters.hide_1[i];
							filters_form.append(input_hide);

							const label = document.createElement('label');
							label.innerText = LOCALE.FILTERS_1[i];
							label.style.display = 'inline';
							filters_form.append(label);

							const br = document.createElement('br');
							filters_form.append(br);
						}

						return cell;
					},
					create_filters_2_cell: function () {
						const cell = document.createElement('td');

						const filters_form = document.createElement('form');
						filters_form.style.fontSsize = '10pt';
						filters_form.id = namespace + '_filters_2_form';
						cell.append(filters_form);

						for (let i = 0; i < LOCALE.FILTERS_2.length; i++) {
							const input_find = document.createElement('input');
							input_find.type = 'checkbox';
							input_find.name = 'find_' + i;
							input_find.checked = script_data.settings.filters.find_2[i];
							filters_form.append(input_find);

							const input_hide = document.createElement('input');
							input_hide.type = 'checkbox';
							input_hide.name = 'hide_' + i;
							input_hide.checked = script_data.settings.filters.hide_2[i];
							filters_form.append(input_hide);

							const label = document.createElement('label');
							label.innerText = LOCALE.FILTERS_2[i];
							label.style.display = 'inline';
							filters_form.append(label);

							const field = document.createElement('input');
							field.type = 'text';
							field.name = 'val_' + i;
							field.size = 1;
							field.value = script_data.settings.filters.params[i];
							filters_form.append(field);
					
							const br = document.createElement('br');
							filters_form.append(br);
						}

						return cell;
					},
					create: function () {
						const panel = document.createElement('div');
						panel.classList.add('vis');
						panel.style.background = "#e3d5b3";
				
						panel.append(this.create_header());

						const settings_content_div = document.createElement('div');
						panel.append(settings_content_div);
						if (!script_data.settings.open_panels.settings) {
							settings_content_div.style.display = 'none';
						}

						const table = document.createElement('table');
						table.classList.add('vis');
						table.style.width = '100%';
						settings_content_div.append(table);

						const header_row = document.createElement('tr');
						header_row.innerHTML = `
							<th style="text-align:center" colSpan="2">Filtry</th>
							<th style="text-align:center" colSpan="2">Aktywne Szablony</th>
						`;
						table.append(header_row);

						const content_row_1 = document.createElement('tr');
						content_row_1.innerHTML = `
							<td colspan="2" align="center">Znajdź/Ukryj wioski, które:</td>
							<td align="center"><a class="farm_icon farm_icon_a decoration" href="#" onclick="return false;"></a></td>
							<td align="center"><a class="farm_icon farm_icon_b decoration" href="#" onclick="return false;"></a></td>
						`;
						table.append(content_row_1);

						const content_row_2 = document.createElement('tr');
						content_row_2.classList.add('nowrap');
						table.append(content_row_2);
				
						content_row_2.append(this.create_filters_1_cell());
						content_row_2.append(this.create_filters_2_cell());
						content_row_2.append(this.create_template_list_cell('a', base_data.template_form.action));
						content_row_2.append(this.create_template_list_cell('b', base_data.template_form.action));

						const content_row_3 = document.createElement('tr');
						table.append(content_row_3);

						const apply_cell = document.createElement('td');
						apply_cell.colSpan = 2;
						apply_cell.align = 'center';
						content_row_3.append(apply_cell);

						const apply_btn = document.createElement('input');
						apply_btn.type = 'button';
						apply_btn.classList.add('btn');
						apply_btn.value = LOCALE.BUTTONS.APPLY;
						apply_btn.addEventListener('click', async function () {
							try {
								script.panels.settings.aplly_filters();
							} catch (error) { errorHandler.handle_error(error); }
						});
						apply_cell.append(apply_btn);

						return panel;
					}
				}
			},
			plunder_list: {
				format_header: function () {
					var row = $('#plunder_list')[0].rows[0];

					row.cells[0].remove();
					row.cells[0].remove();
					row.cells[0].remove();
					row.cells[0].colSpan = 5;
					row.cells[0].rowSpan = 1;
					row.cells[0].style.textAlign = 'center';

					const attacks = document.createElement('th');
					attacks.rowSpan = 2;
					attacks.style.textAlign = 'center';
					attacks.style.width = '130px'
					attacks.innerHTML = `<img src="${ICONS.ATTACK}">`;
					row.cells[0].after(attacks);

					row.cells[2].colSpan = 3;
					row.cells[2].rowSpan = 1;
					row.cells[2].innerHTML = 'Ostatni atak';
					row.cells[2].style.textAlign = 'center';

					row.cells[3].remove();
					const wall_img = $(row.cells[3]).find('img')[0];
					row.cells[3].remove();
					const dist_img = $(row.cells[3]).find('img')[0];
					row.cells[3].innerHTML = `<img src="${ICONS.ERROR}">`;
					row.cells[3].style.textAlign = 'center';

					row.cells[4].style.textAlign = 'center';
					row.cells[4].colSpan = 7;
					row.cells[4].rowSpan = 1;
					row.cells[5].remove();

					const place = row.cells[5];
					place.rowSpan = 1;
					place.style.textAlign = 'center';
					place.remove();


					row = $('#plunder_list')[0].rows[1];

					const village = document.createElement('th');
					village.innerHTML = `<span class="icon header village"></span>`;
					village.style.textAlign = 'center';
					village.style.width = '130px';
					row.append(village);

					const prod = document.createElement('th');
					prod.colSpan = 2;
					prod.innerHTML = `<img src="${ICONS.BUILDINGS.TIMBER_CAMP}"><img src="${ICONS.BUILDINGS.CLAY_PIT}"><img src="${ICONS.BUILDINGS.IRON_MINE}">`;
					prod.style.textAlign = 'center';
					row.append(prod);

					const wall = document.createElement('th');
					wall.append(wall_img);
					wall.style.textAlign = 'center';
					row.append(wall);

					const dist = document.createElement('th');
					dist.append(dist_img);
					dist.style.textAlign = 'center';
					dist.style.width = '50px';
					row.append(dist);

					const dot = document.createElement('th');
					dot.innerHTML = `<img src="${ICONS.GREY_DOT}"></img>`;
					dot.style.textAlign = 'center';
					row.append(dot);

					const loot = document.createElement('th');
					loot.innerHTML = `<img src="${ICONS.MAX_LOOT}"></img>`;
					loot.style.textAlign = 'center';
					row.append(loot);

					const report = document.createElement('th');
					report.innerText = LOCALE.REPORT;
					report.style.textAlign = 'center';
					report.style.width = '185px';
					row.append(report);

					const optimizer_a = document.createElement('th');
					optimizer_a.style.textAlign = 'center';
					optimizer_a.innerHTML = `<img src="${ICONS.OPTIMIZER}">`;
					row.append(optimizer_a);

					const A = document.createElement('th');
					row.append(A);
					A.innerHTML = `<a class="farm_icon farm_icon_a decoration" href="#" onclick="return false;" style="margin: auto;"></a>`;

					const optimizer_b = document.createElement('th');
					optimizer_b.style.textAlign = 'center';
					optimizer_b.innerHTML = `<img src="${ICONS.OPTIMIZER}">`;
					row.append(optimizer_b);

					const B = document.createElement('th');
					row.append(B);
					B.innerHTML = `<a class="farm_icon farm_icon_b decoration" href="#" onclick="return false;" style="margin: auto;"></a>`;

					const wall_breaker = document.createElement('th');
					wall_breaker.style.textAlign = 'center';
					wall_breaker.innerHTML = `<img src="${ICONS.WALBREAKER}">`;
					row.append(wall_breaker);

					const spy = document.createElement('th');
					spy.style.textAlign = 'center';
					spy.innerHTML = `<img src="${ICONS.UNITS.spy}">`;
					row.append(spy);

					row.append(place);
				},
				format_cell_village: function (td, plunder) {
					td.innerHTML = `
						<span class="village_anchor" data-player="0" data-id="${plunder.village.id}">
							<a href="/game.php?&screen=info_village&id=${plunder.village.id}">
								${td.innerText}
							</a>
						</span>
					`;
				},
				format_cell_prod_sum: function (td, plunder) {
					td.style.textAlign = 'right';
					td.colSpan = 1;
					if (plunder.village.timeStamps.build != -1) {
						td.innerHTML = plunder.village.buildings.eco_sum + ':';
					}
					else {
						td.innerHTML = '?:';
					}
				},
				format_cell_prod: function (td, plunder, eco) {
					td.style.textAlign = 'center';
					td.style.width = '80px';
					td.colSpan = 1;
					if (plunder.village.timeStamps.build != -1) {
						td.innerHTML = `${eco[0]} / ${eco[1]} / ${eco[2]}`;
					}
					else {
						td.innerHTML = '? ? ?';
					}
				},
				format_cell_wall: function (td, plunder) {
					if (plunder.village.buildings.wall != -1) {
						td.innerHTML = `${plunder.village.buildings.wall}`;
					}
				},
				format_cell_dist: function (td) {
					if (td.innerText.indexOf('.') == -1) {
						td.innerText = td.innerText + '.0';
					}
					td.align = 'right';
					td.style.paddingRight = '10px';
				},
				format_cell_attacks: function (cell, img) {
					cell.align = 'center';
					if (typeof img != 'undefined') {
						var text = img.tooltipText;
						if (typeof text == 'undefined') {
							text = img.title;
						}
						cell.innerText = text.split(" ")[0];
						img.remove();
					}
				},
				format_cell_warning: function (td, plunder) {
					td.align = 'center';
					var tooltip = '';
					var wall = plunder.village.buildings.wall;
					var error = false;
					if (0 < wall && wall <= script_data.templates.wallbreaking.length) {
						td.innerHTML = `<img src="${ICONS.WARNING}"></img>`;
						tooltip += '<br>' + LOCALE.WARNINGS.WALL + plunder.village.buildings.wall;
					}
					let eco_sum = plunder.village.buildings.eco_sum;
					if (-1 < eco_sum && eco_sum < script_data.settings.filters.params[1]) {
						td.innerHTML = `<img src="${ICONS.WARNING}"></img>`;
						tooltip += '<br>' + LOCALE.WARNINGS.PRODUCTION;
					}
					let time;
					if (plunder.village.timeStamps.build != -1) {
						time = (Date.now() - plunder.village.timeStamps.build) / (1000 * 60 * 60);
						if (time > script_data.settings.filters.params[4]) {
							tooltip += '<br>' + LOCALE.WARNINGS.OLD_INFO;
						}
						if (time > 2*script_data.settings.filters.params[4]) {
							td.innerHTML = `<img src="${ICONS.WARNING}"></img>`;
						}
					}
					if (wall > script_data.templates.wallbreaking.length) {
						td.innerHTML = `<img src="${ICONS.ERROR}"></img>`;
						tooltip += '<br>' + LOCALE.WARNINGS.HIGH_WALL + plunder.village.buildings.wall;
						error = true;
					}
					if (plunder.village.units) {
						td.innerHTML = `<img src="${ICONS.ERROR}"></img>`;
						tooltip += '<br>' + LOCALE.WARNINGS.UNITS;
						error = true;
					}
					if (plunder.filters_1[4]) {
						td.innerHTML = `<img src="${ICONS.ERROR}"></img>`;
						tooltip += '<br>' + LOCALE.WARNINGS.FULL_LOSES;
						error = true;
					}
					if (plunder.filters_1[5]) {
						td.innerHTML = `<img src="${ICONS.ERROR}"></img>`;
						error = true;
					}
					if (tooltip != '') {
						if (error) {
							tooltip = LOCALE.WARNINGS.WARNING + '<br>' + tooltip;
						}
						else {
							tooltip = LOCALE.WARNINGS.CAUTION + '<br>' + tooltip;
						}
						$(td).find('img').prop('title', tooltip);
						UI.ToolTip($(td).find('img'));
					}
				},
				format_cell_optimize: function (td, plunder, slot_ab) {
					td.align = 'center';
					td.innerHTML = '';

					if (plunder.village.timeStamps.build == -1) return;
					if (plunder.filters_1[5]) return;

					var icon = ICONS.OPTIMIZER;
					
					var potential_attack = script.optimizer.calculate_attack(plunder);
					if (potential_attack.lk == 0) icon = ICONS.LOOT;
					
					td.innerHTML = `<a href="#" class="${namespace}_optimizer"><img src="${icon}"></img></a>`;
					let a = $(td).find('a')[0];
					a.onclick = function (event) {
						event.preventDefault();
						script.optimizer.prepare_template(plunder, this, slot_ab);
					}
				},
				format_cell_wallbreaker: function (td, plunder, href) {
					td.align = 'center';
					if (plunder.village.buildings.wall > 0) {
						let template = script_data.templates.wallbreaking[plunder.village.buildings.wall - 1];
						if (typeof template == 'undefined') {
							return;
						}
						let data = {
							target: plunder.village.id
						};
						for (var i = 0; i < base_data.units.send_units.length; i++) {
							var unit = base_data.units.send_units[i];
							var unit_num = template[unit];
							if (unit_num > 0) {
								href += unit + '=' + unit_num + '&';
								data[unit] = unit_num;
							}
						}
						td.innerHTML = `<a href="${href}"><img src="${ICONS.WALBREAKER}"></img></a>`;
						let a = $(td).find('a')[0];
						a.onclick = function (event) {
							if (!event.ctrlKey && !event.shiftKey) {
								event.preventDefault();
								CommandPopup.openRallyPoint(data);
							}
						}
					}
				},
				format_cell_spy: function (td, plunder, href) {
					if (plunder.village.timeStamps.build != -1) {
						var time = (Date.now() - plunder.village.timeStamps.build) / (1000 * 60 * 60);
						//console.log('( ' + Date.now() + ' - ' + plunder.village.timeStamps.build + ' ) / (1000*60*60) = ' + time);
						if (time < script_data.settings.filters.params[4]) {					
							td.innerHTML = '';
							return;
						}
					}
					
					td.align = 'center';
					let data = {
						target: plunder.village.id,
						spy: 1
					};
					href += 'spy=1&';
					td.innerHTML = `<a href="${href}"><img src="${ICONS.UNITS.spy}"></img></a>`;
					let a = $(td).find('a')[0];
					a.onclick = function (event) {
						if (!event.ctrlKey && !event.shiftKey) {
							event.preventDefault();
							CommandPopup.openRallyPoint(data);
						}
					}
				},
				format_row: function (plunder) {
					plunder.row.classList.add('nowrap');
					plunder.row.cells[0].remove();

					const dot		= plunder.row.cells[0]; dot.remove();
					const loot		= plunder.row.cells[0]; loot.remove();
					const village	= plunder.row.cells[0]; village.remove();
					const report	= plunder.row.cells[0]; report.remove();
					const prod		= plunder.row.cells[0]; prod.remove();
					const wall		= plunder.row.cells[0]; wall.remove();
					const dist		= plunder.row.cells[0]; dist.remove();
					const A			= plunder.row.cells[0]; A.remove();
					const B			= plunder.row.cells[0]; B.remove();
					/* C */			  plunder.row.cells[0].remove(); 
					const place		= plunder.row.cells[0]; place.remove();

					const prod_sum = document.createElement('td');
					const attacks = document.createElement('td');
					const warning = document.createElement('td');
					const A_optimize = document.createElement('td');
					const B_optimize = document.createElement('td');
					const wallbreaker = document.createElement('td');
					const spy = document.createElement('td');

					plunder.row.append(village);
					plunder.row.append(prod_sum);
					plunder.row.append(prod);
					plunder.row.append(wall);
					plunder.row.append(dist);
					plunder.row.append(attacks);
					plunder.row.append(dot);
					plunder.row.append(loot);
					plunder.row.append(report);
					plunder.row.append(warning);
					plunder.row.append(A_optimize);
					plunder.row.append(A);
					plunder.row.append(B_optimize);
					plunder.row.append(B);
					plunder.row.append(wallbreaker);
					plunder.row.append(spy);
					plunder.row.append(place);

					script.reports_previewer.create_link($(village).find('a')[0].href, report);
					//this.format_cell_attacks(attacks, $(village).find('img')[0]);
					script.attacks_handler.crete_attack_list(attacks, plunder.village.coords);
					this.format_cell_village(village, plunder);
					this.format_cell_prod_sum(prod_sum, plunder);
					this.format_cell_prod(prod, plunder, plunder.village.buildings.eco);
					this.format_cell_wall(wall, plunder);
					this.format_cell_dist(dist);
					this.format_cell_warning(warning, plunder);
					this.format_cell_optimize(A_optimize, plunder, 'a');
					this.format_cell_optimize(B_optimize, plunder, 'b');
					this.format_cell_spy(spy, plunder, $(place).find('a')[0].href);
					this.format_cell_wallbreaker(wallbreaker, plunder, $(place).find('a')[0].href);

					

					dot.align = 'center';
					loot.align = 'center';
					A.align = 'center';
					B.align = 'center';
					place.align = 'center';
				},
				populate: function () {
					var plunder_table = $('#plunder_list').find('tbody')[0];

					for (plunder of plunder_list) {
						plunder_table.append(plunder.row);
					}

					VillageContext.init();
				},
				refresh_row: function(plunder) {
					var cells = plunder.row.cells;
					var href = $(cells[16]).find('a')[0].href;
					script.gui.plunder_list.format_cell_prod_sum(cells[1], plunder);
					script.gui.plunder_list.format_cell_prod(cells[2], plunder, plunder.village.buildings.eco);
					script.gui.plunder_list.format_cell_wall(cells[3], plunder);
					script.gui.plunder_list.format_cell_warning(cells[9], plunder);
					script.gui.plunder_list.format_cell_optimize(cells[10], plunder, 'a');
					script.gui.plunder_list.format_cell_optimize(cells[12], plunder, 'b');
					script.gui.plunder_list.format_cell_wallbreaker(cells[14], plunder, href);
					script.gui.plunder_list.format_cell_spy(cells[15], plunder, href);
				}
			},
			create_header: function () {
				const div_main = document.createElement('div');
				div_main.style.margin = '5px 5px 10px 5px';

				const forum_topic_link = document.createElement('a');
				forum_topic_link.style.float = 'right';
				forum_topic_link.setAttribute('href', forum_thread_link);
				forum_topic_link.textContent = LOCALE.FORUM_THREAD;
				div_main.append(forum_topic_link);

				const div_img = document.createElement('div');
				div_img.style.float = 'left';
				div_img.style.margin = '0px 5px 0px 0px';
				div_main.append(div_img);

				const img = document.createElement('img');
				img.setAttribute('src', ICONS.MAIN);
				div_img.append(img);

				const div_title = document.createElement('div');
				div_title.style.margin = '0px 0px 0px 10px';
				div_main.append(div_title);

				const title = document.createElement('h1');
				title.style.margin = '0px 0px 5px 0px';
				title.innerText = LOCALE.TITLE;
				div_title.append(title);

				const signature = document.createElement('span');
				signature.innerText = 'by ' + author;
				div_title.append(signature);

				return div_main;
			},
			create_script_description: function () {
				const info_box = document.createElement('div');
				info_box.classList.add('info_box');
				info_box.style.margin = '5px 5px 5px 5px';

				const content = document.createElement('div');
				content.classList.add('content');
				content.innerText = LOCALE.DESCRIPTION;
				info_box.append(content);

				return info_box;
			},
			hide_loot_assistant_UI: function () {
				var divs = $('#content_value div');
				for (div of divs) {
					if (div.style.float == 'right') {
						div.style.display = 'none';
						break;
					}
				}
				$('#content_value h3')[0].style.display = 'none';
				$(base_data.template_form).closest('div.vis')[0].style.display = 'none';
				$('#am_widget_Farm h4')[0].style.display = 'none';
				$('#plunder_list_filters')[0].style.display = 'none';
				$('#plunder_list_nav')[0].style.display = 'none';

				$('#am_widget_Farm .body')[0].lastElementChild.style.display = 'none';

				var c_checkboxes = $('#units_home input');
				for (e of c_checkboxes) {
					e.style.display = 'none';
				}
			},
			create: function () {
				this.hide_loot_assistant_UI();

				const main_div = document.createElement('div');
				main_div.style.margin = '0px 5px 15px 5px';
				main_div.setAttribute('id', namespace);
				main_div.classList.add('vis', 'vis_item');
				$('#content_value')[0].prepend(main_div);

				main_div.append(this.create_header());
				main_div.append(this.create_script_description());

				const templates_panels = document.createElement('div');
				templates_panels.append(this.panels.farm.create());
				templates_panels.append(this.panels.wallbreaker.create());
				main_div.append(templates_panels);

				main_div.append(this.panels.settings.create());

				this.plunder_list.format_header();

				UnitPopup.initLinks();
			},
		},
		game_code_interactions: {
			load_villageDock: async function () {
				villageDock.open();
				await script.utilitys.sleep();
				script.progress_bar.update();
				villageDock.close();
				await script.utilitys.sleep();
				script.progress_bar.update();
			},
			set_tooltips: function () {
				var asdasd = function() { return 'asdasd'; }
				UI.ToolTip($('selector'), { bodyHandler: asdasd});
			},
			override_game_functions: function() {
				CommandPopup.openRallyPoint = function(o) {
					return o = $.extend({
						ajax: "command"
					}, o),
					TribalWars.get("place", o, function(o) {
						Dialog.show("popup_command", o.dialog),
						setTimeout(function() {
							$("#command-data-form").on("submit", CommandPopup.sendTroops),
							$("#command_change_sender").on("click", CommandPopup.SenderSelection.open),
							//////////////////////////////
							// ADDED
							$('#unit_input_spear')[0].focus();
							//////////////////////////////
						})
					}),
					!1
				};
				CommandPopup.confirmSendTroops = function() {
					var d = $("#command-data-form").serializeArray();
					return TribalWars.post("place", {
						ajaxaction: "popup_command"
					}, d, function(o) {
						Dialog.close(),
						UI.SuccessMessage(o.message);
						for (var n = 0; n < CommandPopup.command_sent_hooks.length; n++)
							CommandPopup.command_sent_hooks[n](o);
						//////////////////////////////
						// ADDED
						script.attacks_handler.add_attack(d);
						//////////////////////////////
					}),
					!1
				};
				Accountmanager.farm.sendUnits = function(e, a, t, optimizer = false) {
					var n = Timing.getElapsedTimeSinceLoad();
					if (!(this.last_click && n - this.last_click < 200)) {
						this.last_click = n;
						var r = $(e);
						if (r.hasClass("farm_icon_disabled") || r.data("clickhappy_lock"))
							return !1;
						if (!this.unitsAppearAvailableAB(t))
							return UI.ErrorMessage(_("8c51142762038a5b8e6c677aabcbedff")),
							!1;
						Accountmanager.farm.clickhappyLock(r);
						var i = {
							target: a,
							template_id: t,
							source: game_data.village.id
						};
						//////////// ADDED ////////////
						script.plunders_handler.send_lock();
						//=============================
						return TribalWars.post(Accountmanager.send_units_link, null, i, function(e) {
							//////////// REMOVED ////////////
							// $(".farm_village_" + a).addClass("farm_icon_disabled").addClass("done"),
							//===============================
							Accountmanager.farm.updateOwnUnitsAvailable(e.current_units);
							//////////// ADDED ////////////
							script.attacks_handler.add_farm_attack(i);
							if (optimizer)
								script.optimizer.after_send(r[0])
							else 
								script.plunders_handler.send_unlock(r[0]);
							//=============================
						}, function() {
							var e = $(".report_" + a);
							e.find("*").stop().css({
								height: "",
								"font-size": ""
							}),
							e.show(),
							Accountmanager.farm.no_remove.hasOwnProperty(a) && delete Accountmanager.farm.no_remove[a]
						}),
						Accountmanager.farm.hide_attacked && Accountmanager.farm.updateNonAttacked(a),
						!1
					}
					UI.ErrorMessage(_("9a07c3a91c3f2b7a6a8bc675d1bcb913"))
				};
			}
		},
		main: async function () {
			if (!script.utilitys.screen_check()) return;

			if ($('#' + namespace)[0]) {
				location.reload(true);
				return;
			}

			// TESTING!!!
			//localStorage.removeItem(namespace);
			//

			if (i18e[game_data.locale] != null)
				LOCALE = i18e[game_data.locale];
			else {
				UI.ErrorMessage('Cannot handle this language version of the game. Script needs to be translated first.', 10000);
				return;
			}

			script.progress_bar.init(17, LOCALE.TITLE + ': ' + LOCALE.POPUPS.LOADING);
			await script.data_loader.main_loading();
			script.gui.create();
			script.reports_previewer.init();
			await script.plunders_handler.handle_plunders();
			script.gui.plunder_list.populate();
			Accountmanager.initTooltips();
			script.attacks_handler.init_preview();
			script.game_code_interactions.override_game_functions();
			
			await script.reports_handler.get_reports();
			
			UI.SuccessMessage(LOCALE.TITLE + ': ' + LOCALE.POPUPS.LOADING_FINISHED, 5000);
			console.log(namespace + ': script_data');
			console.log(script_data);
			console.log('all done');
		}
	};

	try { await script.main(); } catch (error) { errorHandler.handle_error(error); }

})(TribalWars);