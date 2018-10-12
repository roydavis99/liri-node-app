require("dotenv").config();
let Keys = require("./keys.js");
let Request = require("request");
let Moment = require("moment");
let Spotify = require("node-spotify-api");
let fs = require('fs');
//console.log(keys);
let spotify = new Spotify(Keys.spotify);

//let action = process.argv[2].toLowerCase().trim();

function GetUserInput(){
    let value = "";

    process.argv.slice(3).forEach(input => {
        value += input + ' ';
    });
    return value.trim();;
}

function Menu(){
    console.log("\nChoices are:" + 
            "\n\tmenu\n\tconcert-this |Artist Name|\n\tspotify-this-song |Song Name|" +
            "\n\tmovie-this |Movie Name|\n\tdo-what-it-says\n");
    LogIt("menu","","");
}

function ConcertThis(artist){
    let concertURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp"
    
    Request(concertURL, function(error, response, data){
        let result ='';
        if(!error && response.statusCode === 200){
            result = '---------------------------------';
            console.log('---------------------------------');
            //console.log(JSON.parse(data));
            JSON.parse(data).forEach(stop =>{
                result += "\n\t" + stop.venue.name;
                result += "\n\t" + stop.venue.city + " " + stop.venue.country;
                result += "\n\t" + Moment(stop.datetime).format("MM/DD/YYYY");
                result += "\n\t" + '---------------------------------';

            });
        } else {
            result = "Sorry, could not find the artist.";
        }
        LogIt("concert-this", artist, result);
    });

}

function SpotifyThisSong(song){
    if(song === ''){
        song = 'The Sign';
    }
    spotify.search({ type: 'track', query: song, limit: 1 }, function(err, data) {
        let result = "";
        if (err) {
            result = 'Sorry, could not find song.';
          
        }else{
        
       
            result += "\n\t" + data.tracks.items[0].artists[0].name; 
            result += "\n\t" + data.tracks.items[0].name; 
            result += "\n\t" + data.tracks.items[0].external_urls.spotify; 
        }
        LogIt("spotify-this-song", song, result);
      
      });
}

function MovieThis(movie){
    if(movie === ''){
        movie = "Mr. Nobody";
    }
    let queryUrl = "http://www.omdbapi.com/?t=" + movie.trim() + "&y=&plot=short&apikey=trilogy";
    
    Request(queryUrl, function(error, response, data){
        let result = "";
        if(!error && response.statusCode === 200){
            result += JSON.parse(data).Title + '\n\t'
            +JSON.parse(data).Year + '\n\t'
            +JSON.parse(data).Ratings[0].Value + '\n\t'
            +JSON.parse(data).Ratings[1].Value + '\n\t'
            +JSON.parse(data).Country + '\n\t'
            +JSON.parse(data).Language + '\n\t'
            +JSON.parse(data).Plot + '\n\t'
            +JSON.parse(data).Actors;

        } else {
            result = "Sorry, could not find the movie.";
        }
        LogIt("movie-this", movie, result);
    });
}

function DoWhatItSays(){
    fs.readFile("./random.txt", "utf8", function(err, data){
        if(err){
            console.log(err);
            return;
        }
        data.split('|').forEach(task =>{
            let act = task.split(',')[0];
            let value = task.split(',')[1];
            Action(act, value);
        });

    });
}


//let loggingFlg = false;
//let resultCol = [];

function LogIt(action, value, result){
    //resultCol.push(result);
    
    console.log(result);

    fs.appendFile("./log.txt", "\n" + action + "\n"+ value + "\n" + result, function(err){
        if(err){
            console.log(err);
            return;
        }
        console.log("logged");
    });
}

function Action(action, userInput) {
    action = action ||  process.argv[2].toLowerCase().trim();
    userInput = userInput || GetUserInput();
    switch (action) {
        case "menu":
        Menu();
            break;
        case "concert-this":
        ConcertThis(userInput);
            break;
        case "spotify-this-song":
        SpotifyThisSong(userInput);
            break;
        case "movie-this":
        MovieThis(userInput);
            break;
        case "do-what-it-says":
        DoWhatItSays();
            break;
        default:
            console.log("Invalid request!");
            Menu();
            break;
    }
}

Action();