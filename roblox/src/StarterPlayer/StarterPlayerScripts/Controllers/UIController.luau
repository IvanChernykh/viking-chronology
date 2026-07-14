--!strict

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")

local UIController = {}
UIController.__index = UIController

local function label(parent: Instance, text: string, size: UDim2, position: UDim2, font: Enum.Font): TextLabel
	local item = Instance.new("TextLabel")
	item.Size = size
	item.Position = position
	item.BackgroundTransparency = 1
	item.Text = text
	item.TextColor3 = Color3.fromRGB(224, 221, 207)
	item.TextXAlignment = Enum.TextXAlignment.Left
	item.Font = font
	item.TextScaled = true
	item.Parent = parent
	return item
end

function UIController.new()
	return setmetatable({
		gui = nil :: ScreenGui?,
		panel = nil :: Frame?,
		status = nil :: TextLabel?,
		resources = nil :: TextLabel?,
	}, UIController)
end

function UIController:start()
	local gui = Instance.new("ScreenGui")
	gui.Name = "VikingHUD"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = false
	gui.Parent = Players.LocalPlayer:WaitForChild("PlayerGui")

	local panel = Instance.new("Frame")
	panel.Name = "CommandPanel"
	panel.AnchorPoint = Vector2.new(0, 1)
	panel.Position = UDim2.fromScale(0.025, 0.965)
	panel.Size = UDim2.fromOffset(430, 180)
	panel.BackgroundColor3 = Color3.fromRGB(13, 20, 25)
	panel.BackgroundTransparency = 0.1
	panel.BorderSizePixel = 0
	panel.Parent = gui

	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 14)
	corner.Parent = panel
	local stroke = Instance.new("UIStroke")
	stroke.Color = Color3.fromRGB(163, 135, 78)
	stroke.Transparency = 0.45
	stroke.Thickness = 1
	stroke.Parent = panel

	label(panel, "VIKING CHRONOLOGY", UDim2.fromOffset(390, 32), UDim2.fromOffset(20, 15), Enum.Font.GothamBold)
	self.status = label(panel, "Поселение · 750 год", UDim2.fromOffset(390, 30), UDim2.fromOffset(20, 55), Enum.Font.GothamMedium)
	self.resources = label(
		panel,
		"Провизия 80 · Древесина 55 · Парусина 35 · Мораль 70",
		UDim2.fromOffset(390, 42),
		UDim2.fromOffset(20, 94),
		Enum.Font.Gotham
	)
	label(panel, "E — взаимодействие   J — хроника", UDim2.fromOffset(390, 24), UDim2.fromOffset(20, 140), Enum.Font.Gotham)

	self.gui = gui
	self.panel = panel
end

function UIController:update(payload: any)
	if self.status == nil or self.resources == nil then
		return
	end
	local expedition = payload.expedition
	local profile = payload.profile
	if expedition then
		self.status.Text = `{expedition.state} · {math.floor((expedition.progress or 0) * 100)}% пути`
	else
		self.status.Text = "Поселение · совет экспедиции"
	end
	if profile and profile.resources then
		local resources = profile.resources
		self.resources.Text = `Провизия {resources.food} · Древесина {resources.timber} · Парусина {resources.cloth} · Мораль {resources.morale}`
	end
end

function UIController:notify(message: string)
	if self.gui == nil then
		return
	end
	local toast = Instance.new("TextLabel")
	toast.AnchorPoint = Vector2.new(0.5, 0)
	toast.Position = UDim2.fromScale(0.5, 0.06)
	toast.Size = UDim2.fromOffset(620, 54)
	toast.BackgroundColor3 = Color3.fromRGB(16, 24, 29)
	toast.BackgroundTransparency = 0.08
	toast.Text = message
	toast.TextColor3 = Color3.fromRGB(233, 213, 165)
	toast.Font = Enum.Font.GothamMedium
	toast.TextScaled = true
	toast.Parent = self.gui
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 12)
	corner.Parent = toast
	TweenService:Create(toast, TweenInfo.new(0.3), { Position = UDim2.fromScale(0.5, 0.09) }):Play()
	task.delay(4, function()
		TweenService:Create(toast, TweenInfo.new(0.3), { TextTransparency = 1, BackgroundTransparency = 1 }):Play()
		task.wait(0.35)
		toast:Destroy()
	end)
end

return UIController
