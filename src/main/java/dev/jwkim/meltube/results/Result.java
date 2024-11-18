package dev.jwkim.meltube.results;

public interface Result {
    String NAME = "result";
    String name();

    default String nameTolower() {
        return this.name().toLowerCase();
    }
}
