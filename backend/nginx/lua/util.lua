function string:split(delimiter)
    local result = {}
    local from = 1
    local delim_from, delim_to = string.find(self, delimiter, from)
    while delim_from do
        table.insert(result, string.sub(self, from, delim_from-1))
        from = delim_to + 1
        delim_from, delim_to = string.find(self, delimiter, from)
    end
    table.insert(result, string.sub(self, from))
    return result
end

function get_apikey()
    local apikey = ngx.header.Authorization

    if apikey == nil then
        local params = ngx.req.get_query_args()
        if params.apikey ~= nil then
           apikey = params.apikey
        end
        apikey = params.apikey
    end
    return apikey
end