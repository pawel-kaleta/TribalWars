javascript:

//	author:			PabloCanaletto
//	version:		1.0.0
//	description:	Dodaje graczy do książki adresowej, uruchamiamy w Książce Adresowej. Musisz mieć co najmniej 1 gracza ju dodanego ręcznie. | Add players to Adress Book, lauch in Adress Book. Requires 1 manually added allready.

var mailing_list = 'gracz a;gracz b;kolejny gracz;i tak dalej';

// NIE TYKAĆ CO PONIŻEJ | DO NOT EDIT BELOW
mailing_list = mailing_list.split(';');
var i=0
var h=$("#content_value > table > tbody > tr > td:nth-child(2) > form:nth-child(4) > input[type=hidden]:nth-child(3)")[0].value;


function add_player() {
	if (i>=mailing_list.length) { 
		console.log('finito');
		UI.SuccessMessage('To już wszyscy!');
		return;
	}
	
	console.log(mailing_list[i]);
	UI.SuccessMessage('Dodany gracz: ' + mailing_list[i]);
	
	let form_data = {};
	form_data['name'] = mailing_list[i];
	form_data['h'] = h;
	
	i++;
	
	$.post('/game.php?village=27143&screen=mail&mode=address&action=add_address_name', form_data, setTimeout(function() { add_player(); }, 300));
}

add_player();
