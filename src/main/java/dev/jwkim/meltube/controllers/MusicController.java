package dev.jwkim.meltube.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import dev.jwkim.meltube.entities.MusicEntity;
import dev.jwkim.meltube.entities.UserEntity;
import dev.jwkim.meltube.results.CommonResult;
import dev.jwkim.meltube.results.Result;
import dev.jwkim.meltube.services.MusicService;
import dev.jwkim.meltube.vos.ResultVo;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    @RequestMapping(value = "/inquiries", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String getInquires(@SessionAttribute(value = "user", required = false)UserEntity user) throws JsonProcessingException {
        ResultVo<Result, MusicEntity[]> result =  this.musicService.getMusicInquiriesByUser(user);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.getResult().nameTolower());
        if(result.getResult() == CommonResult.SUCCESS) {
            JSONArray musics = new JSONArray();
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());
            // objectMapper는 기본적으로 JAVA에 내장된 LocalDateTime 및 LocalDate를 변화하는 기능을 내포하지 않음.
            // Mapping된 메서드에서 사용하는 ObjectMapper는 스프링의 설정에 의해서 JavaTimeModule을 기본적으로 등록하지만,
            // 위 처럼 수동으로 객체화하여 사용할 때에는 기본적으로 등록되지 않음으로, 위 처럼 별도의 조치가 필요함,
            // 요약 : 변환 대상에 LocalDateTime, LocalDate 가 있으면 < objectMapper.registerModule(new JavaTimeModule()); > 해야 함
            for (MusicEntity music : result.getPayload()) {
                String musicString = objectMapper.writeValueAsString(music); // MusicEntity -> JSON형식의 String   "{index : 7, name: \"해야"\}"
                JSONObject musicObject = new JSONObject(musicString); // JSON 형식의 String -> JsonObject
                musics.put(musicObject);
            }
            response.put("musics", musics);
        }
        return response.toString();
    }

    @RequestMapping(value = "/cover", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<byte[]> getCover(@RequestParam(value = "index", required = false) Integer index) {
        MusicEntity music = this.musicService.getMusicByIndex(index, true);
        if(music == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(music.getCoverContentType())).contentLength(music.getCoverData().length).body(music.getCoverData());
    }

    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteIndex(@SessionAttribute(value = "user", required = false) UserEntity user,
                              @RequestParam(value = "indexes", required = false) int[] indexes) {
        Result result = this.musicService.withdrawInquiries(user, indexes);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameTolower());
        return response.toString();
    }
}
