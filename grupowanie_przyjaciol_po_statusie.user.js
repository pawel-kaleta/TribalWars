// ==UserScript==
// @name         Lista znajomych - grupowanie po statusach online
// @namespace    http://hermitowski.org/
// @version      42
// @description  Przesuwa graczy ze statusem online na początek listy
// @author       Hermitowski
// @include      https://pl*.plemiona.pl/game.php?*screen=buddies
// ==/UserScript==

(function() {
  let rows = $('.content-border').find('.vis')[1].rows;
  let switching = true;

  while (switching) {
    switching = false;
	let i = rows.length - 2;
    for (; i >= 0; i--) {
      let x = rows[i + 0].cells[2].children[0].getAttribute('title');
      let y = rows[i + 1].cells[2].children[0].getAttribute('title');
      if (y == 'online' && x == 'offline') { switching = true; break; }
    }
    if (switching) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
    }
  }

})();
