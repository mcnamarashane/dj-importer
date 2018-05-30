import * as _ from "lodash";
import * as restify from "restify";
import * as fs from "fs";
import {Server} from "restify";
import {Response} from "restify";
import {Next} from "restify";
import {Request} from "restify";
const SpotifyWebApi = require("spotify-web-api-node");
const spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_SECRET_KEY
});
const ytkey=process.env. YOUTUBE_KEY;
const got = require('got');
const async = require("async");
const querystring = require('querystring');
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "jointdj",
    password: "jointdj",
    database: "jointdj",

});
    var currentdate = new Date();
    // 'YYYY-MM-DD HH:MM:SS
var datetime = currentdate.getFullYear()+'-'+ + (currentdate.getMonth()+1)+'-'+currentdate.getDate()+" ";
    + currentdate.getHours()+':';
    + currentdate.getMinutes()+':';
    + currentdate.getSeconds();


interface IConfig {
    port: number;
    clientId : string;
    clientSecret : string;
    youtubeKey : string;
}

export interface ISpotifyPlaylist {
    id : string;
    name : string;
    username : string;
}

interface ISpotifyTrack {
    name : string;
    artist : string;
    youtubeId : string;
    thumb:string;
}

interface youtubeVid {
    name : string;
    url : string;
    thumburl:string;
}
class Main {

    config : IConfig;
    server : restify.Server;

    public Main(params : IConfig) : void {
        this.config = params;
        this.configServer();
    }

    public index(request: Request, response: Response, next: Next) : void {
        const html = fs.readFileSync(__dirname + "/../templates/index.html", "utf8");
        this.sendHtml(html, response, next);

    }

    private search(request: Request, response: Response, next: Next) : void {
        const query : string = <string> request.body.query;
        this.doSpotifySearch(query)
            .then(results => {
                response.send(results);
                next();
            })
            .catch(err => {
                response.send(500, err);
                next();
            });
    }
    private tracks(request: Request, response: Response, next: Next) : void {
        const id : string = <string> request.body.id;
        const user:string = <string> request.body.user;
        const query=id+':'+user;
        this.dotrackSearch(query)
            .then(results => {
                response.send(results);
                next();
            })
            .catch(err => {
                response.send(500, err);
                next();
            });

    }
    private doSpotifySearch(searchQuery : string) : Promise<ISpotifyPlaylist[]> {
       // con.connect(function(err:any) {
        //    console.log("Connected!");
        //    if (err) throw err;
       // });
        return new Promise<ISpotifyPlaylist[]>((resolve, reject) => {
            spotify.clientCredentialsGrant()
                .then((d: any) => {
                    spotify.setAccessToken(d.body['access_token']);
                    spotify.searchPlaylists(searchQuery, {market: "us"})
                        .then((d: any) => {
                            const items = d.body.playlists.items;
                            console.log(items[0]);
                            console.log("searched playlists");
                            items.forEach((f: any) => {
                                console.log('Id: ' + f.id);
                                console.log('name: ' + f.name);
                                console.log('username: ' + f.owner.id);
                                f.id = f.id;
                                f.name = f.name;
                                f.username = f.owner.id;
                              //  f.id.onclick(items.id=f.id);
                               // f.name.onclick(items.name=f.name);
                                    //let sql = "INSERT INTO playlist (name,created_at,updated_at) VALUES ("+'\''+f.name+'\''+','+'\''+datetime+'\''+','+'\''+datetime+'\''+")";
                                   // con.query(sql, function (err:any, result:any) {
                                     //   if (err) throw err;
                                     //   console.log("1 record inserted");

                              //  });


                            });
                            resolve(items);

                        })

                        .catch((err: any) => {
                            console.log(err);
                        });

                })
                .catch((err: any) => {
                    console.log(err);
                });

            const data: ISpotifyPlaylist[] = [

                // {id: items.id[0], username: 'user', name: 'name'},
                // {id: 'id', username: 'user', name: 'name'},

            ];


        })
    }

    private dotrackSearch(searchQuery : string) : Promise<ISpotifyTrack[]> {
        const query=searchQuery;
        console.log(searchQuery);
        const split=query.split(':',3);
        console.log(split);
        const id=split[0];
        const user=split[1];


        return new Promise<ISpotifyTrack[]>((resolve, reject) => {
            con.connect(function(err:any) {
                console.log("Connected!");
                if (err) throw err;
            });
            spotify.clientCredentialsGrant()
                .then((d: any) => {
                    spotify.setAccessToken(d.body['access_token']);
                    spotify.getPlaylistTracks(user, id)
                        .then((data: any) => {
                            let items = data.body.items;
                           console.log(items);
                            console.log("Got these results:");
                            items.forEach((f: any) => {
                                f.name=f.track.name;
                                f.artist=f.track.artists[0].name;
                                f.position=items.track_number;
                                console.log('Name: '+ f.name);
                                console.log('Artist: '+ f.artist);
                                console.log('Position: '+f.position);
                            });
                            let position=0;
                            async.mapLimit(items,1, (item:any, cb:any) => {
                                this.searchYoutube(item.artist+" "+item.name).then((data: any) =>{
                                    // console.log('Name: ' + results.snippet.title);
                                    // console.log('url: ' + results.id.videoId);
                                    // resolve(results.id.videoID);
                                    // results is now an array of the response bodies
                                    //console.log(data[0].snippet.title);
                                    //const name =data[0].items[0].snippet.title;
                                    //console.log(data[0]);
                                    item.title=data[0].snippet.title;
                                    item.youtubeId = data[0].id.videoId;
                                    item.thumb=data[0].snippet.thumbnails.default.url;
                                   // item.title=querystring.escape(item.title);

                                    position=position+1;
                                    let sql = "INSERT INTO playlist_song (video_id,video_title,thumb_url,position,playlist_id) VALUES ("+con.escape(item.youtubeId)+','+con.escape(item.title)+','+con.escape(item.thumb)+','+con.escape(position)+ ")";
                                    con.query(sql, function (err:any, result:any) {
                                       if (err) throw err;
                                       console.log("1 record inserted");
                                       });


                                    //console.log(item.youtubeId);
                                    //return(f.url);
                                    //return( results[0].items[0].url);
                                    //const id=results[0].items[0].id.videoId;

                                    cb(null, {url:item.youtubeId,thumburl:item.thumb});
                                })

                            }, (err:any, results:any) => {
                                console.log(results);
                                resolve(items);
                                return(results);

                            });

                            //resolve(items);
                        })
                        .catch((err: any) => {
                            console.log(err);
                        });
                })
                .catch((err: any) => {
                    console.log(err);
                });




            const items: ISpotifyTrack[] = [
                //{name: "Coming Home", artist: "Tiesto Mesto"},
               // {name: "99 Problems", artist: "Jay-z"},
            ];

            // response.send(data);
        })
    }
    private searchYoutube(query:string) :  Promise<youtubeVid[]> {
        //console.log(query);
        query=querystring.escape(query);
        let url: string = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=" + query + "&key="+ytkey;
        let ret:any;
        //url="'"+url+"'";
        //console.log(url);

        return new Promise<youtubeVid[]>((resolve, reject) => {
            got(url)
                .then((data: any) => {

                        const decodedbody = JSON.parse(data.body);
                       let items = decodedbody.items;
                        //console.log("Got these results:");
                    items=items.map((f:any)=>{
                        //console.log(items);
                        f.name =f.snippet.title;
                        f.url = f.id.videoId;
                        f.thumburl=f.snippet.thumbnails.default.url;
                        //console.log('Name: ' + f.name);
                       // console.log(f.name);
                       // console.log(f.url);
                       // console.log(f.thumburl);
                        return(f);
                    });
                        resolve(items);
                        })

                .catch((err: any) => {
                    console.log(err);
                });
                    });

                }




            // See YoutubePhp for how youtube works
            //"https://www.googleapis.com/youtube/v3/search?key=".$this->developerKey."&part=snippet&".http_build_query($query_array);
            //$query_array = ([
            //                 "order" => $this->order,
            //                 "maxResults" => $this->numVideos,
            //                 "videoCategoryId" => $this->typeId,
            //                 "type" => $searchType,
            //                 "q" => $searchTerm,
            //                 "format" => "json",
            //             ]);
            //https://www.googleapis.com/youtube/v3/search?key=AIzaSyCDGs5oUzVU2tE6dKfeHolpLGSzd6eoUtk&part=snippet&".http_build_query($query_array)
            // YOUTUBE_KEY=AIzaSyCDGs5oUzVU2tE6dKfeHolpLGSzd6eoUtk
            //    buildApiRequest('GET',
            //                 '/youtube/v3/search',
            //                 {'maxResults': '25',
            //                  'part': 'snippet',
            //                  'q': 'surfing',
            //                  'type': ''});
            //G
            // ET "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=surfing&key=AIzaSyCDGs5oUzVU2tE6dKfeHolpLGSzd6eoUtk"



    private sendHtml(html : string, response: Response, next: Next) : void {
        response.setHeader('Content-Type', 'text/html');
        response.setHeader('Content-Length', Buffer.byteLength(html));
        response.write(html);
        response.end();
        next();
    }

    private configServer() : void {
        this.server = restify.createServer({
            name: 'dj-importer',
            version: '1.0.0'
        });

        this.server.use(restify.plugins.acceptParser(this.server.acceptable));
        this.server.use(restify.plugins.queryParser({mapParams: true}));
        this.server.use(restify.plugins.bodyParser({mapParams: true}));

        this.server.get('/', this.index.bind(this));
        this.server.post('/search', this.search.bind(this));
        this.server.post('/tracks', this.tracks.bind(this));

        this.server.listen(this.config.port, () => {
            console.log('%s listening at %s', this.server.name, this.server.url);
        });
    }
}

if(!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_SECRET_KEY || !process.env.YOUTUBE_KEY){
    console.log("You must set SPOTIFY_CLIENT_ID, SPOTIFY_SECRET_KEY, and YOUTUBE_KEY environment variables.");
    process.exit(-1);
}

const parsedParams : IConfig = _.extend({port: 8080}, require('minimist')(process.argv.slice(2)));
parsedParams.clientId = process.env.SPOTIFY_CLIENT_ID ? process.env.SPOTIFY_CLIENT_ID : "";
parsedParams.clientSecret = process.env.SPOTIFY_SECRET_KEY ? process.env.SPOTIFY_SECRET_KEY : "";
parsedParams.youtubeKey = process.env.YOUTUBE_KEY ? process.env.YOUTUBE_KEY : "";

(new Main()).Main(parsedParams);