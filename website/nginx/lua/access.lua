local jwt = require "luajwt"
local auth = ngx.var.authorization
local users = ngx.shared.users
local projects = ngx.shared.projects
local project = ngx.req.project

if project == nil then


end
