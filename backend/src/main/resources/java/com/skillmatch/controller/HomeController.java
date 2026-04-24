package com.skillmatch.controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "SkillMatch Backend Live 🚀";
    }
}