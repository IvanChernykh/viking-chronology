--!strict

local GuiService = game:GetService("GuiService")
local Players = game:GetService("Players")

local StreamingController = {}
StreamingController.__index = StreamingController

function StreamingController.new()
	return setmetatable({ gui = nil :: ScreenGui? }, StreamingController)
end

function StreamingController:_buildGui()
	local gui = Instance.new("ScreenGui")
	gui.Name = "StreamingPause"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = true
	gui.DisplayOrder = 9999
	gui.Enabled = false
	gui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")

	local shade = Instance.new("Frame")
	shade.Size = UDim2.fromScale(1, 1)
	shade.BackgroundColor3 = Color3.fromRGB(7, 11, 15)
	shade.BackgroundTransparency = 0.12
	shade.Parent = gui

	local label = Instance.new("TextLabel")
	label.AnchorPoint = Vector2.new(0.5, 0.5)
	label.Position = UDim2.fromScale(0.5, 0.5)
	label.Size = UDim2.fromOffset(720, 90)
	label.BackgroundTransparency = 1
	label.Text = "Мир впереди ещё загружается\nСохраняем целостность путешествия…"
	label.TextColor3 = Color3.fromRGB(225, 205, 158)
	label.Font = Enum.Font.GothamMedium
	label.TextScaled = true
	label.Parent = shade
	self.gui = gui
end

function StreamingController:start()
	self:_buildGui()
	GuiService:SetGameplayPausedNotificationEnabled(false)
	local player = Players.LocalPlayer
	local function update()
		if self.gui then
			self.gui.Enabled = player.GameplayPaused
		end
	end
	player:GetPropertyChangedSignal("GameplayPaused"):Connect(update)
	update()
end

function StreamingController:requestAround(position: Vector3)
	task.spawn(function()
		pcall(function()
			Players.LocalPlayer:RequestStreamAroundAsync(position, 8)
		end)
	end)
end

return StreamingController
