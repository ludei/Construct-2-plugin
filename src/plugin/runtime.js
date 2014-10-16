/**
* Object holder for the plugin
*/
cr.plugins_.CJSAds = function(runtime)
{
	this.runtime = runtime;
};
/**
* C2 plugin
*/
(function ()
{
	var input_text = "";
	var PurchaseTransactionId = "";
	var PurchaseProductId = "";
	var products_list = [];
	var requested_score = 0;
	var showBanner = true;
	var bannerPosition = 0;
	var bannerReady = false;
	var fullscreenReady = false;
	var pluginProto = cr.plugins_.CJSAds.prototype;
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};
	var typeProto = pluginProto.Type.prototype;
	typeProto.onCreate = function()
	{
	};
	/**
	* C2 specific behaviour
	*/
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
	};
	var instanceProto = pluginProto.Instance.prototype;
	var self;
	instanceProto.onCreate = function()
	{
		this.isShowingBanner  		= false;
		this.isShowingFullscreen 	= false;
		this.triggerProduct 		= "";
		this.socialService 			= null;
		this.socialServiceAvailable = false;
		this.socialServiceSelected 	= this.properties[2];
		this.storeServiceAvailable 	= (this.runtime.isCocoonJs && typeof CocoonJS["Store"]["nativeExtensionObjectAvailable"] !== "undefined");
		this.storeManaged 			= (this.properties[1] !== 1);
		this.storeSandboxed 		= (this.properties[3] !== 0);
		this.socialServiceClientID 	= this.properties[4];
		this.facebookAppID 			= this.properties[5];
		this.facebookChannel 		= this.properties[6];
		this.onConsumePurchaseFailedTransactionId 	= "";
		this.onConsumePurchaseCompleted 			= "";
		this.onPurchaseCompleteInfo 				= "";

		self = this;
		if (self.runtime.isCocoonJs)
		{
			CocoonJS["App"]["onTextDialogFinished"].addEventListener(function(text) {
				input_text = text;
				self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnKeyboardOK, self);
			});
			CocoonJS["App"]["onTextDialogCancelled"].addEventListener(function() {
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnKeyboardCancelled, self);
			});
			CocoonJS["Ad"]["onBannerShown"].addEventListener(function ()
			{
				self.isShowingBanner = true;
				self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnBannerShown, self);
			});
			CocoonJS["Ad"]["onBannerReady"].addEventListener(function ()
			{
				bannerReady = true;
				self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onBannerReady, self);
			});
			CocoonJS["Ad"]["onBannerHidden"].addEventListener(function ()
			{
				self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onBannerHidden, self);
			});
			CocoonJS["Ad"]["onFullScreenShown"].addEventListener(function ()
			{
				self.isShowingFullscreen = true;
				self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnFullscreenShown, self);
			});
			CocoonJS["Ad"]["onFullScreenHidden"].addEventListener(function ()
			{
				self.isShowingFullscreen = false;
				self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnFullscreenHidden, self);
			});
			CocoonJS["Ad"]["onFullScreenReady"].addEventListener(function ()
			{
				fullscreenReady = true;
				self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onFullScreenReady, self);
			});
			if (self.storeServiceAvailable)
			{
				CocoonJS["Store"]["onConsumePurchaseFailed"].addEventListener(function(transactionId, errorMessage)
				{
					self.onConsumePurchaseFailedTransactionId = transactionId;
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onConsumePurchaseFailed, self);
				});
				CocoonJS["Store"]["onConsumePurchaseStarted"].addEventListener(function()
				{
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onConsumePurchaseStarted, self);
				});
				CocoonJS["Store"]["onConsumePurchaseCompleted"].addEventListener(function(transactionId)
				{
					self.onConsumePurchaseCompleted = transactionId;
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onConsumePurchaseCompleted, self);
				});
				CocoonJS["Store"]["onProductPurchaseCompleted"].addEventListener(function (purchase)
				{
					console.log("onProductPurchaseCompleted " + purchase["productId"]);
					self.triggerProduct = purchase["productId"];
					PurchaseTransactionId = purchase["transactionId"];
					PurchaseProductId = purchase["productId"];
					CocoonJS["Store"]["addPurchase"](purchase);
					CocoonJS["Store"]["finishPurchase"](purchase["transactionId"]);
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnPurchaseComplete, self);
				});
				CocoonJS["Store"]["onProductPurchaseFailed"].addEventListener(function (productId, errorMsg)
				{
					console.log("onProductPurchaseFailed " + productId);
					self.triggerProduct = productId;
					console.log(errorMsg);
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnPurchaseFail, self);
				});
				CocoonJS["Store"]["onProductPurchaseStarted"].addEventListener(function (productId)
				{
					console.log("onProductPurchaseStarted " + productId);
					self.triggerProduct = productId;
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnPurchaseStart, self);
				});
				CocoonJS["Store"]["onProductsFetchStarted"].addEventListener(function ()
				{
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onProductsFetchStarted, self);
				});
				CocoonJS["Store"]["onProductsFetchFailed"].addEventListener(function ()
				{
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onProductsFetchFailed, self);
				});
				CocoonJS["Store"]["onProductsFetchCompleted"].addEventListener(function (products)
				{
					for (var i = products.length - 1; i >= 0; i--) {
                        console.log("Product fetched: " + products[i].productId);
						CocoonJS["Store"]["addProduct"](products[i]);
					};
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onProductsFetchCompleted, self);
				});
				CocoonJS["Store"]["onRestorePurchasesStarted"].addEventListener(function ()
				{
					console.log("onRestorePurchasesStarted ");
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onRestorePurchasesStarted, self);
				});
				CocoonJS["Store"]["onRestorePurchasesCompleted"].addEventListener(function ()
				{
					console.log("onRestorePurchasesCompleted ");
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onRestorePurchasesCompleted, self);
				});
				CocoonJS["Store"]["onRestorePurchasesFailed"].addEventListener(function ()
				{
					console.log("onRestorePurchasesFailed ");
					self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onRestorePurchasesFailed, self);
				});
				CocoonJS["Store"]["requestInitialization"]({
					"managed": self.storeManaged,
					"sandbox": self.storeSandboxed
				});
				CocoonJS["Store"]["start"]();
			}
			/**
			* No social service selected, return.
			*/
			if(this.socialServiceSelected === 0) return;
			/**
			* Set the social interface for the selected service
			*/
			this.startGameCenter = function(){
				console.log("GameCenter selected as social service");
				this.socialService = CocoonJS["Social"]["GameCenter"];
				if(this.socialService){
					if(!!this.socialService["nativeExtensionObjectAvailable"])
					this.socialServiceInterface = this.socialService.getSocialInterface();
				}else{
					throw new Error("Cannot find GameCenter service, are you using the latest CocoonJS Extensions?");
				}
			}
			this.startGooglePlay = function(){
				console.log("GooglePlayGames selected as social service");
				this.socialService = CocoonJS["Social"]["GooglePlayGames"];
				if(this.socialService){
					var config = {};
					if(this.socialServiceClientID) config.clientId = this.socialServiceClientID;
					this.socialService.init(config);
					if(!!this.socialService["nativeExtensionObjectAvailable"]){
						this.socialServiceInterface = this.socialService.getSocialInterface();
					}
				}else{
					throw new Error("Cannot find GooglePlayGames service, are you using the latest CocoonJS Extensions?");
				}
			}
			this.startFacebook = function(){
				console.log("Facebook selected as social service");
				this.socialService = CocoonJS["Social"]["Facebook"];
				if(this.socialService){
					var config = {};
					if(this.facebookAppID && this.facebookChannel){
						config.appId = this.facebookAppID;
						config.channelUrl = this.facebookChannel;
					} 
					this.socialService.init(config);
					if(!!this.socialService["nativeExtensionObjectAvailable"]){
						this.socialServiceInterface = this.socialService.getSocialInterface();
						this.socialServiceInterface.setTemplates("leaderboards.html", "achievements.html");
					}
				}else{
					throw new Error("Cannot find Facebook service, are you using the latest CocoonJS Extensions?");
				}
			}
			if(this.socialServiceSelected === 2) this.startGameCenter.apply(this,[]);
			if(this.socialServiceSelected === 3) this.startGooglePlay.apply(this,[]);
			if(this.socialServiceSelected === 4) this.startFacebook.apply(this,[]);
			if(this.socialServiceSelected === 1){
				if(CocoonJS["Social"]["GooglePlayGames"]["nativeExtensionObjectAvailable"]){
					this.startGooglePlay.apply(this,[]);
				}else if(CocoonJS["Social"]["GameCenter"]["nativeExtensionObjectAvailable"]){
					this.startGameCenter.apply(this,[]);
				}else{
					return;
				}
			}
		}
	};
	function Cnds() {};
	Cnds.prototype.IsShowingBanner = function ()
	{
		return this.isShowingBanner;
	};
	Cnds.prototype.IsCocoonJS = function ()
	{
		return this.runtime.isCocoonJs;
	};
	Cnds.prototype.OnBannerShown = function ()
	{
		return true;
	};
	Cnds.prototype.OnFullscreenShown = function ()
	{
		return true;
	};
	Cnds.prototype.OnFullscreenHidden = function ()
	{
		return true;
	};
	Cnds.prototype.onFullScreenReady = function ()
	{
		return true;
	};
	Cnds.prototype.onBannerReady = function ()
	{
		return true;
	};
	Cnds.prototype.onBannerHidden = function ()
	{
		return true;
	};
	Cnds.prototype.IsShowingFullscreen = function ()
	{
		return this.isShowingFullscreen;
	};
	Cnds.prototype.PreloadFullscreen = function(){
		return true;
	}
	Cnds.prototype.IsStoreAvailable = function ()
	{
		if (this.runtime.isCocoonJs)
			return this.storeServiceAvailable && CocoonJS["Store"]["canPurchase"]();
		else
			return false;
	};
	Cnds.prototype.OnPurchaseStart = function (productid)
	{
		console.log("OnPurchaseStart");
		return this.triggerProduct === productid;
	};
	Cnds.prototype.OnPurchaseComplete = function (productid)
	{
		console.log("OnPurchaseComplete");
		return this.triggerProduct === productid;
	};
	Cnds.prototype.OnPurchaseFail = function (productid)
	{
		console.log("OnPurchaseFail");
		return this.triggerProduct === productid;
	};
	Cnds.prototype.onProductsFetchStarted = function(){
		return true;
	}
	Cnds.prototype.onConsumePurchaseFailed = function(){
		return true;
	}
	Cnds.prototype.onConsumePurchaseCompleted = function(){
		return true;
	}
	Cnds.prototype.onConsumePurchaseStarted = function(){
		return true;
	}
	Cnds.prototype.onProductsFetchCompleted = function(){
		return true;
	}
	Cnds.prototype.onProductsFetchFailed = function(){
		return true;
	}
	Cnds.prototype.IsProductPurchased = function (productid)
	{
		if (this.runtime.isCocoonJs)
			return CocoonJS["Store"]["isProductPurchased"](productid);
		else
			return false;
	};
	Cnds.prototype.OnKeyboardCancelled = function ()
	{
		return true;
	};
	Cnds.prototype.OnKeyboardOK = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceLoginSuccess = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceLoginFailed = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceLogoutSuccess = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceLogoutFailed = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceSubmitScoreSuccess = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceSubmitScoreFailed = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceRequestScoreSuccess = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceRequestScoreFailed = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceOpenLeaderBoardSuccess = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceOpenLeaderBoardClosed = function ()
	{
		return true;
	};
	Cnds.prototype.onSocialServiceOpenAchievementsSuccess = function(){
		return true;
	};
	Cnds.prototype.onSocialServiceOpenAchievementsClosed = function(){
		return true;
	};
	Cnds.prototype.onSocialServiceResetAchievementsCompleted = function(){
		return true;
	};
	Cnds.prototype.onSocialServiceResetAchievementsFailed = function(){
		return true;
	};
	Cnds.prototype.onSocialServiceSubmitAchievementCompleted = function(){
		return true;
	};
	Cnds.prototype.onSocialServiceSubmitAchievementFailed = function(){
		return true;
	};
	Cnds.prototype.onRestorePurchasesStarted = function(){
		return true;
	};
	Cnds.prototype.onRestorePurchasesCompleted = function(){
		return true;
	};
	Cnds.prototype.onRestorePurchasesFailed = function(){
		return true;
	};
	pluginProto.cnds = new Cnds();
	/**
	* Plugin actions
	*/
	function Acts() {};
	Acts.prototype.ShowBanner = function (layout_)
	{
		if (!this.runtime.isCocoonJs)
			return;
		bannerPosition = (layout_ === 0 ? CocoonJS["Ad"]["BannerLayout"]["TOP_CENTER"] : CocoonJS["Ad"]["BannerLayout"]["BOTTOM_CENTER"]);
		if (bannerReady)
		{
			showBanner = true;
			CocoonJS["Ad"]["setBannerLayout"](bannerPosition);
			CocoonJS["Ad"]["showBanner"]();
		}
		else
		{
			CocoonJS["Ad"]["preloadBanner"]();
		}
	};
	Acts.prototype.ShowFullscreen = function ()
	{
		if (!this.runtime.isCocoonJs)
			return;
		if (fullscreenReady)
			CocoonJS["Ad"]["showFullScreen"]();
		else
			CocoonJS["Ad"]["preloadFullScreen"]();
	};
	Acts.prototype.HideBanner = function ()
	{
		if (!this.runtime.isCocoonJs)
			return;
		showBanner = false;
		CocoonJS["Ad"]["hideBanner"]();
		this.isShowingBanner = false;
	};
	Acts.prototype.PreloadBanner = function ()
	{
		if (!this.runtime.isCocoonJs)
			return;
		CocoonJS["Ad"]["preloadBanner"]();
	};
	Acts.prototype.PreloadFullscreen = function ()
	{
		if (!this.runtime.isCocoonJs)
			return;
		CocoonJS["Ad"]["preloadFullScreen"]();
	};
	Acts.prototype.RefreshBanner = function ()
	{
		if (!this.runtime.isCocoonJs)
			return;
		CocoonJS["Ad"]["refreshBanner"]();
	};
	Acts.prototype.RefreshFullScreen = function ()
	{
		if (!this.runtime.isCocoonJs)
			return;
		CocoonJS["Ad"]["refreshFullScreen"]();
	};
	Acts.prototype.Purchase = function (productid)
	{
		if (!this.runtime.isCocoonJs)
			return;
		CocoonJS["Store"]["purchaseProduct"](productid);
	};
	Acts.prototype.ConsumePurchase = function (transactionId,productId)
	{
		if (!this.runtime.isCocoonJs)
			return;
		CocoonJS["Store"]["consumePurchase"](transactionId,productId);
	};
	Acts.prototype.fetchProductsFromStore = function (products)
	{
		if (!this.runtime.isCocoonJs)
			return;
		CocoonJS["Store"]["fetchProductsFromStore"](products.split(","));
	};
	Acts.prototype.PurchasePreview = function (productid)
	{
		if (!this.runtime.isCocoonJs)
			return;
		CocoonJS["Store"]["purchaseProductModalWithPreview"](productid);
	};
	Acts.prototype.RestorePurchases = function ()
	{
		if (!this.runtime.isCocoonJs)
			return;
		CocoonJS["Store"]["restorePurchases"]();
	};
	Acts.prototype.PromptKeyboard = function (title_, message_, initial_, type_, canceltext_, oktext_)
	{
		if (!this.runtime.isCocoonJs)
			return;
		var typestr = ["text", "num", "phone", "email", "url"][type_];
		CocoonJS["App"]["showTextDialog"](title_, message_, initial_, typestr, canceltext_, oktext_);
	};
	Acts.prototype.UpdateProductsList = function ()
	{
		if (!this.runtime.isCocoonJs)
			return;
		if (!CocoonJS["Store"]["canPurchase"]())
			return;
		products_list = CocoonJS["Store"]["getProducts"]();
	};
	/**
	* Social service actions
	*/
	function socialServiceRequestLoginCallback(isAuthenticated, error){
		if(isAuthenticated){
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceLoginSuccess, self);
		}else{
			console.log(JSON.stringify(error));
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceLoginFailed, self);
		}
	};
	Acts.prototype.socialServiceRequestLogin = function ()
	{
		if(!this.socialServiceInterface) return;
		if(this.socialServiceInterface.isLoggedIn()){
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceLoginSuccess, self);
		}else{
			this.socialServiceInterface.login(socialServiceRequestLoginCallback);
		}
	};
	function socialServiceRequestLogoutCallback(error){
		if(!error){
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceLogoutSuccess, self);	
		}else{
			console.log(JSON.stringify(error));
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceLogoutFailed, self);}
	};
	Acts.prototype.socialServiceRequestLogout = function ()
	{
		if(!this.socialServiceInterface) return;
			this.socialServiceInterface.logout(socialServiceRequestLogoutCallback);
	};
	Acts.prototype.socialServiceShare = function (textToShare)
	{
		CocoonJS.App.share(textToShare);
	};
	function socialServiceSubmitScoreCallback(err){
		if(!err){
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceSubmitScoreSuccess, self);
		}else{
			console.log(err);
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceSubmitScoreFailed, self);
		}
	};
	Acts.prototype.socialServiceSubmitScore = function (score_, leaderboard_)
	{
		if(!this.socialServiceInterface) return;
		if(this.socialServiceInterface.isLoggedIn())
			this.socialServiceInterface.submitScore(
				score_,
				socialServiceSubmitScoreCallback,
				{ leaderboardID : leaderboard_ }
			);
	};
	function socialServiceRequestScoreCallback(loadedScore, err){
		if(!err){
			requested_score = loadedScore.score || 0;
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceRequestScoreSuccess, self);
		}else{
			console.log(err);
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceRequestScoreFailed, self);
		}
	};
	Acts.prototype.socialServiceRequestScore = function (leaderboard_)
	{
		if(!this.socialServiceInterface) return;
		if(this.socialServiceInterface.isLoggedIn())
			this.socialServiceInterface.requestScore(
				socialServiceRequestScoreCallback,
				{ leaderboardID : leaderboard_ } );
	};
	function socialServiceOpenLeaderboardCallback(err){
		if(err){
			console.log(err);
		}
		self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceOpenLeaderBoardClosed, self);
	};
	Acts.prototype.socialServiceOpenLeaderboard = function (leaderboard_)
	{
		if(!this.socialServiceInterface) return;
		if(!this.socialServiceInterface.isLoggedIn()) return;
		self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceOpenLeaderBoardSuccess, self);
		this.socialServiceInterface.showLeaderboard(
			socialServiceOpenLeaderboardCallback,
			{ leaderboardID : leaderboard_}
		);
	};
	function socialServiceOpenAchievementsCallback(err){
		if(err){
			console.log(err);
		}
		self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceOpenAchievementsClosed, self);
	}
	Acts.prototype.socialServiceOpenAchievements = function(){
		if(!this.socialServiceInterface) return;
		if(!this.socialServiceInterface.isLoggedIn()) return;
		self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceOpenAchievementsSuccess, self);
		this.socialServiceInterface.showAchievements(socialServiceOpenAchievementsCallback);
	};
	function socialServiceResetAchievementsCallback(err){
		if(err){
			try{
				console.log(JSON.stringify(err));
			}catch(e){
				for(var prop in err){
					console.log(err[prop]);
				}
				console.log(e);
			}
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceResetAchievementsFailed, self);
		}else{
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceResetAchievementsCompleted, self);
		}
	}
	Acts.prototype.socialServiceResetAchievements = function(){
		if(!this.socialServiceInterface) return;
		if(!this.socialServiceInterface.isLoggedIn()) return;
		this.socialServiceInterface.resetAchievements(socialServiceResetAchievementsCallback);
	};
	function socialServiceSubmitAchievementCallback(err){
		if(err){
			try{
				console.log(JSON.stringify(err));
			}catch(e){
				for(var prop in err){
					console.log(err[prop]);
				}
				console.log(e);
			}
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceSubmitAchievementFailed, self);
		}else{
			self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceSubmitAchievementCompleted, self);
		}
	}
	Acts.prototype.socialServiceSubmitAchievement = function(_achievementId){
		if(!this.socialServiceInterface) return;
		if(!this.socialServiceInterface.isLoggedIn()) return;
		this.socialServiceInterface.submitAchievement(_achievementId, socialServiceSubmitAchievementCallback);
	};
	pluginProto.acts = new Acts();
	/**
	* Expressions
	*/
	function Exps() {};
	Exps.prototype.InputText = function (ret)
	{
		ret.set_string(input_text);
	};
	Exps.prototype.PurchaseTransactionId = function (ret)
	{
		ret.set_string(PurchaseTransactionId);
	};
	Exps.prototype.PurchaseProductId = function (ret)
	{
		ret.set_string(PurchaseProductId);
	};
	Exps.prototype.ProductCount = function (ret)
	{
		ret.set_int(products_list.length);
	};
	Exps.prototype.ProductDescription = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= products_list.length)
		{
			ret.set_string("");
			return;
		}
		ret.set_string(products_list[index]["description"]);
	};
	Exps.prototype.ProductLocalizedPrice = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= products_list.length)
		{
			ret.set_string("");
			return;
		}
		ret.set_string(products_list[index]["localizedPrice"]);
	};
	Exps.prototype.ProductPrice = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= products_list.length)
		{
			ret.set_string("");
			return;
		}
		ret.set_string(products_list[index]["price"]);
	};
	Exps.prototype.ProductAlias = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= products_list.length)
		{
			ret.set_string("");
			return;
		}
		ret.set_string(products_list[index]["productAlias"]);
	};
	Exps.prototype.ProductID = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= products_list.length)
		{
			ret.set_string("");
			return;
		}
		ret.set_string(products_list[index]["productId"]);
	};
	Exps.prototype.ProductTitle = function (ret, index)
	{
		index = Math.floor(index);
		if (index < 0 || index >= products_list.length)
		{
			ret.set_string("");
			return;
		}
		ret.set_string(products_list[index]["title"]);
	};
	Exps.prototype.PlayerScore = function (ret)
	{
		ret.set_float(requested_score);
	};
	pluginProto.exps = new Exps();
}());