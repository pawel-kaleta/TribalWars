// ==UserScript==
// @name         Podgląd raportów na ekranie wioski
// @version      1.0
// @description  This script allows to preview reports in info_village tab by hovering over it's link with a mouse. It will be displayed in a preview box on the left.
// @author       PabloCanaletto
// @match        https://*.plemiona.pl/game.php?*screen=info_village*
// ==/UserScript==

// You are free to use this script in any way you like and to submit changes.
// I would only appreciate you to leave this notification about my orginal authorship untouched
// with the whole history of changes.

(function() {
    'use strict';

    var Report = {
        PREVIEW_DESIRED_SIZE: 518,
        PREVIEW_MIN_SCALE: .70,
        previewing: !1,
        hover: !1,
        loaded: !1,
        Data: '',
        link: {},
        init: function() {
			var report_links = document.getElementsByClassName("report-link");
			for(var i=0; i<report_links.length; i++) {
				var report_preview = document.querySelector("#id_"+report_links[i].getAttribute('data_id'));
				report_preview.addEventListener("mouseenter", function() {
					Report.hover = true;
				});
				report_preview.addEventListener("mouseleave", function() {
					Report.hover = false;
					Report.closePreview();
				});

				report_links[i].addEventListener("mouseenter", function() {
					var e = this;
					Report.hover = true;
					Report.previewing = e.getAttribute('data_id');
					setTimeout(function() {
						if(Report.hover) { Report.showPreview(e); }
					}, 100);
				});
				report_links[i].addEventListener("mouseleave", function() {
					Report.hover = false;
						if(Report.previewing) { Report.closePreview(); }
				});
			}
        },
        showPreview: async function(e) {
            if (Report.previewing === e.getAttribute('data_id')) {
				Report.link = e;
				e.style.color = "#e01f0f";

				var n = document.querySelector("#id_"+e.getAttribute('data_id'));
				n.style.display = null;
				n.style.transform = "scale(1)";

				var s = window.innerHeight;
				var t = e.closest("tr");
				var r = t.getBoundingClientRect().left;
				var i = r > Report.PREVIEW_DESIRED_SIZE ? 1 : r / Report.PREVIEW_DESIRED_SIZE;
				var j = n.getBoundingClientRect().height < s ? 1 : s / n.getBoundingClientRect().height;

				var scale = Math.min(i,j);
				if (scale < Report.PREVIEW_MIN_SCALE) { scale = Report.PREVIEW_MIN_SCALE; }
				n.style.transform = "scale(" + scale + ")";

				var a = t.getBoundingClientRect().left - Report.PREVIEW_DESIRED_SIZE * scale - 15;
				if (a < 0) { a = 0; }
				n.style.left = a + "px";

				var l = t.getBoundingClientRect().bottom;
				var c = n.getBoundingClientRect().height;

				if (s - c < 0) {
					l = (s - c) / 2;
				} else {
					l = l - c > 0 ? l - c : 0;
				}

				n.style.top = l + "px"

                setTimeout(function() {
                    Report.markRead(e);
                }, 3e3);
            }
        },
        markRead: async function(e) {
            if (Report.previewing === e.getAttribute('data_id')) {
                if (e.closest('td').childNodes[e.closest('td').childNodes.length-1].nodeValue != "") {
                    await fetch("https://" + window.location.host + "/game.php?screen=report&view=" + e.getAttribute('data_id'), {credentials: 'include'});
                    e.closest('td').childNodes[e.closest('td').childNodes.length-1].nodeValue = "";
                }
            }
        },
        closePreview: function() {
            Report.link.style.color = "#603000";
            Report.previewing = !1;
			document.querySelector("#id_"+Report.link.getAttribute('data_id')).style.display = "none";
        }
    };

    var div_p1 = `<div id="id_`;
    var div_p2 = `" class="report-preview" style="display: none; left: 0px; transform: scale(1.0);">
<div class="report-preview-content">`;
	var div_p3 = `</div></div>`;

    var rep = document.getElementById('report_table').getElementsByClassName('quickedit-label');

    var loading_gif = new Image();
    loading_gif.src = "https://dspl.innogamescdn.com/asset/a22f065/graphic/loading.gif";

	async function get_reports(n) {
        rep[n].closest('td').appendChild(loading_gif);
		rep[n].parentNode.classList.add('report-link');
        var id = rep[n].parentNode.href.split('=').slice(-1)[0];
        rep[n].parentNode.setAttribute("data_id", id);

		var report_preview = await fetch("https://" + window.location.host + "/game.php?screen=report&ajax=view&id=" + id, {credentials: 'include'}).then(response => response.json());
		report_preview = report_preview.dialog;

		document.querySelector('#report_table').insertAdjacentHTML('beforebegin', div_p1 + id + div_p2 + report_preview + div_p3);

		if (n+1 < rep.length) {
			setTimeout(function() {	get_reports(n+1); }, 200);
		} else {
			Report.init();
            loading_gif.remove();
		}
	}

	if (rep.length > 0) {
		get_reports(0);
	}

    var NewStyles = `
.report-preview {
	width: 518px;
	position: fixed;
	z-index: 17000;
	border: 9px solid #804000;
	-moz-border-image: url(https://dspl.innogamescdn.com/asset/2f403f4/graphic/popup/border_slim.png) 9 9 9 9 repeat;
	-webkit-border-image: url(https://dspl.innogamescdn.com/asset/2f403f4/graphic/popup/border_slim.png) 9 9 9 9 repeat;
	-o-border-image: url(https://dspl.innogamescdn.com/asset/2f403f4/graphic/popup/border_slim.png) 9 9 9 9 repeat;
	border-image: url(https://dspl.innogamescdn.com/asset/2f403f4/graphic/popup/border_slim.png) 9 9 9 9 repeat;
	-webkit-backface-visibility: hidden;
	-moz-backface-visibility: hidden;
	backface-visibility: hidden;
	transform-origin: left top;
	-webkit-font-smoothing: subpixel-antialiased;
}

.report-preview-content {
	background: #f4e4bc;
	padding: 5px;
	overflow: hidden;
}

.report-preview-content .no-preview {
	display: none;
}
`;

    var styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = NewStyles;
    document.head.appendChild(styleSheet);

})();