
window.spotifyModule = {
  //artist arrays
  Artists: [
    "The Rolling Stones"
  ],

  albumArray: [],
  init: function() {
    var self = this;
    $.each(self.Artists, function(index, artist) {
      self.callAjax(artist, "alt");
    });
  },
  callAjax: function(artist, type) {
    var self = this;
    $.ajax({        
      url: 'https://api.spotify.com/v1/search?',
      data: {
        q: 'artist:' + artist,
        type: 'album',
        market: "US"
      },
      success: function(response) {
        self.formatAlbums(response, artist, type);
      },

      error: function() { 
        console.log("An unknown error occured getting this info"); 
      }
    });
  },
  formatAlbums: function(response, artist, type) {
    var albumWrapper = $(".albumWrapper");
    var self = this;

    $.each(response.albums.items, function(i, item) {
      if(item.album_type === "single") {
        return;
      }
      for(var i = 0; i < self.albumArray.length; i++) {
        if((self.albumArray[i].indexOf(item.name.replace(/\s\(([^)]+)\)/, ""))) >= 0) {
          return;
          break;
        }
      }
      var content = "<div class='album " + item.name.toLowerCase().replace(/\s+/g, "") + " " + artist.toLowerCase().replace(/\s+/g, "") + "' data-album-url='" + item.href + "' style='background: url(" + item.images[1].url + "); width: " + item.images[1].width + "px; height: " + item.images[1].height + "px;' data-genre='" + type + "'><div class='overlay'></div><div class='info'><span>" + artist + "</span><br><span>" + item.name + "</span></div></div>";
      albumWrapper.append(content);
      self.albumArray.push(item.name.replace(/\(([^)]+)\)/, ""));
    });
  },
  viewAlbum: function(albumURL) {
    var self = this;

    $.ajax({        
      url: albumURL,

      success: function(response) {
        self.formatModal(response);
      },

      error: function() { 
        console.log("An unkown error occured getting this info"); 
      }
    });
  },

  formatModal: function(response) {
    
    var self = this,
        modal = $(".albumModal"),
        tracks = "";
    modal.html("");

    $.each(response.tracks.items, function(i, item) {

      tracks += "<div data-audio='" + item.preview_url + "' class='track track-" + item.track_number + "'><span class='trackNumber'>" + item.track_number + ". </span><span class='trackName'>" + item.name + "</span><span class='time'>" + self.msToMinutes(item.duration_ms) + "</span></div>";
    });

    var content = "<div class='modalContents'><i class='fa fa-close'></i><i class='playPause fa'></i><div class='albumart' style='background: url(" + response.images[1].url + "); width: " + response.images[1].width + "px; height: " + response.images[1].height + "px;'></div><div class='info'><span>" + response.name + "</span><span>" + response.artists[0].name + "</span><span>" + self.convertDate(response.release_date, response.release_date_precision) + "</span></div><div class='tracks'>" + tracks + "</div></div>";

    modal.html(content).show();
    $(".modalOverlay").show();
    $("body").css("overflow", "hidden");
  },

  msToMinutes: function(ms) {
    var self = this,
        ms = ms;

    ms = 1000*Math.round(ms/1000); // round to nearest second
    var d = new Date(ms);

    return(d.getUTCMinutes() + ':' + self.addZero(d.getUTCSeconds()));
  },

  addZero: function(number) {
    if (number < 10) {
      number = "0" + number;
    }
    return number;
  },
  
  convertDate: function(date, accuracy) {
    if(accuracy === "day") {
      var dateArray = [];
      var newDate = date;
      
      newDate = new Date(newDate).toUTCString();
      newDate = newDate.split(" ");
      dateArray.push(newDate);      
      newDate = (dateArray[0][0] + " " + dateArray[0][2] + " " + dateArray[0][1] + " " + dateArray[0][3]);
      
      return newDate;
      
    } else {
      return date;
    }
  }
};
window.togglePlayPause = {
  boolean: false,

  toggle: function() {
    if(this.boolean == false) {
      $(".playPause").removeClass("pause").addClass("play");
      $(".audio").trigger('play');
      this.boolean = true;
    } else {
      $(".playPause").removeClass("play").addClass("pause");
      $(".audio").trigger('pause');
      this.boolean = false;
    }
  },

  play: function(source, $this) {    
    this.boolean = true;
    $(".playing").removeClass("playing");
    $this.addClass("playing");
    $(".playPause").addClass("play");
    $(".audio").attr("src", source).trigger('play');
  },

  pause: function() {    
    this.boolean = false;
    $(".playing").removeClass("playing");
    $(".playPause").removeClass("play").removeClass("pause");
    $(".audio").trigger('pause');
  }
};

var watchers = function() {
  $(".album").click(function() {
    var albumUrl = $(this).attr('data-album-url');
    window.spotifyModule.viewAlbum(albumUrl);

  });

  $(".track").click(function() {
    var $this = $(this);
    var source = $this.attr("data-audio");

    if($(".audio").attr("src") === source) {
      window.togglePlayPause.toggle();
    } else {
      window.togglePlayPause.play(source, $this);
    }
  });

  $(".modalOverlay, .fa-close").click(function() {
    $(".modalOverlay, .albumModal").hide();
    $("body").css("overflow", "visible");
    window.togglePlayPause.pause();
  });

  $(".playPause").click(function() {
    window.togglePlayPause.toggle();
  });
  
  var timeoutClear;
  $(".searchInput").keyup(function() {
    var keyword = $(this).val().toLowerCase();

    clearTimeout(timeoutClear);
    timeoutClear = setTimeout(function() {

      if(keyword || !keyword === "undefined") {
            
      }
    },1000);
  });
};

$(function() {
  window.spotifyModule.init();
});
$(document).ajaxStop(function() {
  watchers();
});
