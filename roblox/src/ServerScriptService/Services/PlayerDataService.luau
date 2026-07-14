--!strict

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared.Config.GameConfig)
local TableUtil = require(Shared.Util.TableUtil)
local Types = require(Shared.Types)

type PlayerProfile = Types.PlayerProfile

local PlayerDataService = {}
PlayerDataService.__index = PlayerDataService

local function createDefaultProfile(): PlayerProfile
	return {
		version = GameConfig.ProfileVersion,
		createdAt = os.time(),
		updatedAt = os.time(),
		resources = TableUtil.deepCopy(GameConfig.DefaultResources),
		unlockedRegions = { SCANDINAVIA = true },
		completedExpeditions = {},
		knownFacts = {},
		settings = { locale = GameConfig.DefaultLocale, quality = "Auto", subtitles = true },
	}
end

export type PlayerDataService = typeof(setmetatable({
	store = DataStoreService:GetDataStore(GameConfig.DataStoreName),
	profiles = {} :: { [Player]: PlayerProfile },
	dirty = {} :: { [Player]: boolean },
	shuttingDown = false,
}, PlayerDataService))

function PlayerDataService.new(): PlayerDataService
	return setmetatable({
		store = DataStoreService:GetDataStore(GameConfig.DataStoreName),
		profiles = {},
		dirty = {},
		shuttingDown = false,
	}, PlayerDataService)
end

function PlayerDataService:_key(player: Player): string
	return `player:{player.UserId}`
end

function PlayerDataService:_retry<T>(label: string, callback: () -> T): (boolean, T?)
	local lastError: any = nil
	for attempt = 1, 5 do
		local ok, result = pcall(callback)
		if ok then
			return true, result
		end
		lastError = result
		warn(`[PlayerData] {label} attempt {attempt} failed: {tostring(result)}`)
		task.wait(math.min(0.8 * (2 ^ (attempt - 1)), 8))
	end
	warn(`[PlayerData] {label} exhausted retries: {tostring(lastError)}`)
	return false, nil
end

function PlayerDataService:load(player: Player): PlayerProfile?
	local success, stored = self:_retry("load", function()
		return self.store:GetAsync(self:_key(player))
	end)
	if not success then
		return nil
	end

	local profile = if typeof(stored) == "table" then stored :: any else createDefaultProfile()
	TableUtil.reconcile(profile :: any, createDefaultProfile() :: any)
	profile.updatedAt = os.time()
	self.profiles[player] = profile
	self.dirty[player] = false
	return profile
end

function PlayerDataService:get(player: Player): PlayerProfile?
	return self.profiles[player]
end

function PlayerDataService:mutate(player: Player, callback: (PlayerProfile) -> ())
	local profile = self.profiles[player]
	if profile == nil then
		return
	end
	callback(profile)
	TableUtil.clampResources(profile.resources :: any)
	profile.updatedAt = os.time()
	self.dirty[player] = true
end

function PlayerDataService:save(player: Player, force: boolean?): boolean
	local profile = self.profiles[player]
	if profile == nil then
		return true
	end
	if not force and not self.dirty[player] then
		return true
	end
	local snapshot = TableUtil.deepCopy(profile)
	local success = self:_retry("save", function()
		return self.store:UpdateAsync(self:_key(player), function(current)
			local value = if typeof(current) == "table" then current else createDefaultProfile()
			TableUtil.reconcile(value, snapshot :: any)
			for key, child in snapshot :: any do
				value[key] = child
			end
			return value
		end)
	end)
	if success then
		self.dirty[player] = false
	end
	return success
end

function PlayerDataService:remove(player: Player)
	self:save(player, true)
	self.profiles[player] = nil
	self.dirty[player] = nil
end

function PlayerDataService:start()
	Players.PlayerAdded:Connect(function(player)
		local profile = self:load(player)
		if profile == nil then
			player:Kick("Не удалось безопасно загрузить сохранение. Попробуйте снова.")
		end
	end)
	Players.PlayerRemoving:Connect(function(player)
		self:remove(player)
	end)

	task.spawn(function()
		while not self.shuttingDown do
			task.wait(GameConfig.AutosaveSeconds)
			for player in self.profiles do
				self:save(player, false)
			end
		end
	end)

	game:BindToClose(function()
		self.shuttingDown = true
		local deadline = os.clock() + GameConfig.ShutdownSaveBudgetSeconds
		for player in self.profiles do
			if os.clock() >= deadline then
				break
			end
			self:save(player, true)
		end
	end)
end

return PlayerDataService
