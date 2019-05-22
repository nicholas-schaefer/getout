document.addEventListener('DOMContentLoaded', function () {
  //Application Dynamically generates 3 items on each search:
  // - "OpenWeatherMaP API" (weatherQueryURL) 
  // - "Eventbrite API" (queryURLComplete)
  // - "Clear Above Search" button (buttonHtml)
  var weatherQueryURL;
  var queryURLComplete;
  var buttonHtml;

  //In order for page reload and our "Refresh" button to function, these variables are
  //pushed into corresponding arrays and then copied into local storage.
  //"Clone" Arrays are duplicate arrays created to empty original arrays so that "refresh" function
  //does not duplicate entries in orginal arrays. 

  var queryURLArray = [];
  var queryURLArrayClone = [];
  var weatherQueryURLArray = [];
  var weatherQueryURLArrayClone = [];
  var buttonArray = [];
  var buttonArrayClone = [];

  //Subsequent variables convert user form submission into correct ajax calls for 
  //"OpenWeatherMaP API" (weatherQueryURL) & "Eventbrite API" (queryURLComplete)

  var dateBeginTrip;
  var dateEndTrip;
  var location;
  var interest;
  var queryURLBeginning;
  var queryURLUserInterestSubmission;
  var queryURLUserInterestConverted;
  var queryURLUserLocationSubmission;
  var queryURLUserLocationConverted;
  var queryURLUserStartDateSubmission;
  var queryURLUserStartDateConverted;
  var queryURLUserEndDateSubmission;
  var queryURLUserEndDateConverted;
  var queryURLReturnVenue;
  var queryUrlKey = "&token=56NL2TKKYLOWEWCPKX2C";

  //Counter Variables Ensure Dynamically Created Divs all have different IDs 
  var counterDivs = 0;
  var counterCarousel = 0;


  // Materialize's DatePicker creates modal allowing users to select trip dates, also converts selection to appropriate query url format
  var elems = document.querySelectorAll('.datepicker');
  M.Datepicker.init(elems, {
    format: "yyyy-mm-dd"
  });

  //Buttons with data id = "DestroyMe" remove containing div, allowing users to delete search weather and event results for one search query
  //Buttons also contain data attributes of their corresponding search parameters.
  //Using "Splice" we remove those items from the arrays and local storage so that a "refresh" will not bring them back
  $(document).on("click", ".btn", function () {
    if ($(this).data("id") === "buttonClearDiv") {
      weatherQueryURLArray.splice(weatherQueryURLArray.indexOf($(this).data("weatherqueryurl")), 1);
      queryURLArray.splice(queryURLArray.indexOf($(this).data("queryurl")), 1);
      buttonArray.splice(buttonArray.indexOf($(this).data("buttonHtml")), 1);
      $(this).closest('.DestroyMe').remove();

      localStorage.setItem("weatherQueryURLArray", JSON.stringify(weatherQueryURLArray));
      localStorage.setItem("queryURLArray", JSON.stringify(queryURLArray));
      localStorage.setItem("buttonArray", JSON.stringify(buttonArray));

    }
  });
  //ButtonSearch is the search/submit function which calls and subsequently displays both ajax calls.
  $("#buttonSearch").on("click", (function () {
    buildQueryURL();
  }));
  //ButtonRefreshAllSearches "refreshes" the search by emptying largest div and recalling currently visible searches with new ajax calls.
  $("#buttonRefreshAllSearches").on("click", (function () {
    reloadQueryURL();
  }));
  //ButtonClearAllSearches Clears all page results and local storage entries.
  $("#buttonClearAllSearches").on("click", (function () {
    $("#eventContainer").empty();
    localStorage.clear();
    counterDivs = 0;
    counterCarousel = 0;
    queryURLArray = [];
    queryURLArrayClone = [];
    weatherQueryURLArray = [];
    weatherQueryURLArrayClone = [];
  }));

  //On Page load this is the only function that runs automatically.
  //If there's anything in local storage it will populate page with those results.
  loadLocalStorage();
  function loadLocalStorage() {
    if (localStorage.getItem("weatherQueryURLArray") === null) {
      console.log("nothing in local storage to repopulate");
    } else {
      console.log("found data in local storage - repopulating page with past queries");
      reloadQueryURL();
    }
  }


  //Allows users to refresh the current page with existing queries pushed into weatherQueryURLArray and queryURLArray.
  //These Arrays allow us to bypass "buildQueryURL()" as they already contain everything needed for new Ajax calls and associated buttons.
  //Logic further explained in comments next to variables at document's head.
  function reloadQueryURL() {
    $("#eventContainer").empty();
    weatherQueryURLArray = JSON.parse(localStorage.getItem("weatherQueryURLArray"));
    queryURLArray = JSON.parse(localStorage.getItem("queryURLArray"));
    buttonArray = JSON.parse(localStorage.getItem("buttonArray"));

    weatherQueryURLArrayClone = Array.from(weatherQueryURLArray);
    queryURLArrayClone = Array.from(queryURLArray);
    buttonArrayClone = Array.from(buttonArray);

    weatherQueryURLArray = [];
    queryURLArray = [];
    buttonArray = [];

    counterDivs = 0;

    for (i = 0; i < (weatherQueryURLArrayClone.length); i++) {
      weatherQueryURL = weatherQueryURLArrayClone[i];
      queryURLComplete = queryURLArrayClone[i];
      buttonHtml = buttonArrayClone[i];
      runWeatherAJAX(counterDivs);
      runEventAJAX(counterDivs, buttonHtml);
      counterDivs++;
    }
    weatherQueryURLArray = Array.from(weatherQueryURLArrayClone);
    weatherQueryURLArrayClone = [];

    queryURLArray = Array.from(queryURLArrayClone);
    queryURLArrayClone = [];

    buttonArray = Array.from(buttonArrayClone);
    buttonArrayClone = [];
  }


  //Function converts form submission inputs into urls for 2 api calls (OpenWeatherMap & Eventbrite)
  function buildQueryURL() {
    dateBeginTrip = $("#dateBeginTrip").val().trim();
    dateEndTrip = $("#dateEndTrip").val().trim();
    location = $("#location").val().trim();
    interest = $("#interest").val().trim();

    queryURLBeginning = "https://www.eventbriteapi.com/v3/events/search/";

    queryURLUserInterestSubmission = interest;
    queryURLUserInterestConverted = "?q=" + queryURLUserInterestSubmission;

    queryURLUserLocationSubmission = location;
    queryURLUserLocationConverted = "&location.address=" + queryURLUserLocationSubmission;

    queryURLUserStartDateSubmission = dateBeginTrip + "T00:00:00";
    queryURLUserStartDateConverted = "&start_date.range_start=" + queryURLUserStartDateSubmission;

    queryURLUserEndDateSubmission = dateEndTrip + "T23:59:59";
    queryURLUserEndDateConverted = "&start_date.range_end=" + queryURLUserEndDateSubmission;

    queryURLReturnVenue = "&expand=venue"

    queryURLComplete =
      queryURLBeginning +
      queryURLUserInterestConverted +
      queryURLUserLocationConverted +
      queryURLUserStartDateConverted +
      queryURLUserEndDateConverted +
      queryURLReturnVenue +
      queryUrlKey;

    weatherQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + location + "&units=imperial&appid=a21e75dd0163c2310385233b13d2134e";

    buttonHtml = "<div class = 'buttonCenter'><button class = 'btn red' data-id = 'buttonClearDiv' data-weatherqueryurl =" + weatherQueryURL + " data-queryurl =" + queryURLComplete + ">Clear Above Search</button><hr></div>";

    runWeatherAJAX(counterDivs);
    runEventAJAX(counterDivs, buttonHtml);

    weatherQueryURLArray.push(weatherQueryURL);
    localStorage.setItem("weatherQueryURLArray", JSON.stringify(weatherQueryURLArray));

    queryURLArray.push(queryURLComplete);
    localStorage.setItem("queryURLArray", JSON.stringify(queryURLArray));

    buttonArray.push(buttonHtml);
    localStorage.setItem("buttonArray", JSON.stringify(buttonArray));

    counterDivs++;
  }

  //Function creates an incremented "AwesomeNewDiv'_'" in which to place query weather results
  function runWeatherAJAX(divId) {
    $.ajax({
      url: weatherQueryURL,
      method: "GET"
    }).then(function (weatherResponse) {
      $("#eventContainer").append("<div class = 'DestroyMe' id = AwesomeNewDiv" + divId + ">");
      $("#AwesomeNewDiv" + divId).append("<h3>5-Day Weather Forecast for " + weatherResponse.city.name + "</h3>");
      $("#AwesomeNewDiv" + divId).append("<div class = 'carousel' id=CarouselDiv" + divId + ">");

      for (i = 0; i < (weatherResponse.list).length; i++) {
        counterCarousel++;
        $("#CarouselDiv" + divId).append("<div class = 'carousel-item cyan white-text' href='#' id=CarouselItem" + counterCarousel + ">");
        $("#CarouselItem" + counterCarousel).append("<p class='white-text'>" + weatherResponse.list[i].dt_txt + "</p>");
        $("#CarouselItem" + counterCarousel).append("<p><img src = 'https://openweathermap.org/img/w/" + weatherResponse.list[i].weather[0].icon + ".png' class='floatLeft' alt='WeatherIcon'></p>");
        $("#CarouselItem" + counterCarousel).append("<h5>" + weatherResponse.list[i].weather[0].description + "</h5>");
        $("#CarouselItem" + counterCarousel).append("<p class='white-text'>Temp= " + weatherResponse.list[i].main.temp + "°F</p>");
      }
      $('#CarouselDiv' + divId).carousel();
    }, function () {
      console.log("Error, weather ajax call city not found");
      alert("City Not Found, Click 'clear all searches' button to proceed");
    });
  }

  //Function places event date in incremented "AwesomeNewDiv'_'" created via runWeatherAJAX().
  function runEventAJAX(divId, buttonHtml) {
    $.ajax({
      url: queryURLComplete,
      method: "GET"
    }).then(function (response) {
      $("#AwesomeNewDiv" + divId).append('<h4>"Get Out!" to these Events during your trip</h4>');
      $("#AwesomeNewDiv" + divId).append("<ul class='collapsible' id = AwesomeNewEventDiv" + divId + ">");

      for (i = 0; i < (response.events).length; i++) {
        $("#AwesomeNewEventDiv" + divId).append("<li><div class='collapsible-header'><i class='material-icons'>expand_more</i>" + response.events[i].start.local + " " + response.events[i].name.text + "</div>"
          + "<div class='collapsible-body'><span>" + response.events[i].description.text + "</span></div>"
          + "<div class='collapsible-body'><i class='material-icons'>place</i><span>" + response.events[i].venue.name + ": " + response.events[i].venue.address.localized_address_display + "</span></div>"
          + "<div class='collapsible-body'><i class='material-icons'>exit_to_app</i><span><a href='" + response.events[i].url + "'target=_blank>View Full Eventbrite Listing</span></div></li>");
      }
      $('.collapsible').collapsible();
      $("#AwesomeNewDiv" + divId).append($(buttonHtml));
    });
  }
});

