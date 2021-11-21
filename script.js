var temp
var loc;
var icon;
var type;
var info;

var m_date_doc = {}, m_date = {};
var m_img_doc = {}, m_img = {};
var m_temp_doc = {}, m_temp = {};
var m_state_doc = {}, m_state = {};

var DEBUG			= new Boolean(true); // Режим отладки.
var LANG			= 'en'; // Язык погоды.
var UPDATE_TIME		= 10; // Время автообновления погоды (в минутах).
var ROUND			= 0; // Оставлять цифр после запятой для градусов.

var WEATHER_KEY		= '0c5a5d40c673e6c34e6a99170e9ba710'; // API key: openweathermap.org
var IPINFO_TOKEN	= '59299db4f2693a'; // API key: ipinfo.io

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var month = ['January', 'February', 'March', 'April' , 'May', 'June', 'July', 'Augustus', 'September', 'October', 'November', 'December'];

function getloc()
{
	// Приблизительные координаты (в пределах города).
	$.get("https://ipinfo.io?token=" + IPINFO_TOKEN,
	function(response)
	{
		if (DEBUG) console.log(response);
				
		var prediction = {};
		prediction.loc = response.city;
		get_weather(response.loc.split(",")[0], response.loc.split(",")[1], prediction);
	}, "jsonp");
}

function get_weather(rough_latitude, rough_longitude, prediction)
{
	// Точные координаты.
	if ("geolocation" in navigator) // Функция поддерживается браузером.
	{
		navigator.geolocation.getCurrentPosition(geosuccess, geoerror);
		
		function geosuccess(position)
		{
			if (DEBUG) console.log(position);
			openweathermap(position.coords.latitude, position.coords.longitude, prediction);
		};
		
		function geoerror(position) // При запрете определять местоположение.
		{
			if (DEBUG) console.log(position);
			openweathermap(rough_latitude, rough_longitude, prediction);
		};
	} else // Не поддерживается браузером.
	{
		openweathermap(rough_latitude, rough_longitude, prediction);
	}
}

function openweathermap(lat, lon, prediction)
{
	$.get("https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=metric&lang=" + LANG + "&appid=" + WEATHER_KEY,
	function(response)
	{
		if (DEBUG) console.log(response);
		parse_weather(response, prediction);
	}, "jsonp");
}

function parse_weather(response, prediction)
{
	var cnt = 8 - (40 - response.cnt);
	var average = 0;
	
	if (prediction.loc != "") prediction.loc += ", ";
	prediction.loc += response.city.name;
	prediction.temp = (response.list[0].main.temp).toFixed(ROUND) + "&deg";
	prediction.icon = get_img_type(response.list[0].weather[0].id);
	prediction.info = getdata();
	prediction.type = response.list[0].weather[0].description;
	
	var dateTmp = new Date();
	for (var i = 0; i < 4; i++)
	{
		average = 0;
		for (var j = 0; j < 8; j++)
			average += response.list[cnt + i * 8 + j].main.temp;
		average /= 8;
		
		dateTmp.setDate(dateTmp.getDate() + 1);
		m_date[i] = days[dateTmp.getDay()] + ", " + dateTmp.getDate();
		m_img[i] = get_img_type(response.list[cnt + i * 8 + 4].weather[0].id);
		m_temp[i] = average.toFixed(ROUND) + "&deg";
		m_state[i] = response.list[cnt + i * 8 + 4].weather[0].description;
	}
	
	update(prediction);
	$(".preloading").fadeOut(1000);
	setTimeout(function() {$(".weather-app").fadeIn(1000);}, 1050);
}

function get_img_type(type)
{
	switch(true)
	{
		case (type < 300):
			return 12;
		case (type < 400):
			return 10;
		case (type < 600):
			return 14;
		case (type < 700):
			return 9;
		case (type < 800):
			return 4;
		case (type == 800):
			return 17;
		case (type < 900):
			return 18;
		default: 
			return 0;
	}
}

function getdata()
{
	var data = new Date();
	return "Last update: " + days[data.getDay()] + ", " + data.getDate() + " " + month[data.getMonth()] + ", " + ((data.getHours()<10?'0':'') + data.getHours()) + ":" + ((data.getMinutes()<10?'0':'') + data.getMinutes());
}

function update(prediction)
{
	// Текущий, 1 день.
	if (typeof(prediction.info) != "undefined") info.innerHTML = prediction.info; 
	if (typeof(prediction.loc) 	!= "undefined") loc.innerHTML = prediction.loc;
	if (typeof(prediction.type) != "undefined") type.innerHTML = prediction.type;
	if (typeof(prediction.icon) != "undefined") icon.src = "imgs/types/" + prediction.icon + ".png";
	if (typeof(prediction.temp) != "undefined")
	{
		temp.innerHTML = prediction.temp;
		temp.style = "";
	} else
		temp.style = "display: none;"
	
	// 2-5 день.
	for (var i = 0; i < 4; i++)
	{
		m_date_doc[i].innerHTML = m_date[i];
		m_temp_doc[i].innerHTML = m_temp[i];
		m_state_doc[i].innerHTML = m_state[i];
		m_img_doc[i].src = "imgs/types/" + m_img[i] + ".png";
	}
}

window.onload = function()
{
	info = document.getElementById("info");
	temp = document.getElementById("temperature");
	loc	 = document.getElementById("location");
	type = document.getElementById("type");
	icon = document.getElementById("icon");
	
	for (var i = 0; i < 4; i++)
	{
		m_date_doc[i] = document.getElementById("m_date_" + (i + 1));
		m_img_doc[i] = document.getElementById("m_img_" + (i + 1));
		m_temp_doc[i] = document.getElementById("m_temp_" + (i + 1));
		m_state_doc[i] = document.getElementById("m_state_" + (i + 1));
	}
	
	getloc();
	setInterval(function() { getloc(); }, UPDATE_TIME * 60000);
}

