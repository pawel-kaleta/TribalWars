// ==UserScript==
// @name         Ilość ataków zamiast toporka w Asystencie Farmera
// @version      1.0
// @author       Filip Klich
// @include      *plemiona.pl/game.php?*screen=am_farm*
// ==/UserScript==
//LICENCJA       FREE SOFTWARE - drogi Supporcie <3 wyrażam zgodę na użytkowanie i publikowanie tego skryptu przez każdą osobę

var rows = $("tr[id^=\"village_\"]");
for(var i = 0; i < rows.length; i++) {
    var z=$("tr[id^=\"village_\"]")[i].getElementsByTagName("td")[3].getElementsByTagName("img")[0];
    if (z !== undefined) {
        var event = new MouseEvent('mouseover');
        z.dispatchEvent(event);
        z.remove();
        var attacks = document.createElement("a");
        attacks.innerText = ". " + $("#tooltip")[0].innerText.split(" ")[0];
        $("tr[id^=\"village_\"]")[i].getElementsByTagName("td")[3].appendChild(attacks);
    }
}
