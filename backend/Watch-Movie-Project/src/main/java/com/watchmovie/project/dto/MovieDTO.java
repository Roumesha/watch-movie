package com.watchmovie.project.dto;

public class MovieDTO {
	private Long id;
    private String title;
    private int duration;

    public MovieDTO(Long id, String title, int duration) {
        this.id = id;
        this.title = title;
        this.duration = duration;
    }

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public int getDuration() {
		return duration;
	}

	public void setDuration(int duration) {
		this.duration = duration;
	}

}
