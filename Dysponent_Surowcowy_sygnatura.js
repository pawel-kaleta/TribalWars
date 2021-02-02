javascript:

var DysponentSurowcowy = {
    // USTAWIENIA DOMYSLNE
    resourcesFillTo: [75000, 75000, 75000],    // wypełniaj do tej wartości
    resourcesSafeguard: [20000, 20000, 20000], // zabezpieczenie w surowcach, wypełniane priorytetowo
    tradersSafeguard: 0,                       // zabezpieczenie w kupcach
    considerOngoingTransports: true,           // uwzględnij przychodzące transporty (tak - true, nie - false)
    overFlowThreshold: 75,                     // % pojemności spichlerza, powyżej ktorego zapobiegaj przelewaniu się
    extendedOptimization: true,                // czy optymalizacja może generowac dodatkowych odbiorców (wiecej klikania)
    minSummon: 0                               // minimalne wezwanie
};

$.getScript('https://media.innogamescdn.com/com_DS_PL/skrypty/Dysponent_Surowcowy.js');
void(0);
