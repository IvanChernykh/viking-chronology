--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Protocol = require(Shared.Net.Protocol)

local ExpeditionController = {}
ExpeditionController.__index = ExpeditionController

function ExpeditionController.new(remotes: Folder, ui: any, camera: any, audio: any)
	return setmetatable({ remotes = remotes, ui = ui, camera = camera, audio = audio, state = nil }, ExpeditionController)
end

function ExpeditionController:startExpedition(expeditionId: string)
	local event = self.remotes:FindFirstChild(Protocol.Events.RequestExpedition)
	if event and event:IsA("RemoteEvent") then
		event:FireServer({ expeditionId = expeditionId })
	end
end

function ExpeditionController:_voyageTarget(): BasePart?
	local target = Workspace:FindFirstChild("ActiveLongship", true)
	return if target and target:IsA("BasePart") then target else nil
end

function ExpeditionController:start()
	local changed = self.remotes:WaitForChild(Protocol.Events.StateChanged) :: RemoteEvent
	local notification = self.remotes:WaitForChild(Protocol.Events.Notification) :: RemoteEvent
	changed.OnClientEvent:Connect(function(payload)
		self.state = payload
		self.ui:update(payload)
		local runtime = payload.expedition
		local voyage = runtime ~= nil and (runtime.state == "Embarked" or runtime.state == "Encounter")
		self.audio:setVoyage(voyage)
		if voyage then
			self.camera:setMode("Voyage", self:_voyageTarget())
		else
			self.camera:setMode("Settlement", nil)
		end
	end)
	notification.OnClientEvent:Connect(function(payload)
		local message = payload.dialogueKey or payload.key or payload.interactionId or "Событие обновлено"
		self.ui:notify(tostring(message))
	end)
end

return ExpeditionController
