// ==UserScript==
// @name         Farma z raportu
// @version      1.0
// @author       PabloCanaletto
// @match        https://*.plemiona.pl/game.php?*screen=report*view=*
// ==/UserScript==

(function() {
    'use strict';


    var pr_lk;
    var pr_sw;

    function income(level) {
        return 25.807 * Math.pow(Math.E, 0.1511*level);
    }

    function storage(level) {
        return 813.35 * Math.pow(Math.E, 0.2066*level);
    }

    function hiding(level) {
        return 112.51 * Math.pow(Math.E, 0.2878*level);

    }

    function main() {
        var wc;
        $.ajax({
            async: false,
            url: 'https://' + window.location.host + '/interface.php?func=get_config',
            dataType: 'xml',
            cashe: true,
            success: function(response){wc=response;}
        });

        pr_sw = Number($(wc).find("config speed").text());
        pr_lk = Number($(wc).find("config unit_speed").text());
        pr_lk = 10/(pr_lk*pr_sw);

        var resources = [0,0,0];
        var spy_resources_text = document.querySelector('#attack_spy_resources');
        if (spy_resources_text === null) {
            return;
        }
        spy_resources_text = spy_resources_text.rows[0].cells[1].innerText;
        var spy_resources;

        if( spy_resources_text != "nie ma") {
            spy_resources = spy_resources_text.split(' ').map(x => Number(x.replace('.','')));
            for(let i=0; i<spy_resources.length; i++) {
                resources[i] += spy_resources[i];
            }
        }

        var link = document.querySelector('#attack_info_def > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2) > span:nth-child(1) > a:nth-child(1)');
        var coords = link.innerText.match(/\d+\|\d+/).pop().split('|');
        var a = game_data.village.x - coords[0];
        var b = game_data.village.y - coords[1];
        var distance = Math.sqrt(a*a + b*b);

        var nowTime = document.getElementById("serverTime").innerText.split(':').map(x => Number(x));
        var thenTime = document.querySelector('.nopad :nth-child(2) > :nth-child(1) > :nth-child(2) > :nth-child(2)').innerText.split(' ')[1].split(':').map(x => Number(x));

        var period = {
            0: nowTime[0] - thenTime[0],
            1: nowTime[1] - thenTime[1],
            2: nowTime[2] - thenTime[2]
        };

        var time = period[0] + period[1]/60 + period[2]/3600;
        if(time < 0) { time += 24; }
        time += distance * pr_lk / 60;

        if (document.getElementById("attack_spy_building_data") === null) {
            return;
        }
        var buildings = JSON.parse(document.getElementById("attack_spy_building_data").value);
        for (let i=0; i<buildings.length; i++) {
            if (buildings[i].id == "wood")	{resources[0] += time * income(Number(buildings[i].level)) * pr_sw; continue;}
            if (buildings[i].id == "stone")	{resources[1] += time * income(Number(buildings[i].level)) * pr_sw; continue;}
            if (buildings[i].id == "iron")	{resources[2] += time * income(Number(buildings[i].level)) * pr_sw; continue;}
        }
        var max_sur=0;
        for (let i=0; i<buildings.length; i++) {
            if (buildings[i].id == "storage" ) {
                max_sur += storage(buildings[i].level);
            }
            if (buildings[i].id == "hide" ) {
                max_sur -= hiding(buildings[i].level);
            }
        }
        if (max_sur < resources[0]) { resources[0] = max_sur; }
        if (max_sur < resources[1]) { resources[1] = max_sur; }
        if (max_sur < resources[2]) { resources[2] = max_sur; }
        var resources_sum = resources[0] + resources[1] + resources[2];

        var lk_num = Math.floor(resources_sum/80);

        var fake_limit = Number($(wc).find("config game fake_limit").text());
        fake_limit = Math.floor(game_data.village.points * fake_limit/100);

        while(2 + (4*lk_num) < fake_limit) {
            lk_num++;
        }

        var div = document.querySelector("#content_value > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(3) > td > div.no-preview");

        var hr = document.createElement('hr');
        div.prepend(hr);

        var new_link = document.createElement('a');
        new_link.innerText = "» ATAK FARMIĄCY";
        new_link.href = TribalWars.buildURL('GET', 'place', {village: game_data.village.id, x: coords[0], y: coords[1], from: 'simulator', light: lk_num, spy: 1 });
        div.prepend(new_link);
    }

    main();

})();
