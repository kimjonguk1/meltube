package dev.jwkim.meltube.mappers;

import dev.jwkim.meltube.entities.EmailTokenEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EmailTokenMapper {
    int insertEmailToken(EmailTokenEntity emailToken);

    EmailTokenEntity selectEmailTokenByUserEmailAndKey(@Param("userEmail") String userEmail, @Param("key") String key);

    int updateEmailToken(EmailTokenEntity emailToken);
}
