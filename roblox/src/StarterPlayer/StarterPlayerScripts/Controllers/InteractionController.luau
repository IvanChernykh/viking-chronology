--!strict

local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared.Config.GameConfig)
local Protocol = require(Shared.Net.Protocol)

local InteractionController = {}
InteractionController.__index = InteractionController

function InteractionController.new(remotes: Folder)
	return setmetatable({ remotes = remotes, current = nil :: Instance? }, InteractionController)
end

function InteractionController:_root(): BasePart?
	local character = Players.LocalPlayer.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	return if root and root:IsA("BasePart") then root else nil
end

function InteractionController:_scan()
	local root = self:_root()
	if root == nil then
		self.current = nil
		return
	end
	local nearest: Instance? = nil
	local nearestDistance = GameConfig.InteractionDistance
	for _, target in CollectionService:GetTagged("Interactable") do
		local part = if target:IsA("Model") then target.PrimaryPart else target
		if part and part:IsA("BasePart") then
			local distance = (part.Position - root.Position).Magnitude
			if distance < nearestDistance then
				nearest = target
				nearestDistance = distance
			end
		end
	end
	self.current = nearest
end

function InteractionController:interact()
	local target = self.current
	if target == nil then
		return
	end
	local id = target:GetAttribute("InteractionId")
	if typeof(id) ~= "string" then
		return
	end
	local remote = self.remotes:FindFirstChild(Protocol.Events.RequestInteraction)
	if remote and remote:IsA("RemoteEvent") then
		remote:FireServer({ targetId = id, clientTime = os.clock() })
	end
end

function InteractionController:start()
	local accumulator = 0
	RunService.Heartbeat:Connect(function(deltaTime)
		accumulator += deltaTime
		if accumulator >= 0.2 then
			accumulator = 0
			self:_scan()
		end
	end)
end

return InteractionController
