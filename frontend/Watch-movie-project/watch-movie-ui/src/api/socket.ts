import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BASE_URL } from "../config";

export const connectSocket=(roomId:string,onMessage:(msg:unknown)=>void)=>{
    const client=new Client({
        webSocketFactory:()=>new SockJS(`${BASE_URL}/ws`),
        reconnectDelay:5000,
        onConnect:()=>{
            client.subscribe(`topic/room/${roomId}`,msg=>onMessage(JSON.parse(msg.body)));
        }
    })
    client.activate();
    return client;
}