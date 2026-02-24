package com.watchmovie.project.websocket;

public class ControlMessage {

    private boolean playing;  // play or pause
    private double time;      // current timestamp in seconds

    public ControlMessage() {
    }

    public ControlMessage(boolean playing, double time) {
        this.playing = playing;
        this.time = time;
    }

    public boolean isPlaying() {
        return playing;
    }

    public void setPlaying(boolean playing) {
        this.playing = playing;
    }

    public double getTime() {
        return time;
    }

    public void setTime(double time) {
        this.time = time;
    }
}

