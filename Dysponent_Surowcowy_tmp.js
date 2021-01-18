javascript:

/*
var settings = {
    resourcesSafeguard: [10000, 10000, 10000],
    resourcesFillTo: [20000, 20000, 20000],
    tradersSafeguard: 0,
    overFlowThreshold: 75,
    extendedOptimization: true
};
*/

var villages;
var transportsSafeguard;
var transportsFillTo;
var transportsToCoinVillages;
var transportsOverFlow;
var allTransports;

function isPlanReady() { 
    if (document.URL.indexOf("overview_villages") != -1 && document.URL.indexOf("prod") != -1) {
        localStorage.removeItem("transports");
        return false;
    }
    else {
        allTransports = JSON.parse(localStorage.getItem("transports"));
        console.log(allTransports);
        if (allTransports === null) { return false; }
        else { return true; }
    }
}

if (isPlanReady() === true) {
    if (document.URL.indexOf("market") == -1 || document.URL.indexOf("call") == -1) {
        UI.InfoMessage('Surowce wzywa si� na rynku! Przejd� na rynek do zak�adki wezwij.', 5000, 'error');
    }
    else {
        if (game_data.village.id != allTransports[0].villageID[1]) {
            var split = document.URL.indexOf("?") + 1;
            location = document.URL.substring(0, split) + "village=" + allTransports[0].villageID[1] + "&screen=market&mode=call";
        }
        else {
            var reseavingID = allTransports[0].villageID[1];

            input = $("#village_list tbody tr td input");

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

            var button = document.getElementsByClassName("btn")[0];
            button.focus();

            if (allTransports.length > 0) {
                var allTransportsJSON = JSON.stringify(allTransports);
                localStorage.setItem("transports", allTransportsJSON);
                UI.SuccessMessage('Transpory przygotowane i usuni�te z planu. Pozosta�o ' + allTransports.length + ' transport�w.', 10000);
            }
            else {
                localStorage.removeItem("transports");
                UI.SuccessMessage('To ju� ostatnie transporty!', 10000);
            }
        }
    }
}
else {
    if (document.URL.indexOf("overview_villages") == -1 || document.URL.indexOf("prod") == -1) {
        UI.InfoMessage('Przejd� do przegl�du produkcji, aby u�y� tego skryptu!', 5000, 'error');
    }
    else {
        UI.SuccessMessage('Wczytuj� dane...', 10000);
        acquireVillagesData();
        createPlan();
    }
}

function acquireVillagesData() {
    villages = new Array();

    var table = document.querySelector('#production_table');
    for (var i = 1; i < table.rows.length; i++) {
        var inner;
        var start;
        var end;

        inner = table.rows[i].cells[1].innerHTML;

        start = inner.indexOf("(");
        end = inner.indexOf(")", start);
        var coords = inner.substring(start + 1, end).split("|");

        start = inner.indexOf("data-id=");
        end = inner.indexOf(" data", start);
        var id = inner.substring(start + 9, end - 1);

        var points = table.rows[i].cells[2].innerText.replace('.', '');

        var resources = [0, 0, 0];
        table.rows[i].cells[3].innerText.split(" ").map(x => Number(x.replace('.', ''))).forEach((x, i) => {
            resources[i] += x;
        });

        var granary = table.rows[i].cells[4].innerText;
        var traders = table.rows[i].cells[5].innerText.split("/");
        var farm = table.rows[i].cells[6].innerText.split("/");

        villages.push(new village(id, coords, points, resources, granary, traders, farm));
    }
}

function provideResourcesSafeguard() {
    transportsSafeguard = new Array();
    let villagesWithShortage = [new Array(), new Array(), new Array()];
    let villagesWithSurplus = [new Array(), new Array(), new Array()];

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

    mergeTransports(transportsSafeguard);
}
function provideResourcesFillTo() {
    transportsFillTo = new Array();
    let villagesWithShortage = [new Array(), new Array(), new Array()];
    let villagesWithSurplus = [new Array(), new Array(), new Array()];

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < villages.length; j++) {
            if (villages[j].resources[i] + villages[j].commingResources[i] < settings.resourcesFillTo[i]) {
                villagesWithShortage[i].push(villages[j]);
            }
            else {
                if (villages[j].resources[i] > settings.resourcesSafeguard[i]) {
                    if ((villages[j].traders[0] - settings.tradersSafeguard) / 3 >= 1) { // oszcz�dno�� w kupcach
                        villagesWithSurplus[i].push(villages[j]);
                    }
                }
            }
        }
        sortVillagesByAllResources(villagesWithShortage[i], i);
    }

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

    mergeTransports(transportsFillTo);
}
function overFlowPreventing() {
    transportsOverFlow = new Array();
    let villagesWithSpareGranary = [new Array(), new Array(), new Array()];
    let villagesWithOverFlow = [new Array(), new Array(), new Array()];

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

function sortVillagesByResource(villages, res) {
    function compareVillagesByWood(villageA, villageB) { return villageA.resources[0] - villageB.resources[0]; }
    function compareVillagesByClay(villageA, villageB) { return villageA.resources[1] - villageB.resources[1]; }
    function compareVillagesByIron(villageA, villageB) { return villageA.resources[2] - villageB.resources[2]; }

    if (res == 0) { villages.sort(compareVillagesByWood); }
    if (res == 1) { villages.sort(compareVillagesByClay); }
    if (res == 2) { villages.sort(compareVillagesByIron); }
}
function sortVillagesByAllResources(villages, res) {
    function compareVillagesByAllWood(villageA, villageB) { return (villageA.resources[0] + villageA.commingResources[0]) - (villageB.resources[0] + villageB.commingResources[0]); }
    function compareVillagesByAllClay(villageA, villageB) { return (villageA.resources[1] + villageA.commingResources[1]) - (villageB.resources[1] + villageB.commingResources[1]); }
    function compareVillagesByAllIron(villageA, villageB) { return (villageA.resources[2] + villageA.commingResources[2]) - (villageB.resources[2] + villageB.commingResources[2]); }

    if (res == 0) { villages.sort(compareVillagesByAllWood); }
    if (res == 1) { villages.sort(compareVillagesByAllClay); }
    if (res == 2) { villages.sort(compareVillagesByAllIron); }
}

function mergeTransports(transports) {
    reduceOpposing(transports);
    removeEmptys(transports);

    let again = true;
    while (again) {
        again = false;
        transports.sort(compareTransports);

        for (var i = 0; i < transports.length - 1; i++) {
            if (transports[i].villageID[0] == transports[i + 1].villageID[0]) {
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

            let foundReceiver = false;
            for (var j = 0; j < transports.lenght; j++) {
                if (transports[i].villageID[1] == receiverID) {
                    foundReceiver == true;
                    break;
                }
            }

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
    for (var i = 0; i < transports.length - 1; i++) {
        for (var j = i + 1; j < transports.length; j++) {
            if (transports[i].villageID[0] == transports[j].villageID[1]) {
                if (transports[i].villageID[1] == transports[j].villageID[0]) {

                    let villageA = null;
                    let villageB = null;

                    for (var k = 0; k < villages.length && (villageA == null || villageB == null); k++) {
                        if (transports[i].villageID[0] == villages[k].id) {
                            villageA = villages[k];
                            continue;
                        }
                        if (transports[i].villageID[1] == villages[k].id) {
                            villageB = villages[k];
                        }
                    }

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

function compareTransports(transportA, transportB) {
    if (transportA.villageID[1] != transportB.villageID[1]) {
        return transportA.villageID[1] - transportB.villageID[1];
    }
    else {
        return transportA.villageID[0] - transportB.villageID[0];
    }
}

function addTransports(transports) {
    for (var i = 0; i < transports.length; i++) {
        allTransports.push(transports[i]);
    }
    optimizeTransports(allTransports, 1);
}
function createPlan() {
    UI.SuccessMessage('Dane zosta�y wczytane. Opracowuj� plan transport�w...', 10000);

    allTransports = new Array();

    provideResourcesSafeguard();
    provideResourcesFillTo();
    addTransports(transportsFillTo);

    if (settings.overFlowThreshold < 100) {
        overFlowPreventing();
        addTransports(transportsOverFlow);
    }

    optimizeTransports(allTransports, 0);


    for (var i = 0; i < transportsSafeguard.length; i++) { allTransports.push(transportsSafeguard[i]); }
    mergeTransports(allTransports);

    if (allTransports.length > 0) {        
        var allTransportsJSON = JSON.stringify(allTransports);
        localStorage.setItem("transports", allTransportsJSON);

        UI.SuccessMessage('Plan transport�w opracowany. Przenosz� na rynek.', 5000);

        var split = document.URL.indexOf("?") + 1;
        location = document.URL.substring(0, split) + "village=" + allTransports[0].villageID[1] + "&screen=market&mode=call";
    }
    else {
        UI.SuccessMessage('Zdaje si�, �e nic nie potrzeba.', 5000);
    }
}


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
} 
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
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < villages.length; j++) {
            if (villages[j].resources[i] + villages[j].commingResources[i] > settings.resourcesSafeguard[i]) {
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
        }

        for (var i = 0; i < 3; i++) {
            while (transports[0].resources[i] > 0 && villagesWithSurplus[i].length > 0) {
                let usedBroker = false;
                let transferResource = transports[0].resources[i];
                let index = indexOf_bestVillageInOptimization(transportVillages[0], transportVillages[1], villagesWithSurplus[i]);
                if (index != -1) {
                    if (transferResource > villagesWithSurplus[i][index].resources[i] + villagesWithSurplus[i][index].commingResources[i] - settings.resourcesSafeguard[i]) {
                        transferResource = villagesWithSurplus[i][index].resources[i] + villagesWithSurplus[i][index].commingResources[i] - settings.resourcesSafeguard[i];
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
} 
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
} 

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

function distance(villageA, villageB) {
    return Math.sqrt(Math.pow(villageA.coords[0] - villageB.coords[0], 2) + Math.pow(villageA.coords[1] - villageB.coords[1], 2));
}
function swap(array, i, j) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
}