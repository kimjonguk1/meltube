package dev.jwkim.meltube.controllers;

import dev.jwkim.meltube.entities.UserEntity;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttribute;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping(value = "/")
public class HomeController {
    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public ModelAndView getIndex(@SessionAttribute(value = "user", required = false) UserEntity user) {
        ModelAndView mav = new ModelAndView();
        if(user == null) {
            mav.setViewName("home/index.unsigned");
        } else {
            mav.setViewName("home/index.signed");
        }
        return mav;
    }

    @RequestMapping(value = "/logout", method = RequestMethod.GET)
    public ModelAndView getLogout(HttpSession session) {
        session.setAttribute("user", null);
        ModelAndView mav = new ModelAndView();
        mav.setViewName("redirect:/");
        return mav;
    }
}
