var savedLocations = [];
var currentLoc;

function initialize() {
    savedLocations = JSON.parse(localStorage.getItem("weathercities"));
    if (savedLocations) {
        currentLoc = savedLocations[savedLocations.length - 1];
        showPrevious();
        getCurrent(currentLoc);
    }
}

function success(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=22277b60fa20215c238aefc64778ca75";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        currentLoc = response.name;
        saveLoc(response.name);
        getCurrent(currentLoc);
    });

}

function showPrevious() {
    if (savedLocations) {
        $("#prevSearches").empty();
        var btns = $("<div>").attr("class", "list-group");
        for (var i = 0; i < savedLocations.length; i++) {
            var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedLocations[i]);
            if (savedLocations[i] == currentLoc){
                locBtn.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                locBtn.attr("class", "list-group-item list-group-item-action");
            }
            btns.prepend(locBtn);
        }
        $("#prevSearches").append(btns);
    }
}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=22277b60fa20215c238aefc64778ca75";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            savedLocations.splice(savedLocations.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(savedLocations));
            initialize();
        }
    }).then(function (response) {
        //create the card
        var currCard = $("<div>").attr("class", "card bg-light");
        $("#earthForecast").append(currCard);

        //add location to card header
        var currCardHead = $("<div>").attr("class", "card-header").text("Current weather in " + response.name);
        currCard.append(currCardHead);

        var cardRow = $("<div>").attr("class", "row");
        currCard.append(cardRow);

        //get icon for weather conditions
        var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

        var imgDiv = $("<div>").attr("class", "col-md-4").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        cardRow.append(imgDiv);

        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
        //display city name
        cardBody.append($("<h3>").attr("class", "card-title").text(response.name));
        var currdate = moment(response.dt, "X").format("dddd, MMMM Do YYYY, h:mm a");
        cardBody.append($("<p>").attr("class", "card-text").append($("<small>").attr("class", "text-muted").text(currdate)));
        //display Temperature
        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
        //display Humidity
        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));
        //display Wind Speed
        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));

        var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=22277b60fa20215c238aefc64778ca75&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: uvURL,
            method: "GET"
        }).then(function (uvresponse) {
            var uvindex = uvresponse.value;
            var bgcolor;
            if (uvindex <= 3) {
                bgcolor = "green";
            }
            else if (uvindex >= 3 || uvindex <= 6) {
                bgcolor = "yellow";
            }
            else if (uvindex >= 6 || uvindex <= 8) {
                bgcolor = "orange";
            }
            else {
                bgcolor = "red";
            }
            var uvdisp = $("<p>").attr("class", "card-text").text("UV Index: ");
            uvdisp.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + bgcolor)).text(uvindex));
            cardBody.append(uvdisp);

        });

        cardRow.append(textDiv);
        getForecast(response.id);
    });
}

function getForecast(city) {
    //get 5 day forecast
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=22277b60fa20215c238aefc64778ca75";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //add container div for forecast cards
        var newrow = $("<div>").attr("class", "forecast");
        $("#earthForecast").append(newrow);

        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("MMM Do"));
                newCard.append(cardHead);

                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                newCard.append(cardImg);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

function clear() {
    $("#earthForecast").empty();
}

function saveLoc(loc){
    if (savedLocations === null) {
        savedLocations = [loc];
    }
    else if (savedLocations.indexOf(loc) === -1) {
        savedLocations.push(loc);
    }
    //save the new array to localstorage
    localStorage.setItem("weathercities", JSON.stringify(savedLocations));
    showPrevious();
}

$("#searchbtn").on("click", function () {
    //grab the value of the input field
    var loc = $("#searchinput").val().trim();
    if (loc !== "") {
        //clear the previous forecast
        clear();
        currentLoc = loc;
        saveLoc(loc);
        //clear the search field value
        $("#searchinput").val("");
        //get the new forecast
        getCurrent(loc);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    currentLoc = $(this).text();
    showPrevious();
    getCurrent(currentLoc);
});

initialize();