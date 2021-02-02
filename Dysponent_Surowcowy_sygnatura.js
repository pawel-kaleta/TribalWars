javascript:

var DysponentSurowcowy = {
	// USTAWIENIA DOMYSLNE
	resourcesFillTo: [20000, 25000, 25000],     // wypelniaj do tej wartosci
	resourcesSafeguard: [2000, 2000, 2000],     // zabezpieczenie w surowcach, wypelniane priorytetowo
	tradersSafeguard: 0,                        // zabezpieczenie w kupcach
	considerOngoingTransports: true,			// uwzglednij przychodzace transporty (tak - true, nie - false)
	overFlowThreshold: 75,						// % pojemnosci spichlerza, powyzej ktorego zapobiegaj przelewaniu sie
	extendedOptimization: true,					// czy optymalizacja moze generowac dodatkowych odbiorcow (wiecej klikania)
	minSummon: 0,								// minimalne wezwanie
	debug: true
};

$.getScript('https://media.innogamescdn.com/com_DS_PL/skrypty/Dysponent_Surowcowy.js');
void(0);
