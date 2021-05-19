// ==UserScript==
// @name         Wykresy TWStats w profilu
// @version      1.1
// @author       domi1948 (adaptacja "pod małpę" PabloCanaletto)
// @match        *://*.plemiona.pl/game.php?*screen=info_player*
// ==/UserScript==

(function() {
    'use strict';

    var app = {
        _config: null,

        load(config) {
            this._config = config;

            // Create available options
            let options = "";
            Object.keys(this._config.stats)
                .forEach((s) => options +=
                         `<option value="${s}">${this._config.stats[s]}</option>`);

            // Load all required elements
            $('#player_info')
                .parent()
                .next()
                .prepend(`
                    <table class="vis" width="100%"> \
                        <tbody>
                            <tr>
                                <th colspan="2">
                                    <span style="padding-top: 20px; vertical-align: middle;">Statystyki gracza</span>

                                    <select id="change-stats" class="float_right">${options}</select>
                                </th>
                           </tr>
                           <tr>
                               <td colspan="2" align="center">
                                   <img id="profile-stats-img" src="${this.getImage("points")}" alt="Obraz">
                               </td>
                           </tr>
                       </tbody>
                   </table>
                `);

            $("#change-stats")
                .on('change', (e) => {
                let stat = $(e.delegateTarget)
                .val();

                $('#profile-stats-img')
                    .attr("src", app.getImage(stat));
            });
        },

        getImage(stat) {
            let id = game_data.player.id;
            let params = window.location.href
            .split('?')[1]
            .split('#')[0]
            .split('&')
            .forEach((e) => {
                if (e.includes("id")) {
                    id = e.split('=')[1];
                }
            });


            let url = this._config.server
            .replace("{world}", game_data.world)
            .replace("{graph_type}", stat)
            .replace("{player_id}", id);

            return url;
        }
    };

    app.load({
        server: "http://pl.twstats.com/{world}/image.php?type=playergraph&graph={graph_type}&id={player_id}",
        stats: {
            "points": "Punkty",
            "villages": "Wioski",
            "od": "Pokonani",
            "oda": "Pokonani w ataku",
            "odd": "Pokonani w obronie",
            "rank": "Ranking"
        }
    });
})();
