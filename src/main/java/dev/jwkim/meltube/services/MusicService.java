package dev.jwkim.meltube.services;

import dev.jwkim.meltube.entities.MusicEntity;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class MusicService {
    public boolean verifyYoutubeId(String id) throws IOException, InterruptedException {
        if(id == null || id.length() != 11) {
            return false;
        }
        String url = String.format("http://img.youtube.com/vi/%s/mqdefault.jpg", id);
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder().
                uri(URI.create(url)).GET().build();
        HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
        return response.statusCode() != 404;
    }

    public MusicEntity crawlMelon(String id) throws IOException {
        if(id == null || id.length() != 8) {
            return null;
        }
        String url = String.format("https://www.melon.com/song/detail.htm?songId=%s", id);
        Document document = Jsoup.connect(url).get();
        Elements $name = document.select(".song_name");
        $name.select(".none").remove();
        Elements $artist = document.select(".artist_name > span:first-child");
        Elements $list = document.select("dl.list");
        Elements $album = $list.select("dd:nth-child(2)");
        Elements $releaseDate = $list.select("dd:nth-child(4)");
        Elements $genre = $list.select("dd:nth-child(6)");
        Elements $lyrics = document.select(".lyric");
        Elements $cover = document.select("img[onerror]");



        MusicEntity musicEntity = new MusicEntity();
        musicEntity.setArtist($artist.text());
        musicEntity.setAlbum($album.text());
        musicEntity.setReleaseDate(LocalDate.parse($releaseDate.text().replace(".", "-"), DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        musicEntity.setGenre($genre.text());
        musicEntity.setLyrics($lyrics.text());
        musicEntity.setName($name.text());
        musicEntity.setCoverFileName($cover.attr("src"));

        String searchQuery = URLEncoder.encode(String.format("%s %s site:youtube.com", musicEntity.getArtist(), musicEntity.getName()), StandardCharsets.UTF_8);
        Document googleSearchResult = Jsoup.connect(String.format("https://www.google.com/search?q=%s", searchQuery)).get();
        Element $firstH3 = googleSearchResult.selectFirst("h3");
        Element $anchor = $firstH3.parent();
        String href = $anchor.attr("href");
        String youtubeId= href.split("=")[1];
        musicEntity.setYoutubeId(youtubeId);
        return musicEntity;
    }
}
