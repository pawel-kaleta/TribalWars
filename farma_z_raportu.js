javascript:
//	name:		Farma z Raportu
//	version:	1.0.0
//	author:	PabloCanaletto
//	APIs:		HermitowskiePlikiMapy by Hermitowski
//	change log:	1.0.0 - 15.12.2019 - initial release - by PabloCanaletto

(async function (TribalWars) {
    const namespace = 'Farma z raportu';
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
        init: async function () {
			if($('#attack_spy_resources')[0] == null || $('#attack_spy_building_data')[0] == null) {
				throw 'Raport nie posiada potrzebnych informacji szpiegowskich o wiosce.';
			}
			
            const settings = {
                configs: ['config']
            }
            const config = await get_world_info(settings);
			
			function income(level) { return 25.807 * Math.pow(Math.E, 0.1511 * level) }
			function storage(level) { return 813.35 * Math.pow(Math.E, 0.2066 * level) }
			function distance(coord_a, coord_b) {
				a = coord_a.split('|').map(x => Number(x));
				b = coord_b.split('|').map(x => Number(x));
				
				return Math.sqrt(Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2));
			}
			
			var resources = [0,0,0];
			var spy_resources;
			
			var spy_resources_text = $('#attack_spy_resources')[0].rows[0].cells[1].innerText;
			
			if( spy_resources_text != 'nie ma') {
				spy_resources = spy_resources_text.split(' ').map(x => Number(x.replace('.','')));
				if (spy_resources.length > 3) { 
					console.log('B\u{142}\u{105}d - B\u{17A}le wczytano surowce:');
					console.log(spy_resources_text);
					console.log(spy_resources);
					throw '\u{179}le wczytano surowce. Po wi\u{119}cej informacji zajrzyj do konsoli.';
				}
				else {
					for(var i=0; i<spy_resources.length; i++) {
						resources[i] = spy_resources[i];
					}
				}
			}
			
			var farm_coord = $('#attack_info_def > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > span:nth-child(1) > a:nth-child(1)')[0].innerHTML.match(/\d+\|\d+/).pop();
			
			var nowTime = $('#serverTime')[0].innerText.split(':').map(x => Number(x));
			var thenTime = $('.nopad :nth-child(2) > :nth-child(1) > :nth-child(2) > :nth-child(2)')[0].innerText.split(' ')[1].split(':').map(x => Number(x));
			var period = { 
				0: nowTime[0] - thenTime[0],
				1: nowTime[1] - thenTime[1],
				2: nowTime[2] - thenTime[2]
			};
			
			var time = period[0] + period[1]/60 + period[2]/3600;
			if(time < 0) { time += 24; }
			if(time < 0) { throw 'Min\u{119}\u{142}o ponad 24h. Skrypt nie uwzgl\u{119}dnia daty raportu!'; }
			time += distance(farm_coord, game_data.village.coord) * 10 * config.config.speed * config.config.unit_speed / 60;
			
			const buildings = JSON.parse($('#attack_spy_building_data')[0].value);
			
			var max_sur;
			for (var i=0; i<buildings.length; i++) {
				if (buildings[i].id == 'wood')		{ resources[0] += time * income(Number(buildings[i].level)) * config.config.speed; continue; }
				if (buildings[i].id == 'stone')		{ resources[1] += time * income(Number(buildings[i].level)) * config.config.speed; continue; }
				if (buildings[i].id == 'iron')		{ resources[2] += time * income(Number(buildings[i].level)) * config.config.speed; continue; }
				if (buildings[i].id == 'storage' )	{ max_sur = storage(buildings[i].level); continue; }
			}

			if (max_sur < resources[0]) { resources[0] = max_sur; }
			if (max_sur < resources[1]) { resources[1] = max_sur; }
			if (max_sur < resources[2]) { resources[2] = max_sur; }

			var resources_sum = resources[0] + resources[1] + resources[2];
			var light_num = Math.floor(resources_sum / 80);
					
			window.open(TribalWars.buildURL('GET', 'place', { village: game_data.village.id, x: farm_coord.split('|')[0], y: farm_coord.split('|')[1], from: 'simulator', light: light_num, spy: 1 }));
        },
        main: async function () {
			if(game_data.screen !== 'report') {
				Helper.handle_error('Nie jesteś w raporcie!');
				return;
			}
			
            $.ajax({
                url: 'https://media.innogamescdn.com/com_DS_PL/skrypty/HermitowskiePlikiMapy.js?_=' + ~~(Date.now() / 9e6),
                dataType: 'script',
                cache: true
            }).then(() => {
                Script.init().catch(Helper.handle_error);
            });
        }
    };
    try { await Script.main(); } catch (ex) { Helper.handle_error(ex); }
})(TribalWars);