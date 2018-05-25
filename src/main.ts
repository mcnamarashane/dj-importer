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
const got = require('got');


interface IConfig {
    port: number;
    clientId : string;
    clientSecret : string;
    youtubeKey : string;
}

interface ISpotifyPlaylist {
    id : string;
    name : string;
    username : string;
}

interface ISpotifyTrack {
    name : string;
    artist : string;
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
        return new Promise<ISpotifyPlaylist[]>((resolve, reject) => {
                        spotify.clientCredentialsGrant()
                            .then((d: any) => {
                                spotify.setAccessToken(d.body['access_token']);
                            })
                        spotify.searchPlaylists(searchQuery, {market: "us"})
                            .then((d: any) => {
                                const items = d.body.playlists.items;
                               console.log("Got these results:");
                                items.forEach((f: any) => {
                                    console.log('Id: '+f.id);
                                    console.log('name: '+f.name);
                                    console.log('username: '+f.owner.id);
                                    f.id=f.id;
                                    f.name=f.name;
                                    f.username=f.owner.id;

                                })
                                resolve(items);
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
            let usesarr: any;
            spotify.clientCredentialsGrant()
                .then((d: any) => {
                    spotify.setAccessToken(d.body['access_token']);
                })

            spotify.getPlaylistTracks(user, id,{limit:5})
                .then((data: any) => {
                    let items = data.body.items;
                    console.log("Got these results:");
                    items.forEach((f: any) => {
                        //console.log('Name: '+ f.track.name);
                        //console.log('Artist: '+ f.track.artists[0].name);

                        f.name=f.track.name;
                        f.artist=f.track.artists[0].name
                        resolve(items);
                        this.searchYoutube(f.name);

                    })
                })
                .catch((err: any) => {
                    console.log(err);
                });


            const data: ISpotifyTrack[] = [
                //{name: "Coming Home", artist: "Tiesto Mesto"},
               // {name: "99 Problems", artist: "Jay-z"},
            ];

            // response.send(data);
        })
    }
    private searchYoutube(query:string) : void {
        console.log(query);
        let main="https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=";
        let tail="&key=AIzaSyCDGs5oUzVU2tE6dKfeHolpLGSzd6eoUtk";
        let url:string=+main+query+tail
        console.log(url);
        got(url)
            .then((response:any)=> {
                console.log(response.body);
            });
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