javascript:

//	author:		PabloCanaletto
//	version:	1.0
//	history of changes:
//		1.0 - 25.07.2019 by PabloCanaletto
//			first release
//					
//	disclaimer:	You are free to use this script in any way you like and to submit your own changes.
//				I would only appreciate you to leave this notification about my orginal authorship untouched
//				with the whole history of changes.

// FUNCTIONALITY
// This script helps with distributing resources between villages.

// USAGE
// You start in overviews -> production tab, where you use script initially to prepare plan of transports.
// Then you follow three steps in a loop:
// 1. use script to prepare transports
// 2. press enter to send resources
// 3. use script to jump to next village


var settings = {
    resourcesSafeguard: [75000, 75000, 75000],          // zabezpieczenie w surowcach, wypełniane priorytetowo
    resourcesFillTo: [125000, 125000, 125000],          // wypełniaj do tej wartości
    tradersSafeguard: 0,                                // zabezpieczenie w kupcach
    considerOngoingTransports: true,                    // uwzględnij przychodzące transporty (tak - true, nie - false)
    sendSurplusToCoinFlags: false,                      // poślij nadwyżki do wiosek z flagami na monety (tak - true, nie - false)
    resourcesSurplus: [150000, 150000, 150000],         // poziom, od którego jest nadwyżka
    overFlowThreshold: 75,                              // % pojemności spichlerza, powyżej którego zapobiegaj przelewaniu się
    extendedOptimization: true,                         // czy optymalizacja może generować dodatkowych odbiorców (więcej klikania)
    resourcesTransportBuffer: [76000, 76000, 76000]     // poziom, od którego wioska może stać się pośrednikiem w transporcie
    // zachowaj!
    // resourcesSafeguard < resourcesTransportBuffer < resourcesFillTo < resourcesSurplus
};


var requestFlags = {
    flags: true,
    ongoingTransports: true
};  // flagi asynchronicznego pobierania danych; trwa - false, zakończone - true

var villages;
var transportsSafeguard;
var transportsFillTo;
var transportsToCoinVillages;
var transportsOverFlow;
var allTransports;

function isPlanReady() { 
    // czy jesteśmy w centrum dowodzenia tj. chcemy zrobić nowy plan?
    if (document.URL.indexOf("overview_villages") != -1 && document.URL.indexOf("prod") != -1) {
        localStorage.removeItem("transports");
        return false;
    }
    else {
        allTransports = JSON.parse(localStorage.getItem("transports")); // odczytanie z pamięci listy transportów
        // czy odczyt udał się (czy było co odczytać)?
        if (allTransports === null) { return false; }
        else { return true; }
    }
}

if (isPlanReady() === true) {
    // czy chcemy wykonać plan?
    if (document.URL.indexOf("market") == -1 || document.URL.indexOf("call") == -1) {
        UI.InfoMessage('Surowce wzywa się na rynku! Przejdź na rynek do zakładki wezwij.', 5000, 'error');
    }
    else {
        // wykonanie planu

        // czy musimy zmienić wioskę
        if (game_data.village.id != allTransports[0].villageID[1]) {
            var split = document.URL.indexOf("?") + 1;
            location = document.URL.substring(0, split) + "village=" + allTransports[0].villageID[1] + "&screen=market&mode=call";
        }
        else {
            var reseavingID = allTransports[0].villageID[1];

            input = $("#village_list tbody tr td input");

            // przygotuj i usuń z planu każdy transport tyczący się tej wioski
            while (allTransports[0] != null && allTransports[0].villageID[1] == reseavingID) {
                var sendingID = allTransports[0].villageID[0];
                var index = 0;
                for (var i = 0; i < input.length; i++) {
                    if (input[i].class = "checkbox" && input[i].value == sendingID) {
                        index = i;
                        break;
                    }
                }
                $(input[index]).trigger('click');
                $(input[index - 1]).val(allTransports[0].resources[2]);
                $(input[index - 2]).val(allTransports[0].resources[1]);
                $(input[index - 3]).val(allTransports[0].resources[0]);

                allTransports.shift();
            }

            // ustaw focus na przycisk wezwij surowce
            var button = document.getElementsByClassName("btn")[0];
            button.focus();

            // czy są jeszcze jakieś transporty w planie
            if (allTransports.length > 0) {
                // nadpisz w pamięci stary plan nowym (zredukowanym o transporty przygotowane do wysyłki)
                var allTransportsJSON = JSON.stringify(allTransports);
                localStorage.setItem("transports", allTransportsJSON);
                UI.SuccessMessage('Transpory przygotowane i usunięte z planu. Pozostało ' + allTransports.length + ' transportów.', 10000);
            }
            else {
                // usuń z pamięci plan
                localStorage.removeItem("transports");
                UI.SuccessMessage('To już ostatnie transporty!', 10000);
            }
        }
    }
}
else {
    // czy jesteśmy w centrum dowodzenia?
    if (document.URL.indexOf("overview_villages") == -1 || document.URL.indexOf("prod") == -1) {
        UI.InfoMessage('Przejdź do przeglądu produkcji, aby użyć tego skryptu!', 5000, 'error');
    }
    else {
        // stworzenie planu
        UI.SuccessMessage('Wczytuję dane...', 10000);

        // wczytanie danych
        acquireVillagesData();

        // jeśli nie doczytujemy asynchronicznie danych z innych stron, to od razu przechodzimy do wykonania planu
        if (settings.considerOngoingTransports == false && settings.sendSurplusToCoinFlags == false) {
            createPlan();
        }
    }
}

// wczytywanie danych
function acquireVillagesData() {
    villages = new Array();

    // wczytanie danych z tabeli w przeglądzie produkcji
    var table = document.querySelector('#production_table');
    for (var i = 1; i < table.rows.length; i++) {
        var inner;
        var start;
        var end;

        inner = table.rows[i].cells[1].innerHTML;

        // wczytanie koordów wioski
        start = inner.indexOf("(");
        end = inner.indexOf(")", start);
        var coords = inner.substring(start + 1, end).split("|");

        // wczytanie ID wioski
        start = inner.indexOf("data-id=");
        end = inner.indexOf(">", start);
        var id = inner.substring(start + 9, end - 1);

        // wczytanie punktów wioski
        var points = table.rows[i].cells[2].innerText.replace('.', '');

        // wczytanie surowców wioski
        var resources = [0, 0, 0];
        table.rows[i].cells[3].innerText.split(" ").map(x => Number(x.replace('.', ''))).forEach((x, i) => {
            resources[i] += x;
        });

        // wczytanie pojemności spichlerza, kupców i zagrody
        var granary = table.rows[i].cells[4].innerText;
        var traders = table.rows[i].cells[5].innerText.split("/");
        var farm = table.rows[i].cells[6].innerText.split("/");

        // stworzenie wioski w pamięci i zainicjowanie jej wczytanymi danymi
        villages.push(new village(id, coords, points, resources, granary, traders, farm));
    }

    // ew. wczytanie trwających transportów
    if (settings.considerOngoingTransports) {
        requestFlags.ongoingTransports = false; // ustawienie flagi wczytywania na "trwające"

        let request = new XMLHttpRequest(); // utworzenie obiektu do pobrania strony
        let link = document.URL.substring(0, document.URL.indexOf("?")) + "?screen=overview_villages&mode=trader&type=inc";

        // co zrobimy gdy cos pójdzie nie tak?
        function requestTransportsError() {
            UI.InfoMessage('Nie udało się pobrać danych o trwających transportach.', 5000, 'error');
        } 
        request.ontimeout = requestTransportsError;
        request.onerror = requestTransportsError;

        // co zrobimy jak dostaniemy odpowiedź
        request.onload = function () {
            // czy połączenie zakończyło się powodzeniem (dane są gotowe do odczytu)?
            if (request.status === 200) {
                // wyciągnięcie z odpowiedzi od serwera tabeli z transportami
                let requestedBody = document.createElement("body");
                requestedBody.innerHTML = request.responseText;
                let requestTable = $(requestedBody).find('#trades_table').get()[0];

                // czy tabela istnieje? (może nie istnieć np. kiedy brak wiosek w aktywnej grupie)
                if (requestTable) {
                    // wczytanie danych o każdym transporcie
                    for (var i = 1; i < requestTable.rows.length; i++) {
                        var inner;
                        var start;
                        var end;

                        // ID wioski przyjmującej surowce
                        inner = requestTable.rows[i].cells[3].innerHTML;
                        start = inner.indexOf("id=");
                        end = inner.indexOf('">', start);
                        var id = inner.substring(start + 3, end);

                        // wszystkie rodzaje surowców są w jednej komórce
                        inner = requestTable.rows[i].cells[7].getElementsByClassName("nowrap");

                        // odczytujemy każdy z osobna
                        for (var j = 0; j < inner.length; j++) {
                            // ilość surowca danego typu
                            var res = Number(inner[j].innerText.replace('.', ''));

                            // co to za typ?
                            var icon = inner[j].getElementsByClassName("icon header")[0];
                            var index = -1;
                            if (icon.title == "Drewno") { index = 0; }
                            if (icon.title == "Glina") { index = 1; }
                            if (icon.title == "Żelazo") { index = 2; }

                            // znalezienie wioski przyjmującej surowce
                            for (var k = 0; k < villages.length; k++) {
                                if (villages[k].id == id) {
                                    // przypisanie do niej transportu
                                    villages[k].commingResources[index] += res;
                                    break;
                                }
                            }
                        }
                    }
                    requestFlags.ongoingTransports = true; // ustawienie flagi pobierania na skończone
                    checkRequestFlags(); // sprawdzenie stanów pobierania
                }
                else {
                    var start = requestedBody.innerHTML.indexOf("Twoi kupcy przybywający:");
                    var commingTraders = requestedBody.innerHTML.substring(start + 25, start + 26);
                    if (commingTraders == '0') {
                        requestFlags.ongoingTransports = true; // ustawienie flagi pobierania na skończone
                        checkRequestFlags(); // sprawdzenie stanów pobierania
                    }
                    else {
                        UI.InfoMessage('Coś poszło nie tak. Tabela transportów nie istnieje!', 5000, 'error');
                    }
                }
            }
            else {
                    requestTransportsError();
            }
        }

        request.open('GET', link, true); // otwieramy połączenie
        request.timeout = 5000; // ustalamy czas, po którym uznamy, że coś poszło nie tak

        request.send(null); // wysyłamy żądanie na serwer
    }

    // ew. wczytanie flag (bonusów)
    if (settings.sendSurplusToCoinFlags) {
        requestFlags.flags = false; // ustawienie flagi wczytywania na "trwające"

        // obsługa połączenia analogiczna do pobrania transportów
        let request = new XMLHttpRequest();
        let link = document.URL.substring(0, document.URL.indexOf("?")) + "?screen=overview_villages&mode=tech";

        function requestFlagsError() {
            UI.InfoMessage('Nie udało się pobrać danych o flagach.', 5000, 'error');
        }
        request.onerror = requestFlagsError;
        request.ontimeout = requestFlagsError;

        request.onload = function () {
            if (request.status == 200) {
                let requestedBody = document.createElement("body");
                requestedBody.innerHTML = request.responseText;
                let requestTable = $(requestedBody).find('#techs_table').get()[0];
                if (requestTable) {
                    // wczytanie danych o fladze w każdej wiosce
                    for (var i = 1; i < requestTable.rows.length; i++) {
                        let flag_info = requestTable.rows[i].cells[13]; // komórka tabeli, w której są informacje o fladze
                        var inner = flag_info.innerText; // tekst wewnątrz tej komórki
                        // czy mamy do czynienia z flagą do monet?
                        if (inner.indexOf("Koszt monet") != -1) {
                            // wyciągnięcie wartości bonusu
                            var start = inner.indexOf("-");
                            var end = inner.indexOf("%");
                            var flagValueString = inner.substring(start + 1, end);

                            // wyciągnięcie id wioski, która ma tą fagę
                            var villageID = flag_info.id.substring(10);

                            // znalezienie wioski o takim id
                            for (var j = 0; j < villages.length; j++) {
                                if (villages[j].id == Number(villageID)) {
                                    //przypisanie jej flagi
                                    villages[j].flag = Number(flagValueString);
                                    break;
                                }
                            }
                        }
                    }
                    requestFlags.flags = true; // ustawienie flagi pobierania na "skończone"
                    checkRequestFlags(); // sprawdzenie stanów pobierania
                }
                else {
                        UI.InfoMessage('Coś poszło nie tak. Tabela technologii nie istnieje!', 5000, 'error');
                    }
            }
            else {
                requestFlagsError();
            }
        }
        
        request.open('GET', link, true);
        request.timeout = 5000;

        request.send(null);
    }
}
function checkRequestFlags() {
    // czy wszystkie pobierania zakończyły się
    if (requestFlags.flags && requestFlags.ongoingTransports) {
        createPlan(); //stwórzmy plan transportów do wykonania
    } 
}

// główne heurystyki tworzące transporty w ramach realizacji celów z ustawień
function provideResourcesSafeguard() {
    transportsSafeguard = new Array();
    let villagesWithShortage = [new Array(), new Array(), new Array()];
    let villagesWithSurplus = [new Array(), new Array(), new Array()];

    // rozpoznaj brakujące i wolne surowce, i - typ surowca
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < villages.length; j++) {
            if (villages[j].resources[i] + villages[j].commingResources[i] < settings.resourcesSafeguard[i]) {
                villagesWithShortage[i].push(villages[j]);
            }
            else {
                if (villages[j].resources[i] > settings.resourcesSafeguard[i] && villages[j].traders[0] > settings.tradersSafeguard) {
                    villagesWithSurplus[i].push(villages[j]);
                }
            }
        }
        sortVillagesByResource(villagesWithShortage[i], i);
    }

    // przygotuj transporty, i - typ surowca
    for (var i = 0; i < 3; i++) {
        while (villagesWithShortage[i].length > 0 && villagesWithSurplus[i].length > 0) {
            var lackingResource = settings.resourcesSafeguard[i];
            if (villagesWithShortage[i][0].granary < settings.resourcesSafeguard[i]) {
                lackingResource = villagesWithShortage[i][0].granary * 0.9;
            }
            lackingResource -= (villagesWithShortage[i][0].resources[i] + villagesWithShortage[i][0].commingResources[i]);

            while (lackingResource >= 1000 && villagesWithSurplus[i].length > 0) {
                var index = indexOf_closestVillage(villagesWithShortage[i][0], villagesWithSurplus[i]);

                var resourcesSurplus = villagesWithSurplus[i][index].resources[i] - settings.resourcesSafeguard[i];

                if (resourcesSurplus > lackingResource) { resourcesSurplus = lackingResource; }

                var tradersToUse = villagesWithSurplus[i][index].traders[0] - settings.tradersSafeguard;
                if (tradersToUse < 0) { tradersToUse = 0; }

                var resourcesToTransport = [0, 0, 0];
                tradersToUse = Math.min(Math.floor(resourcesSurplus / 1000), tradersToUse);
                resourcesToTransport[i] = tradersToUse * 1000;

                var villagesIDs = [villagesWithSurplus[i][index].id, villagesWithShortage[i][0].id];
                var transportDistance = distance(villagesWithShortage[i][0], villagesWithSurplus[i][index]);

                transportsSafeguard.push(new transport(transportDistance, villagesIDs, resourcesToTransport));
                villagesWithShortage[i][0].commingResources[i] += resourcesToTransport[i];
                villagesWithShortage[i][0].receiver = true;
                villagesWithSurplus[i][index].resources[i] -= resourcesToTransport[i];
                villagesWithSurplus[i][index].traders[0] -= tradersToUse;

                if (villagesWithSurplus[i][index].traders[0] <= settings.tradersSafeguard || villagesWithSurplus[i][index].resources[i] < settings.resourcesSafeguard[i] + 1000) {
                    swap(villagesWithSurplus[i], 0, index);
                    villagesWithSurplus[i].shift();
                }

                lackingResource -= resourcesToTransport[i];
            }

            villagesWithShortage[i].shift();
        }
    }

    // sklej transporty różnych surowców między tymi samymi wioskami
    mergeTransports(transportsSafeguard);
}
function provideResourcesFillTo() {
    transportsFillTo = new Array();
    let villagesWithShortage = [new Array(), new Array(), new Array()];
    let villagesWithSurplus = [new Array(), new Array(), new Array()];

    // rozpoznaj brakujące i wolne surowce, i - typ surowca
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < villages.length; j++) {
            if (villages[j].resources[i] + villages[j].commingResources[i] < settings.resourcesFillTo[i]) {
                villagesWithShortage[i].push(villages[j]);
            }
            else {
                if (villages[j].resources[i] > settings.resourcesSafeguard[i]) {
                    if ((villages[j].traders[0] - settings.tradersSafeguard) / 3 >= 1) { // oszczędność w kupcach
                        villagesWithSurplus[i].push(villages[j]);
                    }
                }
            }
        }
        sortVillagesByAllResources(villagesWithShortage[i], i);
    }

    // przygotuj transporty, i - typ surowca
    for (var i = 0; i < 3; i++) {
        while (villagesWithShortage[i].length > 0 && villagesWithSurplus[i].length > 0) {
            var lackingResource = settings.resourcesFillTo[i];
            if (villagesWithShortage[i][0].granary * settings.overFlowThreshold / 100 < settings.resourcesFillTo[i]) {
                lackingResource = villagesWithShortage[i][0].granary * settings.overFlowThreshold / 100;
            }
            lackingResource -= (villagesWithShortage[i][0].resources[i] + villagesWithShortage[i][0].commingResources[i]);

            if (lackingResource < 0) {
                lackingResource = 0;
            }

            while (lackingResource >= 1000 && villagesWithSurplus[i].length > 0) {
                var index = indexOf_bestVillageInStage2(i, villagesWithShortage[i][0], villagesWithSurplus[i]);

                var resourcesSurplus = villagesWithSurplus[i][index].resources[i] + villagesWithSurplus[i][index].commingResources[i] - settings.resourcesFillTo[i];

                if (resourcesSurplus > villagesWithSurplus[i][index].resources[i] - settings.resourcesSafeguard[i]) {
                    resourcesSurplus = villagesWithSurplus[i][index].resources[i] - settings.resourcesSafeguard[i]
                }
                if (resourcesSurplus > lackingResource) {
                    resourcesSurplus = lackingResource;
                }
                if (resourcesSurplus < 0) {
                    resourcesSurplus = 0;
                }

                var tradersToUse = (villagesWithSurplus[i][index].traders[0] - settings.tradersSafeguard);
                tradersToUse = Math.floor(tradersToUse / (3 - i));
                if (tradersToUse < 0) { tradersToUse = 0; }
                
                let tradersUsedUp = false;
                if (tradersToUse <= Math.floor(resourcesSurplus / 1000)) {
                    tradersUsedUp = true;
                }
                else {
                    tradersToUse = Math.floor(resourcesSurplus / 1000);
                }

                var resourcesToTransport = [0, 0, 0];
                resourcesToTransport[i] = tradersToUse * 1000;

                var villagesIDs = [villagesWithSurplus[i][index].id, villagesWithShortage[i][0].id];
                var transportDistance = distance(villagesWithSurplus[i][index], villagesWithShortage[i][0]);

                transportsFillTo.push(new transport(transportDistance, villagesIDs, resourcesToTransport));
                villagesWithShortage[i][0].commingResources[i] += resourcesToTransport[i];
                villagesWithShortage[i][0].receiver = true;
                villagesWithSurplus[i][index].resources[i] -= resourcesToTransport[i];
                villagesWithSurplus[i][index].traders[0] -= tradersToUse;

                if (tradersUsedUp
                    || villagesWithSurplus[i][index].traders[0] <= settings.tradersSafeguard
                    || villagesWithSurplus[i][index].resources[i] + villagesWithSurplus[i][index].commingResources[i] < settings.resourcesFillTo[i] + 1000
                    || villagesWithSurplus[i][index].resources[i] < settings.resourcesSafeguard[i] + 1000) {

                    swap(villagesWithSurplus[i], 0, index);
                    villagesWithSurplus[i].shift();
                }

                lackingResource -= resourcesToTransport[i];
            }

            villagesWithShortage[i].shift();
        }
    }

    // sklej transporty różnych surowców między tymi samymi wioskami
    mergeTransports(transportsFillTo);
}
function sendToCoinFlags() {
    transportsToCoinVillages = new Array();
    var coinVillages = new Array();

    // rozpoznaj wioski z flagami
    for (var i = 0; i < villages.length; i++) {
        
        if (Number(villages[i].flag) > 0) { coinVillages.push(villages[i]); }
    }

    // przygotuj tablice na wioski z nadwyżkami
    let villagesWithSurplus = new Array();
    for (var i = 0; i < coinVillages.length; i++) {
        villagesWithSurplus.push([new Array(), new Array(), new Array()]);
    }

    // rozpoznaj wioski z nadwyżkami i przypisz je do najlepszej wioski z flagą
    for (var i = 0; i < villages.length; i++) {
        if (villages[i].flag == 0) {
            if (villages[i].traders[0] > settings.tradersSafeguard) {
                let index = indexOf_bestCoinVillage(villages[i], coinVillages);
                for (var j = 0; j < 3; j++) {
                    if (villages[i].resources[j] + villages[i].commingResources[j] > settings.resourcesSurplus[j]) {
                        if (villages[i].resources[j] > settings.resourcesSafeguard[j]) {
                            villagesWithSurplus[index][j].push(villages[i]);
                        }
                    }
                }
            }
        }

    }

    for (var i = 0; i < villagesWithSurplus.length; i++) {
        for (var j = 0; j < 3; j++) {
            sortVillagesByResource(villagesWithSurplus[i][j], j);
        }
    }

    // stosunek aktualnie posłanych surowców po odjęciu kosztu monet - zabezpieczenie proporcji przesyłanych surowców
    function updateRatio(ratio) {
        while (ratio[0] >= 28000
            && ratio[1] >= 30000
            && ratio[2] >= 25000) {

            ratio[0] -= 28000;
            ratio[1] -= 30000;
            ratio[2] -= 25000;
        }
        if (ratio[0] < 28000) {
            return 0;
        }
        if (ratio[1] < 30000) {
            return 1;
        }
        if (ratio[2] < 25000) {
            return 2;
        }
    }

    // poślij surowce
    for (var i = 0; i < coinVillages.length; i++) {
        var currentResourcesRatio = [0, 0, 0];
        for (var j = 0; j < 3; j++) { currentResourcesRatio[j] += coinVillages[i].resources[j] + coinVillages[i].commingResources[j] - settings.resourcesSafeguard[j]; }

        // sur - typ surowca, którego brakuje - do wysyłki
        var sur = updateRatio(currentResourcesRatio);

        while (villagesWithSurplus[i][sur].length > 0) {
            resourceToSend = villagesWithSurplus[i][sur][0].resources[sur] + villagesWithSurplus[i][sur][0].commingResources[sur];
            resourceToSend -= settings.resourcesSurplus[sur];

            if (resourceToSend > villagesWithSurplus[i][sur][0].resources[sur] - settings.resourcesSafeguard[sur]) {
                resourceToSend = villagesWithSurplus[i][sur][0].resources[sur] - settings.resourcesSafeguard[sur]
            }

            if (resourceToSend > currentResourcesRatio[sur] + 1000) {
                resourceToSend = currentResourcesRatio[sur] + 1000;
            }

            var tradersToUse = Math.floor(resourceToSend / 1000);

            if ( tradersToUse > villagesWithSurplus[i][sur][0].traders[0] - settings.tradersSafeguard) {
                tradersToUse = villagesWithSurplus[i][sur][0].traders[0] - settings.tradersSafeguard;
            }

            var transportResources = [0, 0, 0];
            transportResources[sur] = tradersToUse * 1000;

            var villagesIDs = [villagesWithSurplus[i][sur][0].id, coinVillages[i].id];
            var transportDistance = distance(villagesWithSurplus[i][sur][0], coinVillages[i]);

            transportsToCoinVillages.push(new transport(transportDistance, villagesIDs, transportResources));

            villagesWithSurplus[i][sur][0].traders[0] -= tradersToUse;
            villagesWithSurplus[i][sur][0].resources[sur] -= transportResources[sur];

            coinVillages[i].resources[sur] += transportResources[sur];
            coinVillages[i].receiver == true;

            villagesWithSurplus[i][sur].shift();
            currentResourcesRatio[sur] += transportResources[sur];
            sur = updateRatio(currentResourcesRatio);
        }
    }

    mergeTransports(transportsToCoinVillages);
}
function overFlowPreventing() {
    transportsOverFlow = new Array();
    let villagesWithSpareGranary = [new Array(), new Array(), new Array()];
    let villagesWithOverFlow = [new Array(), new Array(), new Array()];

    // rozpoznaj brakujące i wolne miejsca w spichlerzach, i - typ surowca
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < villages.length; j++) {
            if ((villages[j].resources[i] + villages[j].commingResources[i]) / villages[j].granary > settings.overFlowThreshold / 100) {
                if (villages[j].traders[0] > settings.tradersSafeguard) {
                    if (settings.sendSurplusToCoinFlags == true) {
                        if (villages[j].flag == 0) {
                            villagesWithOverFlow[i].push(villages[j]);
                        }
                    }
                    else {
                        villagesWithOverFlow[i].push(villages[j]);
                    }
                }
            }
            else {
                if (settings.extendedOptimization == true) {
                    villagesWithSpareGranary[i].push(villages[j]);
                }
                else {
                    if (villages[j].receiver == true) {
                        villagesWithSpareGranary[i].push(villages[j]);
                    }
                }
            }
        }
    }

    // przygotuj transporty, i - typ surowca
    for (var i = 0; i < 3; i++) {
        while (villagesWithOverFlow[i].length > 0 && villagesWithSpareGranary[i].length > 0) {
            var overFlow = villagesWithOverFlow[i][0].resources[i] + villagesWithOverFlow[i][0].commingResources[i];
            overFlow -= villagesWithOverFlow[i][0].granary * settings.overFlowThreshold / 100;
            if (villagesWithOverFlow[i][0].resources[i] - overFlow < settings.resourcesSafeguard[i]) {
                overFlow = villagesWithOverFlow[i][0].resources[i] - settings.resourcesSafeguard[i];
            }
            var tradersToUse = Math.floor(overFlow / 1000);
            if (tradersToUse > villagesWithOverFlow[i][0].traders[0] - settings.tradersSafeguard) {
                tradersToUse = villagesWithOverFlow[i][0].traders[0] - settings.tradersSafeguard;
            }

            while (tradersToUse > 0 && villagesWithSpareGranary[i].length > 0) {
                var usedSpareSpace = false;
                var index = indexOf_bestSpareGranary(i, villagesWithOverFlow[i][0], villagesWithSpareGranary[i]);

                var spareSpace = villagesWithSpareGranary[i][index].granary * settings.overFlowThreshold / 100;
                spareSpace -= villagesWithSpareGranary[i][index].resources[i] + villagesWithSpareGranary[i][index].commingResources[i];

                if (spareSpace < 1000) {
                    spareSpace = 0;
                    usedSpareSpace = true;
                }

                var tradersToReceive = Math.floor(spareSpace / 1000);

                if (tradersToReceive > tradersToUse) {
                    tradersToReceive = tradersToUse;
                }

                var resourcesToTransport = [0, 0, 0];
                resourcesToTransport[i] = tradersToReceive * 1000;

                var villagesIDs = [villagesWithOverFlow[i][0].id, villagesWithSpareGranary[i][index].id];
                var transportDistance = distance(villagesWithOverFlow[i][0], villagesWithSpareGranary[i][index]);

                transportsOverFlow.push(new transport(transportDistance, villagesIDs, resourcesToTransport));
                villagesWithSpareGranary[i][index].commingResources[i] += resourcesToTransport[i];
                villagesWithSpareGranary[i][index].receiver = true;
                villagesWithOverFlow[i][0].resources[i] -= resourcesToTransport[i];
                villagesWithOverFlow[i][0].traders[0] -= tradersToReceive;
                tradersToUse -= tradersToReceive;

                if (usedSpareSpace == true) {
                    swap(villagesWithSpareGranary[i], index, 0);
                    villagesWithSpareGranary[i].shift();
                }
            }

            villagesWithOverFlow[i].shift();
        }
    }

    mergeTransports(transportsOverFlow);
}

// heurystyka doboru wiosek do różnych zastosowań
function indexOf_closestVillage(village, villages) {
    var minDistance = distance(village, villages[0]);
    var index = 0;
    for (var i = 0; i < villages.length; i++) {
        var newDistance = distance(village, villages[i]);
        if (newDistance < minDistance) {
            minDistance = newDistance;
            index = i;
        }
    }

    return index;
}
function indexOf_bestVillageInStage2(sur, village, villages) {
    function score(int) {
        return ( Math.pow(villages[int].resources[sur], 4) / distance(village, villages[int]) );
    }
    var bestScore = score(0);
    var index = 0;
    for (var i = 0; i < villages.length; i++) {
        var newScore = score(i);
        if (newScore > bestScore) {
            bestScore = newScore;
            index = i;
        }
    }

    return index;
}
function indexOf_bestVillageInOptimization(villageA, villageB, villages) {
    function maxDist(int) {
        return Math.max(distance(villages[int], villageA), distance(villages[int], villageB));
    }
    var dist = maxDist(0);
    var index = 0;
    for (var i = 0; i < villages.length; i++) {
        var newDist = maxDist(i);
        if (newDist < dist) {
            dist = newDist;
            index = i;
        }
    }

    if (dist >= distance(villageA, villageB)) { index = -1; }

    return index;
}
function indexOf_bestCoinVillage(village, coinVillages) {
    function score(int) {
        return (Math.pow(coinVillages[int].flag, 2) / distance(village, coinVillages[int]));
    }
    var bestScore = score(0);
    var index = 0;
    for (var i = 0; i < coinVillages.length; i++) {
        var newScore = score(i);
        if (newScore > bestScore) {
            bestScore = newScore;
            index = i;
        }
    }

    return index;
}
function indexOf_bestSpareGranary(sur, village, spareGranarys) {
    function score(int) {
        return (Math.pow(spareGranarys[int].resources[sur], 2) * distance(village, spareGranarys[int]));
    }
    var bestScore = score(0);
    var index = 0;
    for (var i = 0; i < spareGranarys.length; i++) {
        var newScore = score(i);
        if (newScore < bestScore) {
            bestScore = newScore;
            index = i;
        }
    }

    return index;
}

// sortowania wiosek po danym typie surowca (tak wiem, że to obrzydliwe...)
function sortVillagesByResource(villages, res) {
    function compareVillagesByWood(villageA, villageB) { return villageA.resources[0] - villageB.resources[0]; }
    function compareVillagesByClay(villageA, villageB) { return villageA.resources[1] - villageB.resources[1]; }
    function compareVillagesByIron(villageA, villageB) { return villageA.resources[2] - villageB.resources[2]; }

    if (res == 0) { villages.sort(compareVillagesByWood); }
    if (res == 1) { villages.sort(compareVillagesByClay); }
    if (res == 2) { villages.sort(compareVillagesByIron); }
} // surowce w wiosce
function sortVillagesByAllResources(villages, res) {
    function compareVillagesByAllWood(villageA, villageB) { return (villageA.resources[0] + villageA.commingResources[0]) - (villageB.resources[0] + villageB.commingResources[0]); }
    function compareVillagesByAllClay(villageA, villageB) { return (villageA.resources[1] + villageA.commingResources[1]) - (villageB.resources[1] + villageB.commingResources[1]); }
    function compareVillagesByAllIron(villageA, villageB) { return (villageA.resources[2] + villageA.commingResources[2]) - (villageB.resources[2] + villageB.commingResources[2]); }

    if (res == 0) { villages.sort(compareVillagesByAllWood); }
    if (res == 1) { villages.sort(compareVillagesByAllClay); }
    if (res == 2) { villages.sort(compareVillagesByAllIron); }
} // surowce w wiosce i idące do niej

// normalizacja transportów
function mergeTransports(transports) {
    reduceOpposing(transports); // redukuje przeciwstawne tranporty tego samego surowca
    removeEmptys(transports);   // wykasowuje puste transporty - potrzebne po reduceOpposing()

    let again = true;
    while (again) {
        again = false;
        // sortowanie, aby transporty między tymi samymi wioskami były obok siebie
        // oraz aby transporty do jednej wioski były obok siebie do późniejszego odczytu przy wpisywaniu w zakładce "Wezwij"
        transports.sort(compareTransports);

        // sklejenie sąsiednich transportów między tymi samymi wioskami
        for (var i = 0; i < transports.length - 1; i++) {
            // czy ta sama wioska wysyłająca
            if (transports[i].villageID[0] == transports[i + 1].villageID[0]) {
                // czy ta sama wioska przyjmująca
                if (transports[i].villageID[1] == transports[i + 1].villageID[1]) {
                    var resources = [0, 0, 0];
                    for (var j = 0; j < 3; j++) {
                        resources[j] += transports[i].resources[j] + transports[i + 1].resources[j];
                    }
                    transports.push(new transport(transports[i].distance, transports[i].villageID, resources));

                    swap(transports, 0, i);
                    transports.shift();
                    swap(transports, 0, i);
                    transports.shift();

                    i--;

                    again = true;
                }
            }
        }
    }
}
function removeEmptys(transports) {
    for (var i = 0; i < transports.length; i++) {
        let res = transports[i].resources[0] + transports[i].resources[1] + transports[i].resources[2];
        if (res == 0) {
            let receiverID = transports[i].villageID[1];
            swap(transports, 0, i);
            transports.shift();

            // czy wioska, do której szedł transport odbiera jeszcze inny transport
            let foundReceiver = false;
            for (var j = 0; j < transports.lenght; j++) {
                if (transports[i].villageID[1] == receiverID) {
                    foundReceiver == true;
                    break;
                }
            }

            // jak nie, to ustaw, że nie jest odbiorcą
            if (foundReceiver == false) {
                for (var j = 0; j < villages.lenght; j++) {
                    if (villages[j].id == receiverID) {
                        villages[j].receiver == false;
                        break;
                    }
                }
            }

            i--;
        }
    }
}
function reduceOpposing(transports) {
    // znajdź przeciwstawne transporty
    for (var i = 0; i < transports.length - 1; i++) {
        for (var j = i + 1; j < transports.length; j++) {
            if (transports[i].villageID[0] == transports[j].villageID[1]) {
                if (transports[i].villageID[1] == transports[j].villageID[0]) {

                    let villageA = null;
                    let villageB = null;

                    // znajdź wioski po id
                    for (var k = 0; k < villages.length && (villageA == null || villageB == null); k++) {
                        if (transports[i].villageID[0] == villages[k].id) {
                            villageA = villages[k];
                            continue;
                        }
                        if (transports[i].villageID[1] == villages[k].id) {
                            villageB = villages[k];
                        }
                    }

                    // obniż surowce w przeciwstawnych transportach, aby nie kursowac niepotrzebnie
                    let reducedResources = 0;
                    let freedTraders = 0;
                    for (var k = 0; k < 3; k++) {
                        reducedResources = Math.min(transports[i].resources[k], transports[j].resources[k]);
                        freedTraders = reducedResources / 1000;

                        villageA.resources[k] += reducedResources;
                        villageA.commingResources[k] -= reducedResources;
                        villageA.traders[0] += freedTraders;

                        villageB.resources[k] += reducedResources;
                        villageB.commingResources[k] -= reducedResources;
                        villageB.traders[0] += freedTraders;

                        transports[i].resources[k] -= reducedResources;
                        transports[j].resources[k] -= reducedResources;
                    }
                }
            }
        }
    }
}

// warunek sortowania, który sprawia, że transporty do jednej wioski są obok siebie
// potrzebne do sklejania transportów między tymi samymi wioskami
// oraz późniejszego odczytu przy wpisywaniu w zakładce "Wezwij"
function compareTransports(transportA, transportB) {
    if (transportA.villageID[1] != transportB.villageID[1]) {
        return transportA.villageID[1] - transportB.villageID[1];
    }
    else {
        return transportA.villageID[0] - transportB.villageID[0];
    }
}

// tworzenie planu 
function addTransports(transports) {
    for (var i = 0; i < transports.length; i++) {
        allTransports.push(transports[i]);
    }
    optimizeTransports(allTransports, 1);
} // dodanie nowych transporów do głównej listy i wstępne, częściowe ich zoptymalizowanie
function createPlan() {
    UI.SuccessMessage('Dane zostały wczytane. Opracowuję plan transportów...', 10000);

    allTransports = new Array();

    // przygotuj najpilniejsze transporty - uzupełnienie zabezpieczenia
    provideResourcesSafeguard();
    // ale nie dodajemy ich do głównej listy, aby nie optymalzowac ich
    // są to transporty priorytetowe, a optymalizacja może paradoksalnie wydłużyć czas transportu - preOptimizeTransports()

    provideResourcesFillTo();
    addTransports(transportsFillTo);

    if (settings.sendSurplusToCoinFlags) {
        sendToCoinFlags();
        addTransports(transportsToCoinVillages);
    }


    if (settings.overFlowThreshold < 100) {
        overFlowPreventing();
        addTransports(transportsOverFlow);
    }

    optimizeTransports(allTransports, 0); // optymalizacja na maxa - ile się uda

    // dodanie transportów priorytetowych
    for (var i = 0; i < transportsSafeguard.length; i++) { allTransports.push(transportsSafeguard[i]); }
    mergeTransports(allTransports);

    // jeżeli nasz plan obejmuje choć jeden transport
    if (allTransports.length > 0) {        
        // zapisanie planu do pamięci przeglądarki
        var allTransportsJSON = JSON.stringify(allTransports);
        localStorage.setItem("transports", allTransportsJSON);

        UI.SuccessMessage('Plan transportów opracowany. Przenoszę na rynek.', 5000);

        // przeniesienie do miejsca, w którym gracz może zacząć realizować plan
        var split = document.URL.indexOf("?") + 1;
        location = document.URL.substring(0, split) + "village=" + allTransports[0].villageID[1] + "&screen=market&mode=call";
    }
    else {
        UI.SuccessMessage('Zdaje się, że nic nie potrzeba.', 5000);
    }
} // tworzenie planu transportów

// optymalizacja transportów
function preOptimizeTransports(transports) {

    let transportsByType = [new Array(), new Array(), new Array()];

    for (var i = 0; i < transports.lenght; i++) {
        for (var j = 0; j < 3; j++) {
            if (transports[i].resources[j] > 0) { transportsByType[j].push(transports[i]); }
        }
    }

    let tryAgain = true;
    while (tryAgain) {
        tryAgain = false;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < transportsByType[i].lenght; j++) {
                for (var k = 0; k < transportsByType[i].length; k++) {
                    if (transportsByType[i][j].villageID[1] == transportsByType[i][k].villageID[0]) {
                        if (transportsByType[i][j].resources[i] > 0 && transportsByType[i][k].resources[i] > 0) {
                            let sender;
                            for (var l = 0; l < villages.lenght; l++) {
                                if (transportsByType[i][j].villageID[0] == villages[l].id) {
                                    sender = villages[l];
                                    break;
                                }
                            }
                            let broker;
                            for (var l = 0; l < villages.lenght; l++) {
                                if (transportsByType[i][j].villageID[1] == villages[l].id) {
                                    broker = villages[l];
                                    break;
                                }
                            }
                            let receiver;
                            for (var l = 0; l < villages.lenght; l++) {
                                if (transportsByType[i][k].villageID[1] == villages[l].id) {
                                    receiver = villages[l];
                                    break;
                                }
                            }

                            let newDistance = distance(sender, receiver);
                            if (newDistance < Math.max(transportsByType[i][j].distance, transportsByType[i][k].distance)) {
                                let resource = [0, 0, 0];
                                resource[i] = Math.min(transportsByType[i][j].resource[i], transportsByType[i][k].resource[i]);
                                let tradersToUse = resource[i] / 1000;
                                let villagesIDs = [sender.id, receiver.id];

                                transports.push(new transport(newDistance, villagesIDs, resource));
                                transportsByType[i].push(transports[transports.lenght - 1]);
                                
                                transportsByType[i][j].resource[i] -= resource[i];
                                transportsByType[i][k].resource[i] -= resource[i];

                                broker.resources[i] += resource[i];
                                broker.commingResources[i] -= resource[i];
                                broker.traders[0] += tradersToUse;

                                tryAgain = true;
                            }
                        }
                    }
                }
            }
        }
    }
    

} // kasuje nieefektywnych pośredników
function optimizeTransports(transports, ratio) {
    mergeTransports(transports);
    preOptimizeTransports(transports);

    var averageDistance = function () {
        let sum = 0;
        for (var i = 0; i < transports.length; i++) {
            sum += transports[i].distance;
        }
        return sum / transports.length;
    }
    var optimizationThreshold = averageDistance() * ratio;
    var deadEnds = new Array();

    let villagesWithSurplus = [new Array(), new Array(), new Array()];
    villagesWithSurplus.length
    // rozpoznaj wolne surowce, i - typ surowca
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < villages.length; j++) {
            if (villages[j].resources[i] + villages[j].commingResources[i] > settings.resourcesTransportBuffer[i]) {
                if (villages[j].traders[0] > settings.tradersSafeguard) {
                    if (villages[j].resources[i] > settings.resourcesSafeguard[i]) {
                        if (settings.extendedOptimization) {
                            villagesWithSurplus[i].push(villages[j]);
                        }
                        else {
                            if (villages[j].receiver == true) {
                                villagesWithSurplus[i].push(villages[j]);
                            }
                        }
                    }
                }
            }
        }
    }

    while (transports.length > 0) {
        if (transports.length > 1) {
            swap(transports, indexOf_LongestTransport(transports), 0);
        }
        if (transports[0].distance < optimizationThreshold) { break; }
        let transportVillages = new Array(2);
        for (var i = 0; i < transportVillages.length; i++) {
            for (var j = 0; j < villages.length; j++) {
                if (villages[j].id == transports[0].villageID[i]) {
                    transportVillages[i] = villages[j];
                    break;
                }
            }
        } // wioski między którymi idzie transport

        for (var i = 0; i < 3; i++) {
            while (transports[0].resources[i] > 0 && villagesWithSurplus[i].length > 0) {
                let usedBroker = false;
                let transferResource = transports[0].resources[i];
                let index = indexOf_bestVillageInOptimization(transportVillages[0], transportVillages[1], villagesWithSurplus[i]);
                if (index != -1) {
                    if (transferResource > villagesWithSurplus[i][index].resources[i] + villagesWithSurplus[i][index].commingResources[i] - settings.resourcesTransportBuffer[i]) {
                        transferResource = villagesWithSurplus[i][index].resources[i] + villagesWithSurplus[i][index].commingResources[i] - settings.resourcesTransportBuffer[i];
                        usedBroker = true;
                    }
                    if (transferResource > villagesWithSurplus[i][index].resources[i] - settings.resourcesSafeguard[i]) {
                        transferResource = villagesWithSurplus[i][index].resources[i] - settings.resourcesSafeguard[i];
                        usedBroker = true;
                    }

                    let tradersToUse = Math.floor(transferResource / 1000);

                    if (tradersToUse > villagesWithSurplus[i][index].traders[0] - settings.tradersSafeguard) {
                        tradersToUse = villagesWithSurplus[i][index].traders[0] - settings.tradersSafeguard;
                        usedBroker = true;
                    }
                    if (tradersToUse < 0) {
                        tradersToUse = 0;
                        usedBroker = true;
                    }

                    let resourcesToTransport = [0, 0, 0];
                    resourcesToTransport[i] = tradersToUse * 1000;

                    let villagesIDs = [
                        [transports[0].villageID[0],        villagesWithSurplus[i][index].id],
                        [villagesWithSurplus[i][index].id,  transports[0].villageID[1]]
                    ];

                    let distances = [
                        distance(transportVillages[0], villagesWithSurplus[i][index]),
                        distance(transportVillages[1], villagesWithSurplus[i][index])
                    ];

                    transports.push(new transport(distances[0], villagesIDs[0], resourcesToTransport));
                    transports.push(new transport(distances[1], villagesIDs[1], resourcesToTransport));

                    transports[0].resources[i] -= resourcesToTransport[i];
                    villagesWithSurplus[i][index].traders[0] -= tradersToUse
                    villagesWithSurplus[i][index].resources[i] -= resourcesToTransport[i];

                    if (usedBroker == true) {
                        swap(villagesWithSurplus[i], 0, index);
                        villagesWithSurplus[i].shift();
                    }
                }
                else {
                    break;
                }
            }
        }
        var tmp = transports.shift();
        if (tmp.resources[0] + tmp.resources[1] + tmp.resources[2] > 0) { deadEnds.push(tmp); }
        mergeTransports(transports);
        preOptimizeTransports(transports);
    }

    while (deadEnds.length > 0) {
        transports.push(deadEnds.shift());
    }
    preOptimizeTransports(transports);
    mergeTransports(transports);
} // dodaje efektywnych pośredników
function indexOf_LongestTransport(transports) {
    let distance = transports[0].distance;
    let index = 0;
    for (var i = 0; i < transports.length; i++) {
        if (distance < transports[i].distance) {
            distance = transports[i].distance;
            index = i;
        }
    }

    return index;
} // wyszukuje najdłuższy transport - priorytet do optymalizacji

// obiekty
function village(_id, _coords, _points, _resources, _granary, _traders, _farm) {
    this.id = _id,
    this.coords = _coords,              // [2]: 0-x, 1-y
    this.points = _points,
    this.resources = _resources,        // [3]: 0-wood, 1-clay, 2-iron
    this.commingResources = [0, 0, 0],  // [3]: 0-wood, 1-clay, 2-iron
    this.granary = _granary,
    this.traders = _traders,            // [2]: 0-free, 1-all
    this.farm = _farm,                  // [2]: 0-occupied, 1-all
    this.flag = 0,
    this.receiver = false,

    this.toString = function () {
        return  this.id + " " +
                this.coords[0] + " " + this.coords[1] + " " +
                this.points + " " +
                this.resources[0] + " " + this.resources[1] + " " + this.resources[2] + " " +
                this.granary + " " +
                this.traders[0] + " " + this.traders[1] + " " +
                this.farm[0] + " " + this.farm[1];
    }
}
function transport(_distance, _villageID, _resources) {
    this.distance = _distance,
    this.villageID = _villageID, // [2]: 0-sending, 1-receaving
    this.resources = _resources  // [3]: 0-wood, 1-clay, 2-iron
}

// drobne funkcje ogólne
function distance(villageA, villageB) {
    return Math.sqrt(Math.pow(villageA.coords[0] - villageB.coords[0], 2) + Math.pow(villageA.coords[1] - villageB.coords[1], 2));
}
function swap(array, i, j) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
}