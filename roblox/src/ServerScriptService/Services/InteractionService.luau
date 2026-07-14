--!strict

local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared.Config.GameConfig)
local Protocol = require(Shared.Net.Protocol)
local RateLimiter = require(Shared.Util.RateLimiter)

local InteractionService = {}
InteractionService.__index = InteractionService

function InteractionService.new(remotes: any, playerData: any)
	return setmetatable({ remotes = remotes, playerData = playerData, limiter = RateLimiter.new(10, 24) }, InteractionService)
end

function InteractionService:_findTarget(targetId: string): Instance?
	for _, target in CollectionService:GetTagged("Interactable") do
		if target:GetAttribute("InteractionId") == targetId then
			return target
		end
	end
	return nil
end

function InteractionService:start()
	self.remotes:getEvent(Protocol.Events.RequestInteraction).OnServerEvent:Connect(function(player, payload)
		if not self.limiter:allow(player.UserId) or not Protocol.validateInteraction(payload) then
			return
		end
		local target = self:_findTarget(payload.targetId)
		local character = player.Character
		local root = character and character:FindFirstChild("HumanoidRootPart")
		local targetPart = target and (if target:IsA("Model") then target.PrimaryPart else target)
		if not root or not root:IsA("BasePart") or not targetPart or not targetPart:IsA("BasePart") then
			return
		end
		if (root.Position - targetPart.Position).Magnitude > GameConfig.InteractionDistance then
			return
		end
		self.remotes:fireClient(player, Protocol.Events.Notification, {
			kind = "interaction",
			interactionId = payload.targetId,
			dialogueKey = target:GetAttribute("DialogueKey"),
		})
	end)
end

return InteractionService
