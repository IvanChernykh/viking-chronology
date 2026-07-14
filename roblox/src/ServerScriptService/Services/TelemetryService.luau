--!strict

local AnalyticsService = game:GetService("AnalyticsService")
local HttpService = game:GetService("HttpService")
local Workspace = game:GetService("Workspace")

local TelemetryService = {}
TelemetryService.__index = TelemetryService

function TelemetryService.new()
	return setmetatable({ sessionId = HttpService:GenerateGUID(false) }, TelemetryService)
end

function TelemetryService:event(player: Player?, name: string, fields: { [string]: any }?)
	local payload = fields or {}
	payload.sessionId = self.sessionId
	payload.serverTime = Workspace:GetServerTimeNow()
	if player then
		payload.userId = player.UserId
	end
	pcall(function()
		AnalyticsService:LogCustomEvent(player, name, payload)
	end)
end

return TelemetryService
