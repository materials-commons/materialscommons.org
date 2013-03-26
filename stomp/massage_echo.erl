-module(massage_echo).
-export([doit/0]).

doit() ->
    Ignore = fun(_Msg) -> ok end,
    {ok, OutPid} = stomp_client:start("localhost", 61613, "guest", "guest", Ignore),

    Fun = fun([{type, "MESSAGE"}, {header, _Header}, {body, Body}]) ->
                io:format("Body: ~p~n", [Body]),
                NewMessage = string:concat("Massaged ", Body),
                NewMessage2 = string:concat(NewMessage, binary_to_list(<<"{\"a\":\"b\",\"c\":\"d\"}">>)),
                stomp_client:send_topic("massaged_echo", NewMessage2, [], OutPid);
            ([{type, _Type}, {header, _Header}, {body, _Body}]) ->
                ok
    end,
    {ok, Pid} = stomp_client:start("localhost", 61613, "guest", "guest", Fun),
    stomp_client:subscribe_topic("receive_echo", [], Pid).

