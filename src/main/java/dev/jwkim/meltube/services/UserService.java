package dev.jwkim.meltube.services;

import dev.jwkim.meltube.entities.EmailTokenEntity;
import dev.jwkim.meltube.entities.UserEntity;
import dev.jwkim.meltube.exceptions.TransactionalException;
import dev.jwkim.meltube.mappers.UserMapper;
import dev.jwkim.meltube.results.CommonResult;
import dev.jwkim.meltube.results.Result;
import dev.jwkim.meltube.results.user.RegisterResult;
import dev.jwkim.meltube.utils.CryptoUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {
    private final UserMapper userMapper;

    @Autowired
    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public Result register(UserEntity user) {

        if(user == null ||
        user.getEmail() == null || user.getEmail().length() < 8 || user.getEmail().length() > 50
        || user.getPassword() == null || user.getPassword().length() < 6 || user.getPassword().length() > 50
        || user.getNickname() == null || user.getNickname().length() < 2 || user.getNickname().length() > 10
        || user.getContact() == null || user.getContact().length() < 10 || user.getContact().length() > 12) {
            return CommonResult.FAILURE;
        }
        if(this.userMapper.selectUserByEmail(user.getEmail()) != null) {
            return RegisterResult.FAILURE_DUPLICATE_EMAIL;
        }
        if(this.userMapper.selectUserByNickname(user.getNickname()) != null) {
            return RegisterResult.FAILURE_DUPLICATE_NICKNAME;
        }
        if(this.userMapper.selectUserByContact(user.getContact()) != null) {
            return RegisterResult.FAILURE_DUPLICATE_CONTACT;
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        user.setPassword(encoder.encode(user.getPassword())); // 암호화
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setDeletedAt(null);
        user.setAdmin(false);
        user.setSuspended(false);
        user.setVerified(false);
        if(this.userMapper.insertUser(user) == 0) {
            throw new TransactionalException();
        }
        EmailTokenEntity emailToken = new EmailTokenEntity();
        emailToken.setUserEmail(user.getEmail());
        emailToken.setKey(CryptoUtils.hashSha512(String.format("%s%s%f%f", user.getEmail(), user.getPassword(), Math.random(), Math.random())));
        emailToken.setCreatedAt(LocalDateTime.now());
        emailToken.setExpiresAt(LocalDateTime.now().plusHours(24));
        emailToken.setUsed(false);
        // TODO emailToken INSERT 하기
        // TODO @Transactional 걸고 설명하기
        // TODO 이메일 보내기
        return CommonResult.SUCCESS;
//        return this.userMapper.insertUser(user) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }
}
