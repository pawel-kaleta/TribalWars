// ==UserScript==
// @name         Tabela produkcji
// @version      1.0
// @description  try to take over the world!
// @author       PabloCanaletto
// @match        https://*.plemiona.pl/game.php?*screen=overview_villages*mode=prod*
// ==/UserScript==

(function() {
    'use strict';
    var table = $('#production_table')[0];
    table.rows[0].cells[8].innerHTML = '';
    var smith_img = new Image();
    smith_img.src = 'https://pl153.plemiona.pl/graphic/buildings/smith.png';
    table.rows[0].cells[8].appendChild(smith_img);
    var buildings = ['barracks', 'stable', 'garage', 'statue', 'snob'];
    var units = ['spear', 'sword', 'axe', 'archer', 'spy', 'light', 'heavy', 'marcher', 'ram', 'catapult', 'knight', 'snob'];
    var building_from_unit = [0,0,0,0,1,1,1,1,2,2,3,4];
    var link = 'https://pl153.plemiona.pl/graphic/buildings/';
    var start_length = table.rows[0].cells.length;
    for(let i=0; i<buildings.length; i++) {
        table.rows[0].insertCell(table.rows[0].cells.length).outerHTML = '<th></th>';
        let image = new Image();
        image.src = link + buildings[i] + '.png';
        table.rows[0].cells[start_length + i].appendChild(image);
    }

    for(let i=1; i<table.rows.length; i++) {
        for(let j=0; j<buildings.length; j++) {
            table.rows[i].insertCell().innerHTML = '<ul class="order_queue"></ul>';
        }
        var tech = $(table.rows[i].cells[8]).find('img');
        if (tech.length>0) {
            var title = tech.last()[0].title;
            title = title.split(' - ')[1];
            tech.first().before(title + '<br>');
        }

        var orders = $(table.rows[i]).find('.order');
        if(orders.length>0) {
            for(let j=0; j<orders.length; j++) {
                var unit_img_url = $(orders[j]).find('img')[0].src;
                for(var k=0; k<units.length; k++) {
                    if(unit_img_url.indexOf(units[k]) != -1) {
                        var order = orders[j];
                        $(table.rows[i].cells[building_from_unit[k] + start_length]).find('ul')[0].appendChild(order);
                        break;
                    }
                }
            }
        }
        for(let j=0; j<buildings.length; j++) {
            var asd = $(table.rows[i].cells[j + start_length]).find('img');
            if(asd.length > 0){
                var title = asd.last()[0].title;
                title = title.split(' - ')[2];
                asd.first().closest('ul').before(title + '<br>');
            }
        }
    }

    $(table).find("th:nth-child(10), td:nth-child(10)").remove();
})();
