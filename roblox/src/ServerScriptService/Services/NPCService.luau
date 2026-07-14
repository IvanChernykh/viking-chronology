--!strict

local PathfindingService = game:GetService("PathfindingService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local GameConfig = require(Shared.Config.GameConfig)

local NPCService = {}
NPCService.__index = NPCService

function NPCService.new()
	return setmetatable({ agents = {} }, NPCService)
end

function NPCService:register(model: Model)
	local humanoid = model:FindFirstChildOfClass("Humanoid")
	local root = model:FindFirstChild("HumanoidRootPart")
	if humanoid == nil or root == nil or not root:IsA("BasePart") then
		return
	end
	self.agents[model] = { humanoid = humanoid, root = root, nextThink = 0, home = root.Position }
end

function NPCService:_nearestPlayerDistance(position: Vector3): number
	local nearest = math.huge
	for _, player in Players:GetPlayers() do
		local root = player.Character and player.Character:FindFirstChild("HumanoidRootPart")
		if root and root:IsA("BasePart") then
			nearest = math.min(nearest, (root.Position - position).Magnitude)
		end
	end
	return nearest
end

function NPCService:_wander(agent: any)
	local offset = Vector3.new(math.random(-55, 55), 0, math.random(-55, 55))
	local destination = agent.home + offset
	local path = PathfindingService:CreatePath({
		AgentRadius = 2,
		AgentHeight = 5,
		AgentCanJump = true,
		Costs = { Water = 60 },
	})
	local ok = pcall(function()
		path:ComputeAsync(agent.root.Position, destination)
	end)
	if not ok or path.Status ~= Enum.PathStatus.Success then
		return
	end
	for _, waypoint in path:GetWaypoints() do
		agent.humanoid:MoveTo(waypoint.Position)
		if waypoint.Action == Enum.PathWaypointAction.Jump then
			agent.humanoid.Jump = true
		end
		local reached = agent.humanoid.MoveToFinished:Wait()
		if not reached then
			break
		end
	end
end

function NPCService:start()
	for _, descendant in Workspace:GetDescendants() do
		if descendant:IsA("Model") and descendant:GetAttribute("NPC") == true then
			self:register(descendant)
		end
	end
	Workspace.DescendantAdded:Connect(function(descendant)
		if descendant:IsA("Model") and descendant:GetAttribute("NPC") == true then
			self:register(descendant)
		end
	end)

	RunService.Heartbeat:Connect(function()
		local now = os.clock()
		for model, agent in self.agents do
			if model.Parent == nil then
				self.agents[model] = nil
				continue
			end
			local distance = self:_nearestPlayerDistance(agent.root.Position)
			agent.humanoid.AutoRotate = distance <= GameConfig.NPCSimulationRadius
			if distance <= GameConfig.NPCSimulationRadius and now >= agent.nextThink then
				agent.nextThink = now + math.random(7, 15)
				task.spawn(function()
					self:_wander(agent)
				end)
			end
		end
	end)
end

return NPCService
