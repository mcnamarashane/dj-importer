import * as mysql from "mysql";
import {Pool} from "mysql";
import {ISpotifyPlaylist} from "./main";
import {PoolConnection} from "mysql";
import "reflect-metadata";
import {Entity,Column,PrimaryGeneratedColumn} from "typeorm";
import {createConnection} from "typeorm";

const DBMapping = [

    {
        table: "playlist",
        _kind : "Playlist",
        numCols : 3, // number of columns that will be updated when inserting a playlist (
        mapping: [ ["spotifyId", "spotify_id"], ["spotifyUsername" , "spotfiy_username"],["name", "name"],["createdAt","created_at"],["updatedAt","updated_at"] ]
    },
    {
        table: "playlist_song",
        _kind : "Playlist",
        numCols : 5, // number of columns that will be updated when inserting a song (
        mapping: [["videoId", "video_id"],["videoTitle" , "video_title"],["thumbUrl","thumb_url"],["position","position"],["playlist_id","playlist_id"],["createdAt", "created_at"],["updatedAt","updated_at"] ]
    }

];

function test(playlist : BaseEntity) {


}

interface BaseEntity {
    _kind : string;
    [key: string]: any;
}

export interface PlaylistSong extends BaseEntity {
    id:number;
    video_id:string;
    video_title:string;
    thumb_url:string;
    position:number;
    playlist_id:number;
    createdAt : Date;
    updatedAt : Date;
}

export interface Playlist extends BaseEntity {
    id : number;
    spotifyId : string;
    spotifyUsername : string;
    name : string;
    createdAt : Date;
    updatedAt : Date;
}
import * as fs from "fs";
//var mysq      = require('mysql');
//const con=mysq.createConnection(JSON.parse(fs.readFileSync(__dirname + "/../config.json", "utf8")));
import {playlist} from "./entity/User";
import {playlist_song} from "./entity/User";

//const ytkey=process.env. YOUTUBE_KEY;
const conn=createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "jointdj",
    password: "jointdj",
    database: "jointdj",
    entities: [
        playlist,
        playlist_song
    ],
    synchronize: true,
    logging: false
})
export class DB {

    private pool : mysql.Pool;

    public constructor(config : IDBConfig){
        this.pool  = mysql.createPool(config);
    }
    /**
     * Write a SELECT to find the playlist row with the database id = id and resolve it.
     * (You'll need this to power the insertPlaylist function below)
     *
     */
    public test(play : BaseEntity) {

        let table: any;
        const type = play._kind;
        console.log(type);
        if (type == "Playlist") {
            table = DBMapping[0];

        }
        else if (type == "PlaylistSong") {
            table = DBMapping[1];
        }
        const cols = table.mapping.map((f: any) => f[1]);
        let values: any[] = [];


        //    console.log(updatedAt);
            createConnection({
                type: "mysql",
            host: "localhost",
            port: 3306,
            username: "jointdj",
            password: "jointdj",
            database: "jointdj",
            entities: [
            playlist,
                playlist_song
        ],
            synchronize: true,
            logging: false
    }).then(async connection => {
                //console.log(createdAt)
                if(play.name!=undefined) {
                    console.log("Inserting a new playlist into the database...");
                    const pl = new playlist();

                    pl.id = play.id;
                    pl.spotifyId = play.spotifyId;
                    pl.spotifyUsername = play.spotifyUsername;
                    pl.name = play.name;
                    pl.createdAt = play.createdAt;
                    pl.updatedAt = play.updatedAt;
                    console.log(pl.createdAt);
                    await connection.manager.save(pl);
                    console.log("Saved a new user with id: " + pl.id);

                    //console.log("Loading users from the database...");
                    // const users = await connection.manager.find('playlist');
                    //console.log("Loaded lists: ", users);

                    // console.log("Here you can setup and run express/koa/any other framework.");
                }
                else{
                    console.log("Inserting a new song into the database...");
                    const pl = new playlist_song();
                    pl.video_id = play.videoId;
                    pl.video_title = play.videoTitle;
                    pl.playlist_id=play.playlist_id;
                    pl.thumb_url = play.thumbUrl;
                    pl.position=play.position;
                    pl.createdAt = play.createdAt;
                    pl.updatedAt = play.updatedAt;
                   // console.log(pl.createdAt);
                    await connection.manager.save(pl);
                    console.log("Saved a new user with id: " + pl.id);

                    //console.log("Loading users from the database...");
                    // const users = await connection.manager.find('playlist');
                    //console.log("Loaded lists: ", users);

                    // console.log("Here you can setup and run express/koa/any other framework.");
                }
            }).catch(error => console.log(error));
            //  conn.query(s, [playlist[table.mapping[0][0]], playlist[table.mapping[1][0]], playlist[table.mapping[2][0]], playlist[table.mapping[3][0]]], function (err: any, results) {
            //const vals = playlist[table.mapping.map((f:any) => f[1][0])];
            //console.log(vals);
            //console.log(table.mapping[0][0]);
            //const vals = playlist[table.mapping[0][0]];
            // const vals = playlist[table.mapping.map(f => f[0][0])];

            // const sql = `INSERT INTO $(table.table) ${cols.join(", ")} ${vals.join(", ")}`;


    }


    public find(type:string,id : number)  {
        createConnection({
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "jointdj",
            password: "jointdj",
            database: "jointdj",
            entities: [
                playlist,
                playlist_song
            ],
            synchronize: true,
            logging: false
        }).then(async connection => {
            //console.log(createdAt)
            if(type=='playlist') {
                console.log("Finding playlist into the database...");
                const ply =  await connection.getRepository(playlist);
                const pl=await ply.findOne(id);
               // let d=Date.now();
                console.log(pl);


                //console.log("Loading users from the database...");
                // const users = await connection.manager.find('playlist');
                //console.log("Loaded lists: ", users);

                // console.log("Here you can setup and run express/koa/any other framework.");
            }
            else{
                console.log("Finding song into the database...");
                const ply =  await connection.getRepository(playlist_song);
                const pl=await ply.findOne(id);
                // let d=Date.now();
                console.log(pl);

                //console.log("Loading users from the database...");
                // const users = await connection.manager.find('playlist');
                //console.log("Loaded lists: ", users);

                // console.log("Here you can setup and run express/koa/any other framework.");
            }
        }).catch(error => console.log(error));
    }
      /**
     * The insight here is that you're taking in a spotify playlist,
     * need to generate, run an SQL INSERT, and then resolve the data from the newly inserted row
     */
    public insert(play : BaseEntity)  {

          let table: any;
          //const type = play._kind;
          console.log(play);
          conn.then(async connection => {
              //console.log(createdAt)
              if(play.name!=undefined) {
                  console.log("Inserting a new playlist into the database...");
                  const pl = new playlist();
                  pl.spotifyId = play.spotifyId;
                  pl.spotifyUsername = play.spotifyUsername;
                  pl.name = play.name;
                  pl.createdAt = new Date().toLocaleString();
                  pl.updatedAt = new Date().toLocaleString();
                  //console.log(pl.createdAt);
                  await connection.manager.save(pl);
                  console.log("Saved a new user with id: " + pl.id);

                 // console.log("Loading users from the database...");
                  // const rep = await connection.manager.find(playlist);
                 // console.log("Loaded lists: ", rep);

                  // console.log("Here you can setup and run express/koa/any other framework.");

              }
              else{
                  console.log("Inserting a new song into the database...");
                  const pl = new playlist_song();
                  pl.video_id=play.videoId;
                  pl.video_title = play.videoTitle;
                  const ply =  await connection.getRepository(playlist);
                  const psl=await ply.findOne({spotifyId:'37i9dQZF1DX7ZnTv0GKubq'});
                  pl.playlist_id=psl.id;
                  pl.thumb_url = play.thumbUrl;
                  pl.position=play.position;
                  pl.createdAt = new Date().toLocaleString();
                  pl.updatedAt = new Date().toLocaleString();
                  // console.log(pl.createdAt);
                  await connection.manager.save(pl);
                  console.log("Saved a new user with id: " + pl.id);

                  //console.log("Loading users from the database...");
                  // const users = await connection.manager.find('playlist_song');
                //   console.log("Loaded lists: ", users);

                  // console.log("Here you can setup and run express/koa/any other framework.");

              }
          }).catch(error => console.log(error));
          //  conn.query(s, [playlist[table.mapping[0][0]], playlist[table.mapping[1][0]], playlist[table.mapping[2][0]], playlist[table.mapping[3][0]]], function (err: any, results) {
          //const vals = playlist[table.mapping.map((f:any) => f[1][0])];
          //console.log(vals);
          //console.log(table.mapping[0][0]);
          //const vals = playlist[table.mapping[0][0]];
          // const vals = playlist[table.mapping.map(f => f[0][0])];

          // const sql = `INSERT INTO $(table.table) ${cols.join(", ")} ${vals.join(", ")}`;

      }

    /**
     * Now, you're given data that exists in the database,
     * need to generate an UPDATE SQL query, and run it, and then just resolve the updated playlist.
     */
    public update(type:any,id:number) {
        createConnection({
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "jointdj",
            password: "jointdj",
            database: "jointdj",
            entities: [
                playlist,
                playlist_song
            ],
            synchronize: true,
            logging: false
        }).then(async connection => {
            //console.log(createdAt)
            if(type=='playlist') {
                console.log("Updating playlist into the database...");
                const ply =  await connection.getRepository(playlist);
                const pl=await ply.findOne(id);
                // let d=Date.now();

                pl.updatedAt = new Date().toLocaleString();
                //console.log(pl.createdAt);
                await connection.manager.save(pl);

                //console.log("Loading users from the database...");
                // const users = await connection.manager.find('playlist');
                //console.log("Loaded lists: ", users);

                // console.log("Here you can setup and run express/koa/any other framework.");
            }
            else{
                console.log("Updating song into the database...");
                const ply =  await connection.getRepository(playlist_song);
                const pl=await ply.findOne(id);
                // let d=Date.now();

                pl.updatedAt = new Date().toLocaleString();
                //console.log(pl.createdAt);
                await connection.manager.save(pl);

                //console.log("Loading users from the database...");
                // const users = await connection.manager.find('playlist');
                //console.log("Loaded lists: ", users);

                // console.log("Here you can setup and run express/koa/any other framework.");
            }
        }).catch(error => console.log(error));
    }

    /**
     * Just generate and run the appropriate DELETE SQL statement and resolve when its done
     */
    public delete(type:any,id:number) {
        createConnection({
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "jointdj",
            password: "jointdj",
            database: "jointdj",
            entities: [
                playlist,
                playlist_song
            ],
            synchronize: true,
            logging: false
        }).then(async connection => {
            //console.log(createdAt)
            if (type == 'playlist') {
                console.log("Updating playlist into the database...");
                const ply = await connection.getRepository(playlist);
                const pl = await ply.findOne(id);
                // let d=Date.now();

               // pl.updatedAt = new Date().toLocaleString();
                //console.log(pl.createdAt);
                await connection.manager.remove(pl);

                //console.log("Loading users from the database...");
                // const users = await connection.manager.find('playlist');
                //console.log("Loaded lists: ", users);

                // console.log("Here you can setup and run express/koa/any other framework.");
            }
            else {
                console.log("Updating song into the database...");
                const ply = await connection.getRepository(playlist_song);
                const pl = await ply.findOne(id);
                // let d=Date.now();

               // pl.updatedAt = new Date().toLocaleString();
                //console.log(pl.createdAt);
                await connection.manager.remove(pl);

                //console.log("Loading users from the database...");
                // const users = await connection.manager.find('playlist');
                //console.log("Loaded lists: ", users);

                // console.log("Here you can setup and run express/koa/any other framework.");
            }
        }).catch(error => console.log(error));
    }
    private getConnection() : Promise<PoolConnection> {
        return new Promise<PoolConnection>((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    console.error(err);
                    process.exit(-1);
                }

                resolve(connection);
            });
        });
    }
    public findSong(id:number) : Promise<songs> {
        return new Promise<songs>((resolve, reject) => {
            this.getConnection().then(conn=> {
                conn.query("SELECT * FROM playlist_song WHERE id = "+conn.escape(id), function (error: any, results: any) {
                    if (error) throw error;
                    // console.log(results);
                    let id=results;
                    resolve(id[0]);
                    console.log(id);
                });
                conn.release()


            })

        })




    }
    public deleteSong(Song : songs) : Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.getConnection().then(conn => {
                // do your things with conn here...
                let sql = "Delete From playlist_song Where video_title=" +conn.escape(Song.name) ;
                conn.query(sql, function (err:any, result:any) {
                    if (err) throw err;
                    console.log("1 record updated");
                    console.log(result);
                });


                // at some point you'll need to run this
                conn.release();
            });
        });
    }
    public insertSong(Song: songs) : Promise<songs> {
        let results: any;
        //let name=playlist.name;
        //onsole.log(name);
        //console.log(playlist);
        let rid:  any;
        let pid:any;
        let item={
            name:"",
            url:"",
            thumb:""
        }
        //const mn = new Main();

        return new Promise<songs>((resolve, reject) => {
                   // mn.searchYoutube(Song).then((data: any) => {
                        // console.log('Name: ' + results.snippet.title);
                        // console.log('url: ' + results.id.videoId);
                        // resolve(results.id.videoID);
                        // results is now an array of the response bodies
                        //console.log(data[0].snippet.title);
                        //const name =data[0].items[0].snippet.title;
                        //console.log(data[0]);
                     //   item = data;
                       // console.log(item);
                     //   item.name = data[0].snippet.title;
                      //  item.url = data[0].id.videoId;
                      //  item.thumb = data[0].snippet.thumbnails.default.url;
                      //  return (item);
                 //   })
                    //    .then(h=>{
                    this.getConnection()
                        .then(conn => {

                    let abc = "SELECT COUNT(*) as total FROM playlist" ;
                    conn.query(abc, function (err:any, result:any) {
                        if (err) throw err;
                        console.log(result[0].total);
                        pid = result[0].total;
                        console.log("p" + pid);
                        let sql = "INSERT INTO playlist_song (video_id,video_title,thumb_url,position,playlist_id,created_at,updated_at) VALUES (" + conn.escape(Song.url) + ',' + conn.escape(Song.name) + ',' + conn.escape(Song.thumb) +',' + conn.escape(Song.position)+ ',' + conn.escape(pid) +',' + "NOW(), NOW()"+ ")";
                        //console.log(item);
                        conn.query(sql, function (err: any, result: any) {
                            if (err)
                                throw err;
                            else {
                                console.log("Inserted Entry");


                                //playlist.name=playlist.name;
                                // console.log(p)
                                rid = result.insertId;
                                console.log(rid);

                            }                    //console.log(rid);

                            // const id = this.findPlaylist(results.insertId);
                            //results=rid;
                            //console.log(id);
                            // const id = this.findPlaylist(results);
                            //console.log(id
                            conn.release();
                            //resolve(rid);
                            // return  this.findPlaylist(rid);
                            return (rid);

                        })
                    })//})
            }).then( conn => {
                this.getConnection().then(conn => {

                    this.findSong(rid).then((data: any) => {

                        const items = data;
                        console.log(items);
                        //console.log('Id: ' + items.id);
                       // console.log('video_id: ' + items.video_id);
                       // console.log('video_title: ' + items.video_title);
                        //console.log('created_at: ' + items.created_at);
                        //console.log('updated_at: ' + items.updated_at);

                        // f.username = f.owner.id;
                        resolve (items);
                    });
                    conn.release();
                })
                    .catch((err: any) => {
                        console.log(err);
                    });

            })

                .catch((err: any) => {
                    console.log(err);
                });

            //results=rid;
            //console.log(id);
            // const id = this.findPlaylist(results);
            //console.log(id);



        });
}

}

export interface Playlist {
    id : number;
    spotifyId : string;
    spotifyUsername : string;
    name : string;
    createdAt : Date;
    updatedAt : Date;
}

interface IDBConfig {
    host : string;
    user : string;
    password : string;
    database : string;
}
interface songs{
    name:string;
    url:string;
    thumb:string;
    position:number;
}
