import * as fs from "fs";
import {DB} from "./DB";
//import {Playlist} from "./DB"
var date1 = new Date('December 17, 2016 03:24:00');
var date2 = new Date('December 17, 2016 03:24:00');
const Playlist={
id :  "5V9zmJVcrJ4FGQIBX8ACdT",
username : "kwyoloed",
name : "Lake music",
    createdAt: date1,
    updatedAt:date2
};

const pl= {
      id:46,
    spotifyId : "5V9zmJVcrJ4FGQIBX8ACdT",
    spotifyUsername : "kwyoloed",
    name : "Lake music",
    createdAt: date1,
    updatedAt:date2

};
const config : any = JSON.parse(fs.readFileSync(__dirname + "/../config.json", "utf8"));
const db = new DB(config.mysql);

   //db.findPlaylist(45);
  db.insertPlaylist(Playlist);
   //console.log(ret);
   //db.updatetPlaylist(pl);
   //db.deletePlaylist(pl);


//db
//.insertPlaylist({id: "-1", username: "a user", name: "test playlist"})
//.then(playlist => {
 //  console.log(playlist);
//});

