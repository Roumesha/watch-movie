export type User = {
  id: number;
  name?: string;
};



export type RoomType = {
  id: number;
  roomName: string;
  roomCode: string;
  host: User;
  movieId:number;
  isPlaying?:boolean;
  currentTime:number;
  participants?: User[];
};

export type RoomData = {
   id: number;
  roomName: string;
  roomCode: string;
  createdAt: string;
  currentTimePlayer: number;
  isPlaying: boolean;
  status: string;
  host: {
    id: number;
    email: string;
  };
  movie: {
    id: number;
    title: string;
    filePath: string;
    duration: number;
  };
};

export type RoomParticipant = {
  id: number;
  displayName:string;
  role: "HOST" | "VIEWER";
};

export type SyncMessage = {
  playing: boolean;
  time: number;
};

export type JwtPayload = {
  sub: string;
  userId: number;
  iat: number;
  exp: number;
};

export type Movie ={
  id: number;
  title: string;
  duration: number;
}



