export interface SongInfo {
    name: string; 
    uri: string;
    album: string;
    artists: string[]
}

export interface QueuedSongInfo extends SongInfo {
    votes: number;
}

export interface PartyVotes {
    partyId: string;
    upvotedSongs: SongInfo[];   
}

export interface PartyVotesContextProps {
    parties: PartyVotes[];
    updateVote: (partyId: string, song: SongInfo, voteType: 'upvote' | 'downvote') => void;
}