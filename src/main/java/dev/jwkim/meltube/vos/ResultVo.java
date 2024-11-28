package dev.jwkim.meltube.vos;

import dev.jwkim.meltube.results.Result;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ResultVo<TResult extends Result, TPayload> {
    private TResult result;
    private TPayload payload;

}
