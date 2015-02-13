local jwt = require "luajwt"
local auth = ngx.var.authorization
local users = ngx.shared.users
local projects = ngx.shared.projects
local project = ngx.req.project

if (project == nil and (ngx.req.uri ~= '/settings' and ngx.req.uri ~= '/login')) then
   ngx.say("invalid")
   ngx.exit(406)
end

local val, err = jwt.decode(auth, key, true)

if not val then
   return ngx.say("Error:", err)
end

-- val.user
