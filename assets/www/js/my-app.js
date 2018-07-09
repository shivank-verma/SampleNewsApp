// Code for platform detection
var isMaterial = Framework7.prototype.device.ios === false;
var isIos = Framework7.prototype.device.ios === true;

// Add the above as global variables for templates
Template7.global = {
  material: isMaterial,
  ios: isIos,
};

var mainView;

// A template helper to turn ms durations to mm:ss
// We need to be able to pad to 2 digits
function pad2(number) {
  if (number <= 99) { number = ('0' + number).slice(-2); }
  return number;
}

// Now the actual helper to turn ms to [hh:]mm:ss
function durationFromMsHelper(ms) {
  if (typeof ms != 'number') {
    return '';
  }
  var x = ms / 1000;
  var seconds = pad2(Math.floor(x % 60));
  x /= 60;
  var minutes = pad2(Math.floor(x % 60));
  x /= 60;
  var hours = Math.floor(x % 24);
  hours = hours ? pad2(hours) + ':' : '';
  return hours + minutes + ':' + seconds;
}

// A stringify helper
// Need to replace any double quotes in the data with the HTML char
//  as it is being placed in the HTML attribute data-context
function stringifyHelper(context) {
  var str = JSON.stringify(context);
  return str.replace(/"/g, '&quot;');
}

// Finally, register the helpers with Template7
Template7.registerHelper('durationFromMs', durationFromMsHelper);
Template7.registerHelper('stringify', stringifyHelper);

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

if (!isIos) {
  // Change class
  $$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
  // And move Navbar into Page
  $$('.view .navbar').prependTo('.view .page');
}

// Initialize app
var myApp = new Framework7({
  material: isIos? false : true,
  template7Pages: true,
  precompileTemplates: true,
  swipePanel: 'left',
  swipePanelActiveArea: '30',
  swipeBackPage: true,
  animateNavBackIcon: true,
  pushState: !!Framework7.prototype.device.os,
});

function init() {
  // Add view
  mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true,
    domCache: true,
  });

  // Handle Cordova Device Ready Event
  $$(document).on('deviceready', function deviceIsReady() {
    console.log('Device is ready!');
  });
  $$(document).on('click', '.panel .search-link', function searchLink() {
    // Only change route if not already on the index
    //  It would be nice to have a better way of knowing this...
    var indexPage = $$('.page[data-page=index]');
    if (indexPage.hasClass('cached')) {
      mainView.router.load({
        pageName: 'index',
        animatePages: false,
        reload: true,
      });
    }
  });

  $$(document).on('click', '.panel .favorites-link', function searchLink() {
    // @TODO fetch the favorites (if any) from localStorage
    var favorites = JSON.parse(localStorage.getItem('favorites'));
    mainView.router.load({
      template: myApp.templates.favorites,
      animatePages: false,
      context: {
        tracks: favorites,
      },
      reload: true,
    });
  });
  $$(document).on('submit', '#search', searchSubmit);
}

/**
 * Search
 *  - functionality for the main search page
 */

function searchSubmit(e) {
  var formData = myApp.formToJSON('#search');
  e.preventDefault();
  

  if (formData.filter === 'all') {

    $$('input').blur();
    myApp.showPreloader('Loading');
    getMostViewedArticles();
  } else if (!formData.term) {
    myApp.alert('Please enter a search term', 'Search Error');
    return;
  }
  else if (formData.term || formData.filter === search )
  {
    $$('input').blur();
    myApp.showPreloader('Searching');

    var query = formData.term;
    getMostViewedArticles();
  }
  delete formData.filter;
  
  

}

var seacharticles = function (query)
{
  
  var url = "http://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=8c7f3169ba074edf980f1c4a4b65be34&q=" + query + "&page=1";



  $$.ajax({
    dataType: 'json',
    url: url,
    success: function searchSuccess(resp) {

      var results = { count: 0 };
      results.count = resp.num_results === 25 ? "25 (max)" : resp.num_results;
      results.items = resp.results;
      myApp.hidePreloader();
      mainView.router.load({
        template: myApp.templates.results,
        context: {
          articles: results,
        },
      });
    },
    error: function searchError(xhr, err) {
      myApp.hidePreloader();
      myApp.alert('An error has occurred', 'Error');
      console.error("Error on ajax call: " + err);
      console.log(JSON.stringify(xhr));
    }
  });


}

var getMostViewedArticles = function ()
{

  var url = "http://api.nytimes.com/svc/mostpopular/v2/mostviewed/all-sections/7.json?api-key=8c7f3169ba074edf980f1c4a4b65be34"

  $$.ajax({
    dataType: 'json',
    url: url,
    success: function searchSuccess(resp) {

      
      var results = { count: 0 };
      results.count = resp.num_results === 25 ? "25 (max)" : resp.num_results;
      results.items = resp.results;
      myApp.hidePreloader();
      mainView.router.load({
        template: myApp.templates.results,
        context: {
          articles: results,
        },
      });
    },
    error: function searchError(xhr, err) {
      myApp.hidePreloader();
      myApp.alert('An error has occurred', 'Error');
      console.error("Error on ajax call: " + err);
      console.log(xhr);
    }
  });


}

