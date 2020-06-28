export interface SongInfo {
    name: string; 
    uri: string;
    album: string;
    artists: string[]
}

export interface QueuedSongInfo extends SongInfo {
    votes: number;
}

export function compareSongs(songA: QueuedSongInfo, songB: QueuedSongInfo) {
    if (songA.votes > songB.votes) {
        // A > B
        return 1;
    } else if (songA.votes < songB.votes) {
        // A < B
        return -1;
    } else {
        // if n votes equal then order by uri to remain consistent across all clients
        if (songA.uri > songB.uri) {
            return 1;
        } else {
            return -1;
        }
    }
}

export interface PartyVotes {
    partyId: string;
    upvotedSongs: SongInfo[];   
}

export interface PartyVotesContextProps {
    parties: PartyVotes[];
    updateVote: (partyId: string, song: SongInfo, voteType: 'upvote' | 'downvote') => void;
}

export interface Device {
    id: string;
    name: string;
    icon: JSX.Element;
}