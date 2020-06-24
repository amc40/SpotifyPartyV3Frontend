export interface SongInfo {
    name: string; 
    uri: string;
    album: string;
    artists: string[]
}

export interface QueuedSongInfo extends SongInfo {
    votes: number;
}