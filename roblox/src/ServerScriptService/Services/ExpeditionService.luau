--!strict

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Expeditions = require(Shared.Config.Expeditions)
local Protocol = require(Shared.Net.Protocol)
local RateLimiter = require(Shared.Util.RateLimiter)
local Types = require(Shared.Types)

type ExpeditionRuntime = Types.ExpeditionRuntime

local ExpeditionService = {}
ExpeditionService.__index = ExpeditionService

export type ExpeditionService = typeof(setmetatable({
	playerData = nil :: any,
	world = nil :: any,
	remotes = nil :: any,
	runtime = {} :: { [Player]: ExpeditionRuntime },
	limiter = RateLimiter.new(10, 12),
}, ExpeditionService))

function ExpeditionService.new(playerData: any, world: any, remotes: any): ExpeditionService
	return setmetatable({
		playerData = playerData,
		world = world,
		remotes = remotes,
		runtime = {},
		limiter = RateLimiter.new(10, 12),
	}, ExpeditionService)
end

function ExpeditionService:_canAfford(profile: Types.PlayerProfile, cost: Types.Resources): boolean
	for key, value in cost :: any do
		if (profile.resources :: any)[key] < value then
			return false
		end
	end
	return true
end

function ExpeditionService:_state(player: Player)
	local profile = self.playerData:get(player)
	self.remotes:fireClient(player, Protocol.Events.StateChanged, {
		profile = profile,
		expedition = self.runtime[player],
		serverTime = Workspace:GetServerTimeNow(),
	})
end

function ExpeditionService:startExpedition(player: Player, expeditionId: string)
	if not self.limiter:allow(player.UserId) then
		return
	end
	local definition = Expeditions[expeditionId]
	local profile = self.playerData:get(player)
	if definition == nil or profile == nil or self.runtime[player] ~= nil then
		return
	end
	if not self.world:isUnlocked(player, definition.origin) then
		return
	end
	if not self:_canAfford(profile, definition.cost) then
		self.remotes:fireClient(player, Protocol.Events.Notification, {
			kind = "error",
			key = "INSUFFICIENT_RESOURCES",
		})
		return
	end

	self.playerData:mutate(player, function(nextProfile)
		for key, value in definition.cost :: any do
			(nextProfile.resources :: any)[key] -= value
		end
	end)

	self.runtime[player] = {
		id = expeditionId,
		state = "Embarked",
		progress = 0,
		startedAt = Workspace:GetServerTimeNow(),
		resolvedEncounters = {},
		resources = table.clone(profile.resources),
		nextEncounterIndex = 1,
		activeEncounterId = nil,
	}
	self:_state(player)
end

function ExpeditionService:resolveEncounter(player: Player, encounterId: string, choiceId: string)
	if not self.limiter:allow(player.UserId) then
		return
	end
	local runtime = self.runtime[player]
	if runtime == nil or runtime.state ~= "Encounter" then
		return
	end
	if runtime.activeEncounterId ~= encounterId or runtime.resolvedEncounters[encounterId] then
		return
	end

	runtime.resolvedEncounters[encounterId] = true
	runtime.activeEncounterId = nil
	runtime.nextEncounterIndex += 1
	runtime.state = "Embarked"
	if choiceId == "CAUTIOUS" then
		runtime.resources.morale = math.max(0, runtime.resources.morale - 2)
	elseif choiceId == "RISKY" then
		runtime.resources.food = math.max(0, runtime.resources.food - 4)
	else
		runtime.resources.silver = math.max(0, runtime.resources.silver - 2)
	end
	self:_state(player)
end

function ExpeditionService:_complete(player: Player, runtime: ExpeditionRuntime)
	local definition = Expeditions[runtime.id]
	if definition == nil then
		return
	end
	runtime.state = "Completed"
	runtime.progress = 1
	self.world:unlock(player, definition.destination)
	self.playerData:mutate(player, function(profile)
		profile.completedExpeditions[runtime.id] = true
		for _, factId in definition.rewardFacts do
			profile.knownFacts[factId] = true
		end
		profile.resources.silver += 12
		profile.resources.morale = math.min(100, profile.resources.morale + 8)
	end)
	self:_state(player)
	task.delay(12, function()
		if self.runtime[player] == runtime then
			self.runtime[player] = nil
			self:_state(player)
		end
	end)
end

function ExpeditionService:_advance(player: Player, runtime: ExpeditionRuntime)
	local definition = Expeditions[runtime.id]
	if definition == nil or runtime.startedAt == nil then
		return
	end
	runtime.progress = math.clamp(
		(Workspace:GetServerTimeNow() - runtime.startedAt) / definition.durationSeconds,
		0,
		1
	)

	local encounterId = definition.encounterIds[runtime.nextEncounterIndex]
	if encounterId ~= nil then
		local threshold = runtime.nextEncounterIndex / (#definition.encounterIds + 1)
		if runtime.progress >= threshold then
			runtime.state = "Encounter"
			runtime.activeEncounterId = encounterId
			self:_state(player)
			self.remotes:fireClient(player, Protocol.Events.Notification, {
				kind = "encounter",
				encounterId = encounterId,
			})
			return
		end
	end

	if runtime.progress >= 1 then
		self:_complete(player, runtime)
	end
end

function ExpeditionService:start()
	self.remotes:getEvent(Protocol.Events.RequestExpedition).OnServerEvent:Connect(function(player, payload)
		if Protocol.validateExpedition(payload) then
			self:startExpedition(player, payload.expeditionId)
		end
	end)
	self.remotes:getEvent(Protocol.Events.ResolveEncounter).OnServerEvent:Connect(function(player, payload)
		if Protocol.validateEncounter(payload) then
			self:resolveEncounter(player, payload.encounterId, payload.choiceId)
		end
	end)
	self.remotes:getEvent(Protocol.Events.ClientReady).OnServerEvent:Connect(function(player)
		self:_state(player)
	end)
	Players.PlayerRemoving:Connect(function(player)
		self.runtime[player] = nil
		self.limiter:remove(player.UserId)
	end)

	task.spawn(function()
		while true do
			task.wait(0.25)
			for player, runtime in self.runtime do
				if runtime.state == "Embarked" then
					self:_advance(player, runtime)
				end
			end
		end
	end)
end

return ExpeditionService
