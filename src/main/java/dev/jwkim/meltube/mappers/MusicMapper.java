package dev.jwkim.meltube.mappers;

import dev.jwkim.meltube.entities.MusicEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MusicMapper {
    MusicEntity selectMusicByYoutubeId(@Param("youtubeId") String youtubeId);

    int insertMusic(MusicEntity music);
}
