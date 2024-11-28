package dev.jwkim.meltube.controllers;

import dev.jwkim.meltube.entities.MusicEntity;
import dev.jwkim.meltube.services.MusicService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/admin")
public class AdminController {
    private final MusicService musicService;

    @Autowired
    public AdminController(MusicService musicService) {
        this.musicService = musicService;
    }

    @RequestMapping(value = "/musics", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public MusicEntity[] getMusics() {
        return this.musicService.getAllMusics(false);
    }
}
