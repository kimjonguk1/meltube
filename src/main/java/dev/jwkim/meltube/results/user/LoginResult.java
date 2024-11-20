package dev.jwkim.meltube.results.user;

import dev.jwkim.meltube.results.Result;

public enum LoginResult implements Result {
    FAILURE_NOT_VERIFIED,
    FAILURE_SUSPENDED
}
