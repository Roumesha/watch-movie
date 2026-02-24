package com.watchmovie.project.state;

public class RoomEvent {
    private String type;

    public RoomEvent(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}

