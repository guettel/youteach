/*

youteach.js -- version 06/2020

A simple tool to synchronise YouTube videos and Jupyter Notebooks in the browser. Also supports integration of the repl.it code editor.

Copyright (c) 2020 Stefan Guettel

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

// This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// This function creates an <iframe> (and YouTube player) after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
	  videoId: ytVideoId,
	  modestbranding: 1,
	  rel: 0,
	  playsinline: 1,
	  events: {
		'onReady': onPlayerReady,
		'onStateChange': onPlayerStateChange
	  }
	});
}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
	event.target.playVideo();
}

// The API calls this function when the player's state changes. The function indicates when playing a video (state=1).
var syncTimer;
function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.PLAYING) {
		autoSync();
		syncTimer = setInterval(autoSync, 2000);
	}
	else clearInterval(syncTimer);
}

var lastanchor = '';

function autoSync() {
	ct = player.getCurrentTime();
	m = Math.floor(ct/60);
	s = Math.round(ct - m*60);
	if (m < 10) m = '0'+String(m);
	if (s < 10) s = '0'+String(s);
	cts = String(m) + ':' + String(s); // current timestamp
	console.log('cts: '+cts);

	var anchor = '';
	for (var i = 0; i < tslist.length; i++) {
		ts = tslist[i].substring(0,5);
		if (cts >= ts) anchor = tslist[i].substring(6);
		else break;
	}
	console.log('anchor: ' + anchor);
	if (lastanchor != anchor) {
		lastanchor = anchor;
		scrollToAnchor(anchor);
	}
}

function scrollToAnchor(anchor) {
	try {
			offs = $('#nb').contents().find('a[href="#'+anchor+'"]').offset().top - 30;
			$("#nb").contents().find("html,body").animate({ scrollTop: offs}, 2000);
			$('#linklist a').removeClass('active');
			var anchorid = anchor.replace(/[^a-z]+|\s+/gmi, '');
			$('#'+anchorid).addClass('active');
			console.log(offs);
		} catch(err) {
			console.log('didnt manage to scroll to '+anchor);
		}
}

function seek(anchor,tsp) {
	try {
		scrollToAnchor(anchor);
		player.seekTo(tsp,1);
	} catch(err) {
		console.log('didnt manage to seek to '+anchor);
	}
}
	  
$(document).ready(function() {

	// make panels resizable
	$(".panel-left").resizable({
	   handleSelector: "#splitter1",
	   resizeHeight: false
	});
	$(".panel-middle").resizable({
	   handleSelector: "#splitter2",
	   resizeHeight: false
	});
	
	// deal with the linklist
	$('#nb').ready(function() {
		$('#nb').attr('src', notebookUrl);
		$('#code').attr('src', replitUrl);
		for (var i = 0; i < tslist.length; i++) {
			var ts = tslist[i].substring(0,6).trim();
			tsp = ts.split(':');
			tsp = 60*parseInt(tsp[0]) + parseInt(tsp[1]);
			var anchor = tslist[i].substring(6).trim();
			var anchortext = anchor.replace(/-/g," ");
			anchortext = anchortext.replace(/%22/g,"&quot;");
			var anchorid = anchor.replace(/[^a-z]+|\s+/gmi, '');
			$( "#linklist" ).append('<a href="javascript:seek(\''+anchor+'\','+tsp+');" id="'+anchorid+'">'+ts+' '+anchortext+'</a>');
		}
		$( "#linklist" ).append('<br><small><a href="https://github.com/guettel/youteach/" target="_blank">YouTeach.js 06/2020</a></small>');
	});
	
}); 