import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export const connectSocket=(roomId:string,onMessage:(msg:unknown)=>void)=>{
    const client=new Client({
        webSocketFactory:()=>new SockJS("http://localhost:8080/ws"),
        reconnectDelay:5000,
        onConnect:()=>{
            client.subscribe(`topic/room/${roomId}`,msg=>onMessage(JSON.parse(msg.body)));
        }
    })
    client.activate();
    return client;
}