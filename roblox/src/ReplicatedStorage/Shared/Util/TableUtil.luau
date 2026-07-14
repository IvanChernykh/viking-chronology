--!strict

local TableUtil = {}

function TableUtil.deepCopy<T>(value: T): T
	if typeof(value) ~= "table" then
		return value
	end
	local result = {}
	for key, child in value :: any do
		(result :: any)[TableUtil.deepCopy(key)] = TableUtil.deepCopy(child)
	end
	return result :: T
end

function TableUtil.reconcile(target: { [any]: any }, template: { [any]: any })
	for key, value in template do
		if target[key] == nil then
			target[key] = TableUtil.deepCopy(value)
		elseif typeof(target[key]) == "table" and typeof(value) == "table" then
			TableUtil.reconcile(target[key], value)
		end
	end
end

function TableUtil.clampResources(resources: { [string]: number })
	for key, value in resources do
		resources[key] = math.clamp(math.floor(value), 0, 9999)
	end
end

return TableUtil
