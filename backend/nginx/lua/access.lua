local apikey = get_apikey()

if apikey == nil then
    ngx.log(ngx.WARN, "No APIKEY")
    ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

local res = ngx.location.capture("/authenticate")
if res.status ~= 200 then
    ngx.log(ngx.WARN, "Bad APIKEY")
    ngx.exit(ngx.HTTP_UNAUTHORIZED)
end





