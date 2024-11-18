package dev.jwkim.meltube.controllers;

import dev.jwkim.meltube.entities.EmailTokenEntity;
import dev.jwkim.meltube.entities.UserEntity;
import dev.jwkim.meltube.results.Result;
import dev.jwkim.meltube.services.UserService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletRequest;
import org.json.JSONObject;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping(value = "/user")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String PostIndex(HttpServletRequest request, UserEntity user) throws MessagingException {
        Result result = this.userService.register(request, user);
        JSONObject response = new JSONObject();
        response.put(Result.NAME, result.nameTolower());
        return response.toString();
    }

    @RequestMapping(value = "/validate-email-token", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getValidateEmailToken(EmailTokenEntity emailToken) {
        Result result = this.userService.validateEmailToken(emailToken);
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.addObject(Result.NAME, result.nameTolower());
        modelAndView.setViewName("user/validateEmailToken");
        return modelAndView;
    }
}
