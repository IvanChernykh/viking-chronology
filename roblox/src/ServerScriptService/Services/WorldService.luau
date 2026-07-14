--!strict

local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Regions = require(Shared.Config.Regions)
local Types = require(Shared.Types)

type RegionId = Types.RegionId

local WorldService = {}
WorldService.__index = WorldService

export type WorldService = typeof(setmetatable({
	playerData = nil :: any,
	regionAnchors = {} :: { [RegionId]: BasePart },
}, WorldService))

function WorldService.new(playerData: any): WorldService
	return setmetatable({ playerData = playerData, regionAnchors = {} }, WorldService)
end

function WorldService:_ensureAnchor(regionId: RegionId, definition: any)
	local folder = Workspace:FindFirstChild("RegionAnchors")
	if folder == nil then
		folder = Instance.new("Folder")
		folder.Name = "RegionAnchors"
		folder.Parent = Workspace
	end
	local anchor = folder:FindFirstChild(regionId)
	if anchor == nil or not anchor:IsA("BasePart") then
		if anchor then
			anchor:Destroy()
		end
		anchor = Instance.new("Part")
		anchor.Name = regionId
		anchor.Anchored = true
		anchor.CanCollide = false
		anchor.CanQuery = false
		anchor.CanTouch = false
		anchor.Transparency = 1
		anchor.Size = Vector3.new(4, 4, 4)
		anchor.Position = definition.center
		anchor:SetAttribute("RegionId", regionId)
		anchor:SetAttribute("DisplayName", definition.displayName)
		anchor:SetAttribute("Radius", definition.radius)
		anchor.Parent = folder
		CollectionService:AddTag(anchor, "RegionAnchor")
	end
	self.regionAnchors[regionId] = anchor :: BasePart
end

function WorldService:init()
	for regionId, definition in Regions do
		self:_ensureAnchor(regionId, definition)
	end
end

function WorldService:isUnlocked(player: Player, regionId: RegionId): boolean
	local profile = self.playerData:get(player)
	return profile ~= nil and profile.unlockedRegions[regionId] == true
end

function WorldService:unlock(player: Player, regionId: RegionId)
	if Regions[regionId] == nil then
		return
	end
	self.playerData:mutate(player, function(profile)
		profile.unlockedRegions[regionId] = true
	end)
end

function WorldService:getNearestRegion(position: Vector3): RegionId
	local bestId: RegionId = "SCANDINAVIA"
	local bestDistance = math.huge
	for regionId, definition in Regions do
		local distance = (definition.center - position).Magnitude
		if distance < bestDistance then
			bestId, bestDistance = regionId, distance
		end
	end
	return bestId
end

function WorldService:start()
	Players.PlayerAdded:Connect(function(player)
		player.CharacterAdded:Connect(function(character)
			local root = character:WaitForChild("HumanoidRootPart", 15)
			if root and root:IsA("BasePart") then
				player.ReplicationFocus = root
			end
		end)
	end)
end

return WorldService
