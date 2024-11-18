package dev.jwkim.meltube.controllers;

import dev.jwkim.meltube.entities.UserEntity;
import dev.jwkim.meltube.results.Result;
import dev.jwkim.meltube.services.UserService;
import org.json.JSONObject;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String PostIndex(UserEntity user) {
        Result result = this.userService.register(user);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameTolower());
        return response.toString();
    }
}
