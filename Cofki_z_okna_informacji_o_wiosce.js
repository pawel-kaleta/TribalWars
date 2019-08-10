javascript:

//	author:		PabloCanaletto
//	version:	1.0
//	history of changes:
//		1.0 - 10.08.2019 by PabloCanaletto
//			first release
//					
//	disclaimer:	You are free to use this script in any way you like and to submit your own changes.
//				I would only appreciate you to leave this notification about my orginal authorship untouched
//				with the whole history of changes.

// FUNCTIONALITY
// This script allows to withdraw units by type from village. To use on village_info tab.


if (document.URL.indexOf("screen=info_village") == -1) {
    UI.InfoMessage('Przejdź do przeglądu informacji o wiosce, aby użyć tego skryptu!', 5000, 'error');
}
else {
    let noStationingTroops = true;

    if ($('#content_value > div > h3').length > 0) {
        if ($('#content_value > div > h3')[0].innerText == "Obrona") {
            let units = game_data.units.filter(u => u !== 'militia');

            let tables = $('table .vis');
            let table = tables[tables.length - 1];

            for (let i = 1; i < table.rows.length; i++) {
                if (table.rows[i].cells[0].innerText != "Z tej wioski:") {
                    if (table.rows[i].cells[14].children[0].innerText === "Cofnij") {
                        let url = table.rows[i].cells[14].children[0].href;
                        url = url.replace("action=all_back", "action=back");
                        for (let j = 0; j < units.length; j++) {
                            let cell$ = $(table.rows[i].cells[j + 1]);
                            let count = Number(cell$.text());
                            if (count !== 0) {
                                noStationingTroops = false;
                                cell$.css('cursor', 'pointer');
                                cell$.css('text-decoration', 'underline');
                                let form_data = {};
                                form_data[units[j]] = count;
                                cell$.on('click', function () {
                                    cell$.off('click');
                                    $.post(url, form_data, (data, status, xhr) => {
                                        cell$.css('cursor', '');
                                        cell$.css('text-decoration', '');
                                        cell$.text('0');
                                        cell$.addClass('hidden');
                                    });
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    if (noStationingTroops == true) {
            UI.InfoMessage('Zdaje się, że nie ma czego wycofać.', 5000);
    }
}
