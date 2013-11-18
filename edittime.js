function GetPluginSettings()
{
	return {
		"name":			"CocoonJS",
		"id":			"CJSAds",
		"version":		"1.0",
		"description":	"Access CocoonJS extensions like ads and in-app purchases.",
		"author":		"Scirra",
		"help url":		"http://wiki.ludei.com/Home",
		"category":		"Platform specific",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0, 0, "Is showing banner ad", "Ads", "Is showing banner ad", "True if currently showing a banner ad.", "IsShowingBanner");
AddCondition(1, 0, "Is in CocoonJS", "CocoonJS", "Is in CocoonJS", "True if currently running on the CocoonJS platform.", "IsCocoonJS");
AddCondition(2, cf_trigger, "On banner shown", "Ads", "On banner shown", "Triggered when a banner ad is shown.", "OnBannerShown");
AddCondition(3, cf_trigger, "On fullscreen ad shown", "Ads", "On fullscreen ad shown", "Triggered when a fullscreen ad is shown.", "OnFullscreenShown");
AddCondition(4, cf_trigger, "On fullscreen ad hidden", "Ads", "On fullscreen ad hidden", "Triggered when a fullscreen ad is hidden.", "OnFullscreenHidden");
AddCondition(5, 0, "Is showing fullscreen ad", "Ads", "Is showing fullscreen ad", "True if currently showing a fullscreen ad.", "IsShowingFullscreen");

AddCondition(6, 0, "Is store available", "In-app purchase", "Is store available", "Test if the store is available on the current platform.", "IsStoreAvailable");

AddStringParam("Product ID", "A string identifying the product.");
AddCondition(7, cf_trigger, "On purchase started", "In-app purchase", "On <i>{0}</i> purchase started", "Triggered when the user begins a product purchase.", "OnPurchaseStart");

AddStringParam("Product ID", "A string identifying the product.");
AddCondition(8, cf_trigger, "On purchase completed", "In-app purchase", "On <i>{0}</i> purchase completed", "Triggered when a purchase successfully completes.", "OnPurchaseComplete");

AddStringParam("Product ID", "A string identifying the product.");
AddCondition(9, cf_trigger, "On purchase failed", "In-app purchase", "On <i>{0}</i> purchase failed", "Triggered when a purchase ends unsuccessfully.", "OnPurchaseFail");

AddStringParam("Product ID", "A string identifying the product.");
AddCondition(10, 0, "Is product purchased", "In-app purchase", "Is product <i>{0}</i> purchased", "Test if a particular product is purchased.", "IsProductPurchased");

AddCondition(11, cf_trigger, "On input cancelled", "Keyboard input", "On keyboard input cancelled", "Triggered after opening a text input dialog which is then cancelled.", "OnKeyboardCancelled");

AddCondition(12, cf_trigger, "On input OK", "Keyboard input", "On keyboard input OK", "Triggered after opening a text input dialog which is then OK'd.", "OnKeyboardOK");

AddCondition(13, 0, "Is available", "Game Center", "Is Game Center available", "Check if the Game Center service is available.", "IsGCAvailable");

AddCondition(14, 0, "Is logged in", "Game Center", "Is logged in to Game Center", "True if the user has successfully logged in to Game Center", "IsGCLoggedIn");

AddCondition(15, cf_trigger, "On login succeeded", "Game Center", "On Game Center login succeeded", "Triggered when the user successfully completes a Game Center login.", "OnGCLoginSuccess");

AddCondition(16, cf_trigger, "On login failed", "Game Center", "On Game Center login failed", "Triggered when the user fails to complete a Game Center login.", "OnGCLoginFail");

AddCondition(17, cf_trigger, "On score received", "Game Center", "On score received", "Triggered after requesting a score completes successfully.", "OnGCScoreReceived");

AddCondition(18, cf_trigger, "On score unavailable", "Game Center", "On score unavailable", "Triggered after requesting a score fails to complete successfully.", "OnGCScoreUnavailable");

AddCondition(19, cf_trigger, "On score submit success", "Game Center", "On score submit success", "Triggered after submitting a score completes successfully.", "OnGCScoreSubmitSuccess");

AddCondition(20, cf_trigger, "On score submit fail", "Game Center", "On score submit fail", "Triggered after submitting a score fails to complete successfully.", "OnGCScoreSubmitFail");

AddCondition(21, cf_trigger, "On leaderboard view opened", "Game Center", "On leaderboard view opened", "Triggered when the leaderboard view opens successfully.", "OnGCLeaderboardOpen");

AddCondition(22, cf_trigger, "On leaderboard view closed", "Game Center", "On leaderboard view closed", "Triggered when the leaderboard view is closed by the user.", "OnGCLeaderboardClose");

AddCondition(23, cf_trigger, "On logout", "Game Center", "On Game Center logout", "Triggered when the user logs out from Game Center.", "OnGCLogout");

AddCondition(24, cf_trigger, "On products fetch completed", "In-app purchase", "On products fetch completed", "Triggered when all the products have been downloaded.", "onProductsFetchCompleted");

AddCondition(25, cf_trigger, "On products fetch failed", "In-app purchase", "On products fetch failed", "Triggered when the fetch product function fails. ", "onProductsFetchFailed");

AddCondition(26, cf_trigger, "On products fetch started", "In-app purchase", "On products fetch started", "Triggered when the download of products starts.", "onProductsFetchStarted");

AddCondition(27, cf_trigger, "On consume purchase failed", "In-app purchase", "On consume purchase failed", "Triggered when the purchase has failed.", "onConsumePurchaseFailed");

//////////////////////////////////////////////////////////////
// Actions
AddComboParamOption("top center");
AddComboParamOption("bottom center");
AddComboParam("Layout", "Choose where the banner ad will appear.");
AddAction(0, 0, "Show banner ad", "Ads", "Show banner ad {0}", "Show a banner ad on the screen while the game is running.", "ShowBanner");

AddAction(1, 0, "Show fullscreen ad", "Ads", "Show fullscreen ad", "Show a fullscreen advert that hides the running game.", "ShowFullscreen");

AddAction(2, 0, "Hide banner ad", "Ads", "Hide banner ad", "Hide any currently showing banner ad.", "HideBanner");

AddAction(3, 0, "Preload banner ad", "Ads", "Preload banner ad", "Start loading a banner ad in the background.", "PreloadBanner");
AddAction(4, 0, "Preload fullscreen ad", "Ads", "Preload fullscreen ad", "Start loading a fullscreen ad in the background.", "PreloadFullscreen");

AddStringParam("Product ID", "A string identifying the product.");
AddAction(5, 0, "Purchase product", "In-app purchase", "Purchase product <b>{0}</b>", "Purchase a product by its ID.", "Purchase");

AddStringParam("Product ID", "A string identifying the product.");
AddAction(6, 0, "Purchase product with preview", "In-app purchase", "Purchase product <b>{0}</b> with preview", "Purchase a product by its ID, showing a dialog with a preview of the product (title and description).", "PurchasePreview");

AddAction(7, 0, "Restore purchases", "In-app purchase", "Restore purchases", "Restores all purchases from the platform's market.", "RestorePurchases");

AddStringParam("Title", "The title to appear on the dialog.");
AddStringParam("Message", "A message to appear on the dialog.");
AddStringParam("Initial text", "The initial entered text to show on the dialog.");
AddComboParamOption("Text");
AddComboParamOption("Number");
AddComboParamOption("Phone");
AddComboParamOption("Email");
AddComboParamOption("URL");
AddComboParam("Type", "The type of text input to use.");
AddStringParam("Cancel text", "The 'Cancel' button text.", "\"Cancel\"");
AddStringParam("OK text", "The 'OK' button text.", "\"OK\"");
AddAction(8, 0, "Prompt text input", "Keyboard input", "Prompt text input (title <i>{0}</i>, message <i>{1}</i>, initial text <i>{2}</i>, type <i>{3}</i>, cancel text <i>{4}</i>, OK text <i>{5}</i>)", "Open a dialog where the user can enter some text via the on-screen keyboard.", "PromptKeyboard");

AddAction(9, 0, "Update products list", "In-app purchase", "Update products list", "Update the list of products returned by the product information expressions.", "UpdateProductsList");

AddAction(10, 0, "Request login", "Game Center", "Request login", "Request the user to log in to Game Center.", "GCLogin");

AddNumberParam("Score", "The score to submit to Game Center.");
AddStringParam("Leaderboard", "The name of the leaderboard to submit to, e.g. \"My Game Name\"");
AddAction(11, 0, "Submit score", "Game Center", "Submit score of <i>{0}</i> to Game Center leaderboard <i>{1}</i>", "Submit a score to Game Center.", "GCSubmitScore");

AddStringParam("Leaderboard", "The name of the leaderboard to retrieve from, e.g. \"My Game Name\"");
AddAction(12, 0, "Request user score", "Game Center", "Request user score from leaderboard <i>{0}</i>", "Request the user's current best score from Game Center", "GCRequestScore");

AddStringParam("Leaderboard", "The name of the leaderboard to open, e.g. \"My Game Name\"");
AddAction(13, 0, "Open leaderboard view", "Game Center", "Open Game Center leaderboard <i>{0}</i> view", "Open the Game Center leaderboard view.", "GCOpenLeaderboard");

AddAction(14, 0, "Request logout", "Game Center", "Request logout", "Request the user to log out of Game Center.", "GCLogout");

AddAction(15, 0, "Refresh banner", "Ads", "Refresh banner", "Replace a currently showing banner with a new ad.", "RefreshBanner");

AddAction(16, 0, "Refresh fullscreen ad", "Ads", "Refresh fullscreen ad", "Replace a currently showing fullscreen ad with a new ad.", "RefreshFullscreen");

AddStringParam("Product list", 'The product list followed by commas of products IDs that you want to fetch from store server, example: "remove.ads,buy.coins,buy.magical.sword"');
AddAction(17, 0, "Fetch products from store", "In-app purchase", "Fetch those products from store: <i>{0}</i>", "Fetch products from store", "fetchProductsFromStore");

AddAction(18, 0, "Restore purchases", "In-app purchase", "Restore purchases", "Restoring the purchases is the way of returning purchased items information from the platform Store. ", "restorePurchases");

//////////////////////////////////////////////////////////////
// Expressions
AddExpression(0, ef_return_string, "", "Keyboard input", "InputText", "In 'On input OK', get the text entered.");

AddExpression(1, ef_return_number, "", "In-app purchase", "ProductCount", "Return the number of products available for purchase.");

AddNumberParam("Index", "Zero-based index of product to get.");
AddExpression(2, ef_return_string, "", "In-app purchase", "ProductDescription", "Return the description of the Nth product.");

AddNumberParam("Index", "Zero-based index of product to get.");
AddExpression(3, ef_return_string, "", "In-app purchase", "ProductLocalizedPrice", "Return the price of the Nth product in a localized format.");

AddNumberParam("Index", "Zero-based index of product to get.");
AddExpression(4, ef_return_string, "", "In-app purchase", "ProductPrice", "Return the price of the Nth product.");

AddNumberParam("Index", "Zero-based index of product to get.");
AddExpression(5, ef_return_string, "", "In-app purchase", "ProductAlias", "Return the alias of the Nth product.");

AddNumberParam("Index", "Zero-based index of product to get.");
AddExpression(6, ef_return_string, "", "In-app purchase", "ProductID", "Return the ID of the Nth product.");

AddNumberParam("Index", "Zero-based index of product to get.");
AddExpression(7, ef_return_string, "", "In-app purchase", "ProductTitle", "Return the title of the Nth product.");

AddExpression(8, ef_return_number, "", "Game Center", "GameCenterScore", "Return the score requested from Game Center.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
	new cr.Property(ept_combo,	"Physics engine",				"Accelerated",		"Whether to use the CocoonJS accelerated physics engine or the standard web-based one.", "Accelerated|Standard web-based"),
	new cr.Property(ept_combo,	"Store mode",			"Managed",		"Whether to use the store in managed mode (using Ludei's cloud service).", "Managed|Unmanaged"),
	new cr.Property(ept_combo,	"Store sandbox",		"Enabled",			"Whether to use the store in sandbox mode (for testing).", "Disabled|Enabled")
	];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance, this);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{
}
