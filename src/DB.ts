import * as mysql from "mysql";
import {Pool} from "mysql";
import {ISpotifyPlaylist} from "./main";
import {PoolConnection} from "mysql";
import * as fs from "fs";
//var mysq      = require('mysql');
//const con=mysq.createConnection(JSON.parse(fs.readFileSync(__dirname + "/../config.json", "utf8")));
import {Main} from "./main"
const ytkey=process.env. YOUTUBE_KEY;

export class DB {

    private pool : mysql.Pool;

    public constructor(config : IDBConfig){
        this.pool  = mysql.createPool(config);
    }
    /**
     * Write a SELECT to find the playlist row with the database id = id and resolve it.
     * (You'll need this to power the insertPlaylist function below)
     */
    public findPlaylist(id : number) : Promise<Playlist> {
        return new Promise<Playlist>((resolve, reject) => {
            //console.log(id);
            this.getConnection().then(conn=> {
                conn.query("SELECT * FROM playlist WHERE id = "+conn.escape(id), function (error: any, results: any) {
                    if (error) throw error;
                   // console.log(results);
                    let id=results;
                    resolve(id[0]);
                    //console.log(id);
                });
                conn.release()


            })

            })


    }
      /**
     * The insight here is that you're taking in a spotify playlist,
     * need to generate, run an SQL INSERT, and then resolve the data from the newly inserted row
     */
    public insertPlaylist(playlist : ISpotifyPlaylist) : Promise<Playlist> {
        let results: any;
        //let name=playlist.name;
        //onsole.log(name);
        //console.log(playlist);
        let rid:  any;
        return new Promise<Playlist>((resolve, reject) => {

            this.getConnection()
                .then(conn => {

                    let sql = "INSERT INTO playlist (name) VALUES (" + conn.escape(playlist.name) + ")";
                    conn.query(sql, function (err: any, result: any) {
                        if (err)
                            console.log("Error");
                        else {
                            console.log("Inserted Entry");


                            //playlist.name=playlist.name;
                            // console.log(p)
                            rid = result.insertId;
                            console.log(rid);

                        }
                    });
                    //console.log(rid);

                    // const id = this.findPlaylist(results.insertId);
                    //results=rid;
                    //console.log(id);
                    // const id = this.findPlaylist(results);
                    //console.log(id
                    conn.release();
                    //resolve(rid);
                    // return  this.findPlaylist(rid);
                    return(rid);

                }).then( conn => {
                    this.getConnection().then(conn => {

                this.findPlaylist(rid).then((data: any) => {

                    const items = data;
                    console.log(items);
                    console.log('Id: ' + items.id);
                    console.log('name: ' + items.name);
                    console.log('user_id: ' + items.user_id);
                     console.log('created_at: ' + items.created_at);
                    console.log('updated_at: ' + items.updated_at);

                    // f.username = f.owner.id;
                    resolve (items);
                });
                        conn.release();
                })
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

    /**
     * Now, you're given data that exists in the database,
     * need to generate an UPDATE SQL query, and run it, and then just resolve the updated playlist.
     */
    public updatetPlaylist(playlist : Playlist) : Promise<Playlist> {
        return new Promise<Playlist>((resolve, reject) => {
            var currentdate = new Date();
            // 'YYYY-MM-DD HH:MM:SS
            var datetime = currentdate.getFullYear()+'-'+ + (currentdate.getMonth()+1)+'-'+currentdate.getDate()+" "
            + currentdate.getHours()+':'
            + currentdate.getMinutes()+':'
            + currentdate.getSeconds();
            this.getConnection().then(conn => {
                // do your things with conn here...
                let sql = "Update playlist SET updated_at=NOW() WHERE id=45";
                conn.query(sql, function (err:any, result:any) {
                    if (err) throw err;
                    console.log("1 record updated");
                    console.log(result);
                });

                // at some point you'll need to run this
                conn.release();
            })
        .catch((err: any) => {
                console.log(err);
            });
        });
    }

    /**
     * Just generate and run the appropriate DELETE SQL statement and resolve when its done
     */
    public deletePlaylist(playlist : Playlist) : Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.getConnection().then(conn => {
                // do your things with conn here...
                let sql = "Delete From playlist Where id=" +conn.escape(playlist.id) ;
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
