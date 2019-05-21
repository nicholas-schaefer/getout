# Get Out - [Click to View Live App](https://nicholas-schaefer.github.io/getout)

##What is it?

**Get Out** is a trip planning weather & events app designed for business travelers who want to find fun in unfamiliar cities. 

The app's form requests the following information for each upcoming trip:
* Arrival Date
* Departure Date
* Destination City
* Desired Activity

![alt text](/assets/images/user-guide-images/form-inputs.jpg "form-inputs")


**Get Out** utilizes Ajax calls to simulatenously return data from both the Open Weather Map and Eventbrite API's for the user's selected city. The event listings are based on the user's "desired activity" during the date range they declared they would be in that city. Clicking each entry reveals a drop down with summary details and a link to the full Eventbrite listing. The top weather carousel, however, lists the current 5-day forecast at 3-hour intervals. This is because weather forecasts are largely speculative beyond this time frame(and because it's a free developer API!) 

Fortunately, **Get OUT** automatically saves all searches to local storage, which means that a user can plan multiple trips months out and then simply reopen the website a day before the trip for the most current weather information. This will allow them to decide if the weather's dry enough for that running meetup they were tracking. The updated weather forecast will also help them pack the appropriate travel attire (this is particuarly helpful if the user has planned a multi-city trip as they now have all the latest, relevant forecast data on one page.)

![alt text](/assets/images/user-guide-images/search-results.jpg "search-results")

![alt text](/assets/images/user-guide-images/expanded-event.jpg "expanded-event")

## Future Directions
1. Limited activity search:
Instead of allowing users to type their desired activity into the search box, it may be better to provide a defined dropdown list of possible activities. This would allow for better integration with Eventbrite, thus ensuring that individuals looking to run and entering "running" don't see results for "running a meeting."

2. Suggested deals and monetization with Groupon Api:
A more limited desired acitivity search field would also facilitate integration with the Groupon Api. If a user is searching for "running" in Chicago, we can provide them with added value by recommending fitness deals in Chicago during those dates (e.g. a yoga class discount from Groupon). If an individual purchasing that deal is referred from "Get Out", then "Get Out"'s creaters would receive a commision from Groupon.

## How to Use
No Installation necessary. Open app by clicking on url link at the top of this guide and follow all form and prompt instructions.

## Tech Stack
Api's:
* [Open Weather Map "5 day 3/hour forecast" Api](https://openweathermap.org/forecast5). The Open Weather Map Api allows users to get weather forecasts for multiple cities. **Get Out** utilizes the "5 day 3/hour forecast" API to find weather by city.
* [Eventbrite Api](https://www.eventbrite.com/platform/api): The Eventbrite API is REST-based, uses OAuth2 for authentication, and always returns responses in JSON. [Eventbrite](https://www.eventbrite.com/): Eventbrite is a global platform for live experiences that allows anyone to create, share, find and attend events that fuel their passions and enrich their lives.  **Get Out** utilizes the user's "desired activity" entry in the eventbrite query search string. Sleek and simple design was chosen over allowing multiple search parameters, with the consequence that a user searching for "running" may see results for "running events." Fortunately returned listings are sorted by relevance and Eventbrites search alogrithim is smart enough to prioritize running(i.e. jogging) events.
CSS Framework:
* [Materialize](https://materializecss.com/): Materialize is a modern responsive CSS framework based on Material Design by Google. **Get Out** utilizes materialize for both its sleek styling and several of it's built-in features. Both the date picker modals and dynamically generated weather carousels were quick to code and customize.

![alt text](/assets/images/user-guide-images/datepicker-modal.jpg "datepicker-modal")

## How it Works
**Get Out** dynamically generates content for the intially empty div "#eventContainer" upon each form submission. The results of each search are placed within a div called "#AwesomeNewDiv(x)" inside of "#eventContainer" wherein (x) is a counter variable incremented on each successive search. Each "#AwesomeNewDiv" contains:
* 1. Weather Carousel
* 2. Event Listing
* 3. "Clear Above Search" Button (runs function that deletes containing div, i.e. Weather carousel, Event Listing, and itself)

All three items are pushed into separate arrays that are then stored in local storage(Weather Carousel and Event Listings have their API query strings pushed, while button array hold's "Clear Above Search"'s html.) Upon page load/refresh local storage is checked and if app determines their is content saved in local storage then those api calls are called again and the user's previous queries are "refreshed." 

### Code Sample (from app.js)

```js
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
```
