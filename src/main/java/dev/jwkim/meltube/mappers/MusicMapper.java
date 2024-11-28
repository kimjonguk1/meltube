package dev.jwkim.meltube.mappers;

import dev.jwkim.meltube.entities.MusicEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MusicMapper {
    MusicEntity selectMusicByYoutubeId(@Param("youtubeId") String youtubeId);

    int insertMusic(MusicEntity music);

    MusicEntity[] selectMusicsByUserEmail(@Param("userEmail") String userEmail);

    MusicEntity selectMusicByIndex(@Param("index") int index, @Param("includeCover") boolean includeCover);

    int updateMusic(@Param("music") MusicEntity music, @Param("includeCover") boolean includeCover);

    MusicEntity[] selectMusics(@Param("includeCover") boolean includeCover);
}
