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
//var mysql = require('mysql');
import {DB} from "./DB";
import {Playlist} from "./DB";
const config : any = JSON.parse(fs.readFileSync(__dirname + "/../config.json", "utf8"));
const db = new DB(config.mysql);

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
    spotifyId : string;
    id : string;
    name : string;
    spotifyUsername : string;

}

interface ISpotifyTrack {
    name : string;
    artist : string;
    youtubeId : string;
    thumb:string;
    position:number;
}
interface IYoutubeTrack {
    name: string;
    url: string;
    thumburl: string
    // id: string;
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
        const user : string = <string> request.body.user;
        const id : string = <string> request.body.id;
        const query = user + ":" + id;
        this.doTrackSearch(query)
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
       let query=querystring.escape(searchQuery);
        return new Promise<ISpotifyPlaylist[]>((resolve, reject) => {
            spotify.clientCredentialsGrant()
                .then((data: any) => {
                    spotify.setAccessToken(data.body['access_token']);
                    spotify.searchPlaylists(query, {market: "us"})
                        .then((data: any) => {
                            const items = data.body.playlists.items;
                            console.log("Got these results:");
                            items.forEach((f: any) => {
                                f.username = f.owner.id;
                                const myPlaylist = {
                                    name: f.name,
                                    spotifyUsername: f.username,
                                    spotifyId: f.id,
                                    _kind : "playlist"
                                };
                                db.insert(myPlaylist);
                            });
                            resolve(items);
                        })
                        .catch((err: any) => {
                            console.log(err);
                        });
                });
            const data : ISpotifyPlaylist[] = [
            ];


        })
    }


    private doTrackSearch(searchQuery : string) : Promise<ISpotifyTrack[]> {
        const splitter = searchQuery.split(':');
        const user = splitter[0];
        const id = splitter[1];
        return new Promise<ISpotifyTrack[]>((resolve, reject) => {
            spotify.clientCredentialsGrant()
                .then((d: any) => {
                    spotify.setAccessToken(d.body['access_token']);
                    spotify.getPlaylistTracks(user, id)//), {limit:2})
                        .then((data: any) => {
                            let items = data.body.items;
                            console.log("Got these results:");
                            items.forEach((f: any) => {
                                f.name = f.track.name;
                                f.artist = f.track.artists[0].name;
                            }); let i=1;
                            async.mapLimit(items, 1, (item: any, cb: any) => {
                                this.searchYoutube(item.name + " " + item.artist).then((data : any)=> {
                                    item.youtubeId = data[0].id.videoId;
                                    item.thumb = data[0].snippet.thumbnails.default.url;
                                    item.name = data[0].snippet.title;
                                    item.url = "youtube.com/watch?v=" +  data[0].id.videoId;
                                    const song = {
                                        videoId : item.youtubeId,
                                        videoTitle : item.name,
                                        thumbUrl : item.thumb,
                                        position : i,
                                        _kind : "song"
                                    };
                                    db.insert(song);
                                    i++;
                                    cb(null, {id: item.youtubeId, url: item.url, thumb: item.thumb});
                                })
                            }, (err : any, results : any) => {
                                //console.log(results);
                                resolve(items);
                                return(results);

                            });

                        })
                        .catch((err: any) => {
                            console.log(err);
                        });
                });


            /*                .catch((err: any) => {
                                console.log('Something went wrong when retrieving an access token', err);
                            });*/
            const items : ISpotifyTrack[] = [

                //{name: "Coming Home", artist: "Tiesto Mesto"},
                //{name: "99 Problems", artist: "Jay-z"},
            ];
        })
    }





    private async searchYoutube(query: string) : Promise<IYoutubeTrack[]> {
        query = querystring.escape(query);
        let url: string = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=" + query + "&key="+ytkey;
        let ret : any;
        return new Promise<IYoutubeTrack[]>((resolve, reject) => {
            got(url)
                .then((data: any) => {
                    const decodedbody = JSON.parse(data.body);
                    let items = decodedbody.items;
                    items = items.map((f: any) => {
                        f.name = f.snippet.title;
                        f.url = "youtube.com/watch?v=" + f.id.videoId;
                        f.thumburl = f.snippet.thumbnails.default.url;
                        console.log('\nName: ' + f.name);
                        console.log('URL: ' + f.url);
                        console.log('Thumb: ' + f.thumburl);
                        return (f);
                    });
                    resolve(items);
                })
                .catch((err: any) => {
                    console.log(err);
                })
        });
    }



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