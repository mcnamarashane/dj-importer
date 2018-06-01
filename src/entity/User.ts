import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class playlist{
    @PrimaryGeneratedColumn()
    id : number;
    @Column()
    spotifyId : string;
    @Column()
    spotifyUsername : string;
    @Column()
    name : string;
    @Column()
    createdAt : string;
    @Column()
    updatedAt : string;
}
@Entity()
export class playlist_song{
    @PrimaryGeneratedColumn()
    id:number;
    @Column()
    video_id:string;
    @Column()
    video_title:string;
    @Column()
    thumb_url:string;
    @Column()
    position:number;
    @Column()
    playlist_id:number;
    @Column()
    createdAt : string;
    @Column()
    updatedAt : string;
}