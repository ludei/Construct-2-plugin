/**
 * Object holder for the plugin
 */
cr.plugins_.CJSAds = function(runtime) {
    this.runtime = runtime;
};
/**
 * C2 plugin
 */
(function() {
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
        pluginProto.Type = function(plugin) {
            this.plugin = plugin;
            this.runtime = plugin.runtime;
        };
        var typeProto = pluginProto.Type.prototype;
        typeProto.onCreate = function() {};
        /**
         * C2 specific behaviour
         */
        pluginProto.Instance = function(type) {
            this.type = type;
            this.runtime = type.runtime;
        };
        var instanceProto = pluginProto.Instance.prototype;
        var self;
        instanceProto.onCreate = function() {
            this.isShowingBanner = false;
            this.isShowingFullscreen = false;
            this.triggerProduct = "";
            this.socialService = null;
            this.socialServiceAvailable = false;
            this.socialServiceSelected = this.properties[2];
            this.storeServiceAvailable = (this.runtime.isCocoonJs && typeof Cocoon.Store.nativeAvailable !== "undefined");
            this.storeManaged = (this.properties[1] !== 1);
            this.storeSandboxed = (this.properties[3] !== 0);
            this.socialServiceClientID = this.properties[4];
            this.facebookAppID = this.properties[5];
            this.facebookChannel = this.properties[6];
            this.onConsumePurchaseFailedTransactionId = "";
            this.onConsumePurchaseCompleted = "";
            this.onPurchaseCompleteInfo = "";

            self = this;
            if (self.runtime.isCocoonJs) {

                Cocoon.Ad.banner.on("shown", function() {
                    self.isShowingBanner = true;
                    self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnBannerShown, self);
                });

                Cocoon.Ad.banner.on("ready", function() {
                    bannerReady = true;
                    self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onBannerReady, self);
                });

                Cocoon.Ad.banner.on("hidden", function() {
                    self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onBannerHidden, self);
                });

                Cocoon.Ad.interstitial.on("shown", function() {
                    self.isShowingFullscreen = true;
                    self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnFullscreenShown, self);
                });

                Cocoon.Ad.interstitial.on("hidden", function() {
                    self.isShowingFullscreen = false;
                    self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnFullscreenHidden, self);
                });

                Cocoon.Ad.interstitial.on("ready", function() {
                    fullscreenReady = true;
                    self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onFullScreenReady, self);
                });
                if (self.storeServiceAvailable) {
                    Cocoon.Store.on("consume", {
                        started: function(transactionId) {
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onConsumePurchaseStarted, self);
                        },
                        success: function(transactionId) {
                            self.onConsumePurchaseCompleted = transactionId;
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onConsumePurchaseCompleted, self);
                        },
                        error: function(transactionId, errorMessage) {
                            self.onConsumePurchaseFailedTransactionId = transactionId;
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onConsumePurchaseFailed, self);
                        }
                    });

                    Cocoon.Store.on("purchase", {
                        started: function(productId) {
                            console.log("onProductPurchaseStarted " + productId);
                            self.triggerProduct = productId;
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnPurchaseStart, self);
                        },
                        success: function(purchase) {
                            console.log("onProductPurchaseCompleted " + purchase["productId"]);
                            self.triggerProduct = purchase["productId"];
                            PurchaseTransactionId = purchase["transactionId"];
                            PurchaseProductId = purchase["productId"];
                            Cocoon.Store.addPurchase(purchase);
                            Cocoon.Store.finish(purchase["transactionId"]);
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnPurchaseComplete, self);
                        },
                        verification: function(productId, data) {

                        },
                        error: function(productId, errorMsg) {
                            console.log("onProductPurchaseFailed " + productId);
                            self.triggerProduct = productId;
                            console.log(errorMsg);
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnPurchaseFail, self);
                        }
                    });
                    Cocoon.Store.on("load", {
                        started: function() {
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onProductsFetchStarted, self);
                        },
                        success: function(products) {
                            for (var i = products.length - 1; i >= 0; i--) {
                                console.log("Product fetched: " + products[i].productId);
                                Cocoon.Store.addProduct(products[i]);
                            };
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onProductsFetchCompleted, self);
                        },
                        error: function(errorMessage) {
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onProductsFetchFailed, self);
                        }
                    });

                    Cocoon.Store.on("restore", {
                        started: function() {
                            console.log("onRestorePurchasesStarted ");
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onRestorePurchasesStarted, self);
                        },
                        success: function() {
                            console.log("onRestorePurchasesCompleted ");
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onRestorePurchasesCompleted, self);
                        },
                        error: function(errorMessage) {
                            console.log("onRestorePurchasesFailed ");
                            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onRestorePurchasesFailed, self);
                        }
                    });

                    Cocoon.Store.initialize({
                        sandbox: self.storeManaged,
                        managed: self.storeSandboxed
                    });
                }
                /**
                 * No social service selected, return.
                 */
                if (this.socialServiceSelected === 0) return;
                /**
                 * Set the social interface for the selected service
                 */
                this.startGameCenter = function() {
                    console.log("GameCenter selected as social service");
                    this.socialService = Cocoon.Social.GameCenter;
                    if (this.socialService) {
                        if (!!this.socialService.nativeAvailable)
                            this.socialServiceInterface = this.socialService.getSocialInterface();
                    } else {
                        throw new Error("Cannot find GameCenter service, are you using the latest CocoonJS Plugin?");
                    }
                }
                this.startGooglePlay = function() {
                    console.log("GooglePlayGames selected as social service");
                    this.socialService = Cocoon.Social.GooglePlayGames;
                    if (this.socialService) {
                        var config = {};
                        if (this.socialServiceClientID) config.clientId = this.socialServiceClientID;
                        this.socialService.init(config);
                        if (!!this.socialService.nativeAvailable) {
                            this.socialServiceInterface = this.socialService.getSocialInterface();
                        }
                    } else {
                        throw new Error("Cannot find GooglePlayGames service, are you using the latest CocoonJS Plugin?");
                    }
                }
                this.startFacebook = function() {
                    console.log("Facebook selected as social service");
                    this.socialService = Cocoon.Social.Facebook;
                    if (this.socialService) {
                        var config = {};
                        if (this.facebookAppID && this.facebookChannel) {
                            config.appId = this.facebookAppID;
                            config.channelUrl = this.facebookChannel;
                        }
                        this.socialService.init(config);
                        if (!!this.socialService.nativeAvailable) {
                            this.socialServiceInterface = this.socialService.getSocialInterface();
                            this.socialServiceInterface.setTemplates("leaderboards.html", "achievements.html");
                        }
                    } else {
                        throw new Error("Cannot find Facebook service, are you using the latest CocoonJS Plugin?");
                    }
                }
                if (this.socialServiceSelected === 2) this.startGameCenter.apply(this, []);
                if (this.socialServiceSelected === 3) this.startGooglePlay.apply(this, []);
                if (this.socialServiceSelected === 4) this.startFacebook.apply(this, []);
                if (this.socialServiceSelected === 1) {
                    if (Cocoon.Social.GooglePlayGames.nativeAvailable) {
                        this.startGooglePlay.apply(this, []);
                    } else if (Cocoon.Social.GameCenter.nativeAvailable) {
                        this.startGameCenter.apply(this, []);
                    } else {
                        return;
                    }
                }
            }
        };

        function Cnds() {};
        Cnds.prototype.IsShowingBanner = function() {
            return this.isShowingBanner;
        };
        Cnds.prototype.IsCocoonJS = function() {
            return this.runtime.isCocoonJs;
        };
        Cnds.prototype.OnBannerShown = function() {
            return true;
        };
        Cnds.prototype.OnFullscreenShown = function() {
            return true;
        };
        Cnds.prototype.OnFullscreenHidden = function() {
            return true;
        };
        Cnds.prototype.onFullScreenReady = function() {
            return true;
        };
        Cnds.prototype.onBannerReady = function() {
            return true;
        };
        Cnds.prototype.onBannerHidden = function() {
            return true;
        };
        Cnds.prototype.IsShowingFullscreen = function() {
            return this.isShowingFullscreen;
        };
        Cnds.prototype.PreloadFullscreen = function() {
            return true;
        }
        Cnds.prototype.IsStoreAvailable = function() {
            if (this.runtime.isCocoonJs)
                return this.storeServiceAvailable && Cocoon.Store.canPurchase();
            else
                return false;
        };
        Cnds.prototype.OnPurchaseStart = function(productid) {
            console.log("OnPurchaseStart ");
            return this.triggerProduct === productid;
        };
        Cnds.prototype.OnPurchaseComplete = function(productid) {
            console.log("OnPurchaseComplete ");
            return this.triggerProduct === productid;
        };
        Cnds.prototype.OnPurchaseFail = function(productid) {
            console.log("OnPurchaseFail ");
            return this.triggerProduct === productid;
        };
        Cnds.prototype.onProductsFetchStarted = function() {
            return true;
        }
        Cnds.prototype.onConsumePurchaseFailed = function() {
            return true;
        }
        Cnds.prototype.onConsumePurchaseCompleted = function() {
            return true;
        }
        Cnds.prototype.onConsumePurchaseStarted = function() {
            return true;
        }
        Cnds.prototype.onProductsFetchCompleted = function() {
            return true;
        }
        Cnds.prototype.onProductsFetchFailed = function() {
            return true;
        }
        Cnds.prototype.IsProductPurchased = function(productid) {
            if (this.runtime.isCocoonJs)
                return Cocoon.Store.isProductPurchased(productid);
            else
                return false;
        };
        Cnds.prototype.OnKeyboardCancelled = function() {
            return true;
        };
        Cnds.prototype.OnKeyboardOK = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceLoginSuccess = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceLoginFailed = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceLogoutSuccess = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceLogoutFailed = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceSubmitScoreSuccess = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceSubmitScoreFailed = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceRequestScoreSuccess = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceRequestScoreFailed = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceOpenLeaderBoardSuccess = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceOpenLeaderBoardClosed = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceOpenAchievementsSuccess = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceOpenAchievementsClosed = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceResetAchievementsCompleted = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceResetAchievementsFailed = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceSubmitAchievementCompleted = function() {
            return true;
        };
        Cnds.prototype.onSocialServiceSubmitAchievementFailed = function() {
            return true;
        };
        Cnds.prototype.onRestorePurchasesStarted = function() {
            return true;
        };
        Cnds.prototype.onRestorePurchasesCompleted = function() {
            return true;
        };
        Cnds.prototype.onRestorePurchasesFailed = function() {
            return true;
        };
        pluginProto.cnds = new Cnds();
        /**
         * Plugin actions
         */
        function Acts() {};
        Acts.prototype.ShowBanner = function(layout_) {
            if (!this.runtime.isCocoonJs)
                return;
            bannerPosition = (layout_ === 0 ? Cocoon.Ad.BannerLayout.TOP_CENTER : Cocoon.Ad.BannerLayout.BOTTOM_CENTER);
            if (bannerReady) {
                showBanner = true;
                Cocoon.Ad.setBannerLayout(bannerPosition);
                Cocoon.Ad.showBanner();
            } else {
                Cocoon.Ad.loadBanner();
            }
        };
        Acts.prototype.ShowFullscreen = function() {
            if (!this.runtime.isCocoonJs)
                return;
            if (fullscreenReady)
                Cocoon.Ad.showInterstitial();
            else
                Cocoon.Ad.loadInterstitial();
        };
        Acts.prototype.HideBanner = function() {
            if (!this.runtime.isCocoonJs)
                return;
            showBanner = false;
            Cocoon.Ad.hideBanner();
            this.isShowingBanner = false;
        };
        Acts.prototype.PreloadBanner = function() {
            if (!this.runtime.isCocoonJs)
                return;
            Cocoon.Ad.loadBanner();
        };
        Acts.prototype.PreloadFullscreen = function() {
            if (!this.runtime.isCocoonJs)
                return;
            Cocoon.Ad.loadInterstitial();
        };
        Acts.prototype.RefreshBanner = function() {
            if (!this.runtime.isCocoonJs)
                return;
            Cocoon.Ad.refreshBanner();
        };
        Acts.prototype.RefreshFullScreen = function() {
            if (!this.runtime.isCocoonJs)
                return;
            Cocoon.Ad.refreshInterstitial();
        };
        Acts.prototype.Purchase = function(productid) {
            if (!this.runtime.isCocoonJs)
                return;
            Cocoon.Store.purchase(productid);
        };
        Acts.prototype.ConsumePurchase = function(transactionId, productId) {
            if (!this.runtime.isCocoonJs)
                return;
            Cocoon.Store.consume(transactionId, productId);
        };
        Acts.prototype.fetchProductsFromStore = function(products) {
            if (!this.runtime.isCocoonJs)
                return;
            Cocoon.Store.loadProducts(products.split(","));
        };
        Acts.prototype.PurchasePreview = function(productid) {
            if (!this.runtime.isCocoonJs)
                return;
            Cocoon.Store.purchaseProductModalWithPreview(productid);
        };
        Acts.prototype.RestorePurchases = function() {
            if (!this.runtime.isCocoonJs)
                return;
            Cocoon.Store.restore();
        };
        Acts.prototype.PromptKeyboard = function(title_, message_, initial_, type_, canceltext_, oktext_) {
            if (!this.runtime.isCocoonJs)
                return;
            var typestr = ["text", "num", "phone", "email", "url"][type_];
            Cocoon.Dialog.prompt({
                    title: title_,
                    message: message_,
                    text: initial_,
                    type: typestr,
                    cancelText: canceltext_,
                    confirmText: oktext_
            }, {
                success: function(text) {
                    input_text = text;
                    self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnKeyboardOK, self);
                },
                cancel: function() {
                    self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.OnKeyboardCancelled, self);
                }
            });
    };

    Acts.prototype.UpdateProductsList = function() {
        if (!this.runtime.isCocoonJs)
            return;
        if (!Cocoon.Store.canPurchase())
            return;
        products_list = Cocoon.Store.getProducts();
    };
    /**
     * Social service actions
     */
    function socialServiceRequestLoginCallback(isAuthenticated, error) {
        if (isAuthenticated) {
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceLoginSuccess, self);
        } else {
            console.log(JSON.stringify(error));
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceLoginFailed, self);
        }
    }; 
    Acts.prototype.socialServiceRequestLogin = function() {
        if (!this.socialServiceInterface) return;
        if (this.socialServiceInterface.isLoggedIn()) {
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceLoginSuccess, self);
        } else {
            this.socialServiceInterface.login(socialServiceRequestLoginCallback);
        }
    };

    function socialServiceRequestLogoutCallback(error) {
        if (!error) {
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceLogoutSuccess, self);
        } else {
            console.log(JSON.stringify(error));
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceLogoutFailed, self);
        }
    }; 
    Acts.prototype.socialServiceRequestLogout = function() {
        if (!this.socialServiceInterface) return;
        this.socialServiceInterface.logout(socialServiceRequestLogoutCallback);
    }; 
    Acts.prototype.socialServiceShare = function(textToShare) {
        Cocoon.Social.share(textToShare);
    };

    function socialServiceSubmitScoreCallback(err) {
        if (!err) {
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceSubmitScoreSuccess, self);
        } else {
            console.log(err);
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceSubmitScoreFailed, self);
        }
    }; 
    Acts.prototype.socialServiceSubmitScore = function(score_, leaderboard_) {
        if (!this.socialServiceInterface) return;
        if (this.socialServiceInterface.isLoggedIn())
            this.socialServiceInterface.submitScore(
                score_,
                socialServiceSubmitScoreCallback, {
                    leaderboardID: leaderboard_
                }
            );
    };

    function socialServiceRequestScoreCallback(loadedScore, err) {
        if (!err) {
            requested_score = loadedScore.score || 0;
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceRequestScoreSuccess, self);
        } else {
            console.log(err);
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceRequestScoreFailed, self);
        }
    }; 
    Acts.prototype.socialServiceRequestScore = function(leaderboard_) {
        if (!this.socialServiceInterface) return;
        if (this.socialServiceInterface.isLoggedIn())
            this.socialServiceInterface.requestScore(
                socialServiceRequestScoreCallback, {
                    leaderboardID: leaderboard_
                });
    };

    function socialServiceOpenLeaderboardCallback(err) {
        if (err) {
            console.log(err);
        }
        self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceOpenLeaderBoardClosed, self);
    }; 
    Acts.prototype.socialServiceOpenLeaderboard = function(leaderboard_) {
        if (!this.socialServiceInterface) return;
        if (!this.socialServiceInterface.isLoggedIn()) return;
        self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceOpenLeaderBoardSuccess, self);
        this.socialServiceInterface.showLeaderboard(
            socialServiceOpenLeaderboardCallback, {
                leaderboardID: leaderboard_
            }
        );
    };

    function socialServiceOpenAchievementsCallback(err) {
        if (err) {
            console.log(err);
        }
        self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceOpenAchievementsClosed, self);
    }
    Acts.prototype.socialServiceOpenAchievements = function() {
        if (!this.socialServiceInterface) return;
        if (!this.socialServiceInterface.isLoggedIn()) return;
        self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceOpenAchievementsSuccess, self);
        this.socialServiceInterface.showAchievements(socialServiceOpenAchievementsCallback);
    };

    function socialServiceResetAchievementsCallback(err) {
        if (err) {
            try {
                console.log(JSON.stringify(err));
            } catch (e) {
                for (var prop in err) {
                    console.log(err[prop]);
                }
                console.log(e);
            }
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceResetAchievementsFailed, self);
        } else {
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceResetAchievementsCompleted, self);
        }
    }
    Acts.prototype.socialServiceResetAchievements = function() {
        if (!this.socialServiceInterface) return;
        if (!this.socialServiceInterface.isLoggedIn()) return;
        this.socialServiceInterface.resetAchievements(socialServiceResetAchievementsCallback);
    };

    function socialServiceSubmitAchievementCallback(err) {
        if (err) {
            try {
                console.log(JSON.stringify(err));
            } catch (e) {
                for (var prop in err) {
                    console.log(err[prop]);
                }
                console.log(e);
            }
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceSubmitAchievementFailed, self);
        } else {
            self.runtime.trigger(cr.plugins_.CJSAds.prototype.cnds.onSocialServiceSubmitAchievementCompleted, self);
        }
    }
    Acts.prototype.socialServiceSubmitAchievement = function(_achievementId) {
        if (!this.socialServiceInterface) return;
        if (!this.socialServiceInterface.isLoggedIn()) return;
        this.socialServiceInterface.submitAchievement(_achievementId, socialServiceSubmitAchievementCallback);
    }; pluginProto.acts = new Acts();
    /**
     * Expressions
     */
    function Exps() {}; Exps.prototype.InputText = function(ret) {
        ret.set_string(input_text);
    }; 
    Exps.prototype.PurchaseTransactionId = function(ret) {
        ret.set_string(PurchaseTransactionId);
    }; 
    Exps.prototype.PurchaseProductId = function(ret) {
        ret.set_string(PurchaseProductId);
    }; 
    Exps.prototype.ProductCount = function(ret) {
        ret.set_int(products_list.length);
    }; 
    Exps.prototype.ProductDescription = function(ret, index) {
        index = Math.floor(index);
        if (index < 0 || index >= products_list.length) {
            ret.set_string("");
            return;
        }
        ret.set_string(products_list[index]["description"]);
    }; 
    Exps.prototype.ProductLocalizedPrice = function(ret, index) {
        index = Math.floor(index);
        if (index < 0 || index >= products_list.length) {
            ret.set_string("");
            return;
        }
        ret.set_string(products_list[index]["localizedPrice"]);
    }; 
    Exps.prototype.ProductPrice = function(ret, index) {
        index = Math.floor(index);
        if (index < 0 || index >= products_list.length) {
            ret.set_string("");
            return;
        }
        ret.set_string(products_list[index]["price"]);
    }; 
    Exps.prototype.ProductAlias = function(ret, index) {
        index = Math.floor(index);
        if (index < 0 || index >= products_list.length) {
            ret.set_string("");
            return;
        }
        ret.set_string(products_list[index]["productAlias"]);
    }; 
    Exps.prototype.ProductID = function(ret, index) {
        index = Math.floor(index);
        if (index < 0 || index >= products_list.length) {
            ret.set_string("");
            return;
        }
        ret.set_string(products_list[index]["productId"]);
    }; 
    Exps.prototype.ProductTitle = function(ret, index) {
        index = Math.floor(index);
        if (index < 0 || index >= products_list.length) {
            ret.set_string("");
            return;
        }
        ret.set_string(products_list[index]["title"]);
    }; 
    Exps.prototype.PlayerScore = function(ret) {
        ret.set_float(requested_score);
    }; pluginProto.exps = new Exps();
}());