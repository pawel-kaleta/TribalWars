// ==UserScript==
// @name         Wypełnianie pól wiadomości
// @version      1.0
// @author       PabloCanaletto
// @match        *://*.plemiona.pl/game.php?*screen=mail*mode=new*
// ==/UserScript==

(function() {
    'use strict';

    var TEMAT = 'AKCJA na 15.01';
    var TEMPLATKA = `
JEDZIEMY Z KOKSEM

Wszcy ślemy ataki, jest zajebiście, wygrywamy.

Elo benc.
`;


    document.querySelector("#form > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type=text]").value = TEMAT;;
    document.querySelector("#message").value = TEMPLATKA;
})();
