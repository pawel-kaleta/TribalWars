// ==UserScript==
// @name       		Wykres z punktami na mapie
// @version    		1.0
// @description		This script displays points graph of an owner player in a willage popup window on a map.
// @author     		PabloCanaletto
// @match      		https://*.plemiona.pl/game.php?*screen=map*
// ==/UserScript==

(function() {
    'use strict';

    function addGraph(id) {
		$("#info_content > tbody").append(`
			<tr>
				<td align="center">
					<img id="profile-stats-img" src="http://pl.twstats.com/` + game_data.world + `/image.php?type=playergraph&graph=points&id=` + id + `" alt="Obraz">
				</td>
			</tr>
		`);
	};

	TWMap.popup.displayForVillage = function(e, a, t) {
        if (this._currentVillage == e.id) {
            var i = TWMap.players[e.owner]
			, o = {
                bonus: null,
                type: e.type,
                name: e.name,
                x: a,
                y: t,
                continent: TWMap.con.continentByXY(a, t),
                points: e.points,
                owner: null,
                owner_image: null,
                newbie: null,
                ally: null,
                ally_image: null,
				extra: null,
				special: null,
				units: [],
				units_display: {}
			};
			if (e.hasOwnProperty("special") && (o.special = e.special),
			e.bonus_id && (o.bonus = {
				text: TWMap.bonus_data[e.bonus_id].text,
				img: TWMap.bonus_data[e.bonus_id].image
			}),
			i) {
				o.owner = i,
				i.newbie && e.owner != game_data.player.id && (o.owner.newbie_time = i.newbie),
				i.image_id && i.image_id > 0 && (o.owner_image = Format.userImageThumbURL(i.image_id));
				var n = TWMap.allies[i.ally];
				n && (o.ally = n,
				n.image_id && n.image_id > 0 && (o.ally_image = Format.userImageThumbURL(n.image_id)))
			}
			if (this.extraInfo && TWMap.popup.popupOptionsSet()) {
				var s = this._cache[e.id];
				if (void 0 === s && e.id)
					this.loadVillage(e.id),
					o.extra = !1;
				else if ("object" == typeof s) {
					var p = {
						total: $("#map_popup_units").is(":checked"),
						home: $("#map_popup_units_home").is(":checked"),
						time: $("#map_popup_units_times").is(":checked")
					};
					if (o.units_display.count = !1,
					o.units_display.time = p.time && s.id != TWMap.currentVillage,
					p.total || p.home || p.time)
						for (var l in s.units)
							if (s.units.hasOwnProperty(l)) {
								var r = parseInt(s.units[l].count.home) + parseInt(s.units[l].count.foreign)
								  , c = p.total && 0 != r;
								if (c || p.time && s.units[l].time) {
									var m = "";
									c && (m = r,
									p.home && 0 != s.units[l].count.home && (m += '<br/><span class="unit_count_home">(' + s.units[l].count.home + ")</span>"),
									o.units_display.count = p.total),
									o.units.push({
										name: l,
										image: s.units[l].image,
										time: s.units[l].time,
										count: m
									})
								}
							}
					o.extra = s
				}
			}
			$("#map_popup").html(jstpl("tpl_popup", o)),
			addGraph(e.owner);
			this.calcPos(),
			this.initTimers()
		}
	};
    
})();