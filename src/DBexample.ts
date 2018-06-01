import * as fs from "fs";
import {DB} from "./DB";
//import {Playlist} from "./DB"
var date1 = new Date('2016-12-06 03:24:00');
var date2 = new Date('December 06, 2016 03:24:00');
const Playlist={
id :  "5V9zmJVcrJ4FGQIBX8ACdT",
username : "kwyoloed",
name : "Lake music",
    createdAt: date1,
    updatedAt:date2
};

const pl= {
    name : "Lake music",
    spotifyUsername : "kwyoloed",
    spotifyId : "5V9zmJVcrJ4FGQIBX8ACdT",
    createdAt: date1,
    updatedAt:date2,
    _kind:"Playlist",


};
const song={
    _kind: "PlaylistSong",
    playlist_id:245,
   videoTitle: 'Eric Church - Drink In My Hand',
    videoId: 'usGv0gB2zEU',
    thumbUrl: 'https://i.ytimg.com/vi/usGv0gB2zEU/default.jpg',
    position: 5,
    createdAt: date1,
    updatedAt:date2,

};


const config : any = JSON.parse(fs.readFileSync(__dirname + "/../config.json", "utf8"));
const db = new DB(config.mysql);

  //db.find('song',48);
  // db.find('playlist',3);
   //db.insert(song);
  // db.update("song",43);
  // db.update("playlist",3);

  //  db.insert(pl);
    //db.test(song);
   //db.insertSong(song);
   //console.log(ret);
   //db.updatetPlaylist(pl);
  // db.delete('song',52);


//db
//.insertPlaylist({id: "-1", username: "a user", name: "test playlist"})
//.then(playlist => {
 //  console.log(playlist);
//});

