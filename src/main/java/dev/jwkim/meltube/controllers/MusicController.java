package dev.jwkim.meltube.controllers;

import dev.jwkim.meltube.entities.MusicEntity;
import dev.jwkim.meltube.entities.UserEntity;
import dev.jwkim.meltube.results.Result;
import dev.jwkim.meltube.services.MusicService;
import org.json.JSONObject;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
@RequestMapping("/music")
public class MusicController {
    public final MusicService musicService;

    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String PostIndex(@SessionAttribute(value = "user", required = false) UserEntity user, @RequestParam(value = "_cover", required = false)MultipartFile _cover, MusicEntity music) throws IOException, InterruptedException {
        Result result = this.musicService.addMusic(user, music, _cover);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameTolower());
        return response.toString();
    }



    @RequestMapping(value = "/verify-youtube-id", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String GetVerifyYoutubeId(@RequestParam(value = "id", required = false) String id) throws IOException, InterruptedException {
        boolean result = this.musicService.verifyYoutubeId(id);
        JSONObject response = new JSONObject();
        response.put("result", result);
        return response.toString();

    }

    @RequestMapping(value = "/crawl-melon", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public MusicEntity getCrawlMelon(@RequestParam(value = "id", required = false) String id) throws IOException {
        return this.musicService.crawlMelon(id);
    }

    @RequestMapping(value = "/search-melon", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public MusicEntity[] getSearchMelon(@RequestParam(value = "keyword", required = false) String keyword) throws IOException, InterruptedException {
        return this.musicService.searchMelon(keyword);
    }
}
