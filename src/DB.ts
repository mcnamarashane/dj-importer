import * as mysql from "mysql";
import {Pool} from "mysql";
import {ISpotifyPlaylist} from "./main";
import {PoolConnection} from "mysql";
import * as fs from "fs";

//var mysq      = require('mysql');
//const con=mysq.createConnection(JSON.parse(fs.readFileSync(__dirname + "/../config.json", "utf8")));

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
            console.log(id);
            this.getConnection().then(conn=> {
                conn.query("SELECT * FROM playlist WHERE id = "+conn.escape(id), function (error: any, results: any) {
                    if (error) throw error;
                   // console.log(results);
                    let id=results;

                    //console.log(id);
                    resolve(id[0]);
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
        let name=playlist.name;
        console.log(name);
        //console.log(playlist);
        let rid: any;
        return new Promise<Playlist>((resolve, reject) => {
            this.getConnection().then(conn => {

                let sql = "INSERT INTO playlist (name) VALUES (" + conn.escape(name) + ")";
              conn.query(sql, function (err: any, result: any) {
                  if(err)
                      console.log("Error");
                  else {
                      console.log("Inserted Entry");
                      rid=result.insertId;

                      conn.release()
                }
                //playlist.name=playlist.name;
               // console.log(p)
                })
                //console.log(rid);

                // const id = this.findPlaylist(results.insertId);
                //results=rid;
                //console.log(id);
                // const id = this.findPlaylist(results);
                //console.log(id);

            }).then((data:any)=> {
                    this.findPlaylist(100).then((a: any) => {
                       // console.log(data);
                        const items = a;
                        console.log(items);
                             console.log('Id: ' + items.id);
                             console.log('name: ' + items.name);
                             console.log('user_id: ' + items.user_id);
                              console.log('created_at: ' + items.created_at);
                             console.log('updated_at: ' + items.updated_at);

                            // f.username = f.owner.id;
                        resolve(items)
                    }) .catch((err: any) => {
                        console.log(err);
                    });

            })
            //results=rid;
            //console.log(id);
            // const id = this.findPlaylist(results);
            //console.log(id);



        })

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
                let sql = "Update playlist SET updated_at =" +conn.escape(datetime)+ "WHERE id=45" ;
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
