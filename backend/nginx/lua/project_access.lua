local url = ngx.var.uri
local elements = url.split("/")
local project_index = -1

for k, v in pairs(elements) do
    if v == "projects" then
        project_index = k
    end
end

if project_index == -1 then
    ngx.exit(ngx.HTTP_BAD_REQUEST)
end

local apikey = get_apikey()

if apikey == nil then
    ngx.log(ngx.WARN, "No APIKEY")
    ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

local res = ngx.location.capture("/authenticate_project/" .. elements[project_index],
    {args = { apikey: apikey}})
if res.status ~= 200 then
    ngx.log(ngx.WARN, "No access to project")
    ngx.exit(ngx.HTTP_UNAUTHORIZED)
end

