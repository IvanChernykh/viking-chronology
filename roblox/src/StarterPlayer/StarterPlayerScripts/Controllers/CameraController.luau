--!strict

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local Workspace = game:GetService("Workspace")

local CameraController = {}
CameraController.__index = CameraController

export type Mode = "Settlement" | "Voyage" | "Dialogue" | "FreeExplore"

function CameraController.new()
	return setmetatable({
		camera = Workspace.CurrentCamera,
		mode = "Settlement" :: Mode,
		target = Vector3.zero,
		position = Vector3.new(28, 18, 34),
		voyageTarget = nil :: BasePart?,
		yaw = math.rad(-35),
		pitch = math.rad(-17),
		distance = 42,
	}, CameraController)
end

function CameraController:setMode(mode: Mode, target: BasePart?)
	self.mode = mode
	self.voyageTarget = target
	if mode == "Voyage" then
		self.distance = 58
	end
	if mode == "Dialogue" then
		self.distance = 12
	end
end

function CameraController:_input(deltaTime: number)
	if self.mode == "Voyage" or self.mode == "Dialogue" then
		return
	end
	local move = Vector3.zero
	if UserInputService:IsKeyDown(Enum.KeyCode.W) then
		move += Vector3.new(0, 0, -1)
	end
	if UserInputService:IsKeyDown(Enum.KeyCode.S) then
		move += Vector3.new(0, 0, 1)
	end
	if UserInputService:IsKeyDown(Enum.KeyCode.A) then
		move += Vector3.new(-1, 0, 0)
	end
	if UserInputService:IsKeyDown(Enum.KeyCode.D) then
		move += Vector3.new(1, 0, 0)
	end
	if move.Magnitude > 0 then
		self.target += move.Unit * 32 * deltaTime
	end
end

function CameraController:_desired(): (Vector3, Vector3)
	local focus = self.target
	if self.mode == "Voyage" and self.voyageTarget then
		focus = self.voyageTarget.Position
		local velocity = self.voyageTarget.AssemblyLinearVelocity
		local heading = if velocity.Magnitude > 2 then velocity.Unit else self.voyageTarget.CFrame.LookVector
		local side = heading:Cross(Vector3.yAxis)
		return focus - heading * 44 + side * 24 + Vector3.new(0, 18, 0), focus + heading * 14
	end
	if self.mode == "Dialogue" and self.voyageTarget then
		focus = self.voyageTarget.Position + Vector3.new(0, 3, 0)
		return focus + Vector3.new(7, 3, 10), focus
	end
	local rotation = CFrame.fromEulerAnglesYXZ(self.pitch, self.yaw, 0)
	return focus + rotation:VectorToWorldSpace(Vector3.new(0, 0, self.distance)), focus
end

function CameraController:start()
	self.camera.CameraType = Enum.CameraType.Scriptable
	local character = Players.LocalPlayer.Character or Players.LocalPlayer.CharacterAdded:Wait()
	local root = character:WaitForChild("HumanoidRootPart") :: BasePart
	self.target = root.Position

	RunService:BindToRenderStep("VikingCamera", Enum.RenderPriority.Camera.Value + 1, function(deltaTime)
		self:_input(deltaTime)
		local desiredPosition, desiredFocus = self:_desired()
		self.position = self.position:Lerp(desiredPosition, 1 - math.exp(-5.5 * deltaTime))
		self.target = self.target:Lerp(desiredFocus, 1 - math.exp(-6.5 * deltaTime))
		self.camera.CFrame = CFrame.lookAt(self.position, self.target)
	end)
end

return CameraController
