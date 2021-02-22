// ==UserScript==
// @name         Wspierane wioski
// @version      1.0.0
// @author       PabloCanaletto
// @match        https://*.plemiona.pl/game.php?*screen=overview_villages&mode=units&type=away_detail&filter_villages=1
// ==/UserScript==

(function() {
    'use strict';

	var Script = {
		settings: {
			unit_types_number: $('#units_table thead th').length - 5
		},
		data: {
			world_info: {},
			senders: [
				/*{
					label: {},
					id: ""
				}*/
			],
			receivers: [
				/*{
					label: {},
					id: "",
					supports_sum: [],
					supports: [{
						sender: {},
						troops: [{}],
						checbox: {},
						distance: 0
					}]
				}*/
			]
		},
		load_data: function () {
			var rows = $('#units_table tbody tr:not(:last-child)');

			var senders = this.data.senders;
			var receivers = this.data.receivers;
			var sender;
    		var row;

			for(let i=0; i<rows.length; i++) {
				row = rows[i];
				let row_label = $(row.cells[0]).find('span')[0];
				if(row.className.indexOf('units_away') != -1) {
					sender = senders.push({
						label: row_label,
						id: row_label.dataset.id
					}) - 1;
				}
				else {
					let input = $(row_label).find('input')[0];
					input.remove();
					let village_id = $(row_label).find('span')[0].dataset.id;

					let receiver;
					for (let j=0; j<receivers.length; j++) {
						if (receivers[j].id == village_id) {
							receiver = receivers[j];
							break;
						}
					}
					if (!receiver) {
						let l = receivers.push({
							label: row_label,
							id: village_id,
							supports_sum: [],
							supports: []
						});
						receiver = receivers[l-1];
						for (let j=0; j<this.settings.unit_types_number; j++) {
							receiver.supports_sum.push(0);
						}
					}

					let units = [];

					for (let j=0; j<this.settings.unit_types_number; j++) {
						units.push(row.cells[j+2]);
						receiver.supports_sum[j] += Number(units[j].innerText);
					}
					console.log('');

					receiver.supports.push({
						sender: senders[sender],
						troops: units,
						checbox: input,
						distance: row.cells[1].innerText
					});	
				}

				row.remove();
			}
		},
		create_table: function () {
			$('#units_table thead th')[2].innerText = $('#units_table thead th')[2].innerText.split(' ')[0];

			var senders = this.data.senders;
			var receivers = this.data.receivers;

			var node = $('#units_table tbody')[0];

			for (let i=0; i<receivers.length; i++) {
				const spacer = document.createElement('tr');
				node.prepend(spacer);

				const receiver_row = document.createElement('tr');
				receiver_row.classList.add('row_a');

				const village_td = document.createElement('th');
				village_td.append(receivers[i].label);
				receiver_row.append(village_td);

				receiver_row.append(document.createElement('th'));

				for (let j=0; j<receivers[i].supports_sum.length; j++) {
					const sum_td = document.createElement('th');
					sum_td.classList.add('unit-item');
					if (receivers[i].supports_sum[j] == 0) {
						sum_td.classList.add('hidden');
					}
					sum_td.innerText = receivers[i].supports_sum[j];
					receiver_row.append(sum_td);
				}
				spacer.after(receiver_row);

				for (let j=0; j<receivers[i].supports.length; j++) {
					const sender_row = document.createElement('tr');

					if (j%2==0) {
						sender_row.classList.add('row_b');
					} else {
						sender_row.classList.add('row_a');
					}
					

					const sender_td = document.createElement('td');
					sender_td.style['padding-left'] = '20px';
					sender_td.append(receivers[i].supports[j].checbox);
					sender_td.append(receivers[i].supports[j].sender.label.cloneNode(true));
					$(sender_td).find('.rename-icon')[0].remove();
					sender_row.append(sender_td);

					const distance_td = document.createElement('td');
					distance_td.innerText = receivers[i].supports[j].distance;
					sender_row.append(distance_td);

					for (let k=0; k<receivers[i].supports[j].troops.length; k++) {
						sender_row.append(receivers[i].supports[j].troops[k]);
					}

					receiver_row.after(sender_row);
				}
			}
	
		},
		main: function () {
			//screen=overview_villages&mode=units&type=away_detail&filter_villages=1
			if (document.URL.indexOf("screen=overview_villages") == -1  ||  document.URL.indexOf("mode=units") == -1  ||  document.URL.indexOf("type=away_detail") == -1) {
				UI.ErrorMessage('Uruchom skrypt w zak\u0142adce Przegl\u0105dy > Wojska > Pomoc.', 10000);
				return;
			}
			if (document.URL.indexOf("filter_villages=1") == -1) {
				UI.ErrorMessage('Najpierw zaznacz "Ukryj puste wpisy".', 10000);
				return;
			}

			this.load_data();
			this.create_table();

			var node = $('#units_table script')[0];
		}
	}
	
	Script.main();
})();
