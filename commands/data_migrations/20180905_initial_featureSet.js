const FREE_PLAN_NAME = 'free';
const LITE_PLAN_NAME = 'lite';
const INFLUENCER_PLAN_NAME = 'influencer';
const HERO_PLAN_NAME = 'hero';
const SUPER_HERO_PLAN_NAME = 'super-hero';
const plans = [FREE_PLAN_NAME, LITE_PLAN_NAME, INFLUENCER_PLAN_NAME, HERO_PLAN_NAME, SUPER_HERO_PLAN_NAME];

const USER_FEATURE_FORCE_WATERMARK = "user-feature-force-watermark";
const USER_FEATURE_WATERMARK = "user-feature-watermark";
const FEATURE_VIMOJO_STORE = "feature-vimojo-store";
const FEATURE_VIMOJO_PLATFORM = "feature-vimojo-platform";
const USER_FEATURE_FTP_PUBLISHING = "user-feature-ftp-publishing";
const FEATURE_ADS_ENABLED = "feature-ads-enabled";
const USER_FEATURE_VOICE_OVER = "user-feature-voice-over";
const FEATURE_AVTRANSITIONS = "feature-avtransitions";
const USER_FEATURE_CAMERA_PRO = "user-feature-camera-pro";
const USER_FEATURE_SELECT_FRAME_RATE = "user-feature-select-frame-rate";
const USER_FEATURE_SELECT_RESOLUTION = "user-feature-select-resolution";

// TODO(jliarte): 5/09/18 should dedscriptions reside in another table/model?
const featureForceWatermark = { name: USER_FEATURE_FORCE_WATERMARK, description: "If enabled, user will always have watermark toggled on in their compositions"};
const featureWatermark = { name: USER_FEATURE_WATERMARK, description: "If enabled, user can toggle watermark on or off in their compositions"};
const featureVimojoStore = { name: FEATURE_VIMOJO_STORE, description: "If enabled, in app purchases will be enabled and shown in the application" };
// TODO(jliarte): 5/09/18 remove from user feature
const featureVimojoPlatform = { name: FEATURE_VIMOJO_PLATFORM, description: "If enabled, application will connect with vimojo platform" };
const featureFtpPublishing = { name: USER_FEATURE_FTP_PUBLISHING, description: "If enabled, user can publish rendered videos using FTP in share view, also can setup FTP params in settings view"};
const featureAds = { name: FEATURE_ADS_ENABLED, description: "If enabled, ads wil be shown in application" };
const featureVoiceOver = { name: USER_FEATURE_VOICE_OVER, description: "If enabled, user will be able to add a voice over track to compositions on sound view" };
const featureCameraPro = { name: USER_FEATURE_CAMERA_PRO, description: "If enabled, user can change to pro camera controls in record view; if not, he only will have basic camera controls" };
const featureSelectFR = { name: USER_FEATURE_SELECT_FRAME_RATE, description: "If enabled, user is allowed to change frame rate from camera settings view; if not, he only can record in default FR: 30FPS" };
const featureSelectResolution = { name: USER_FEATURE_SELECT_RESOLUTION, description: "If enabled, user is allowed to change resolution; if not, he only can record in default resolution: 720p" };

const featureSet = {};

featureSet[FREE_PLAN_NAME] = [ Object.assign({ enabled: true, plan: FREE_PLAN_NAME}, featureForceWatermark),
		Object.assign({ enabled: false, plan: FREE_PLAN_NAME}, featureWatermark),
		Object.assign({ enabled: false, plan: FREE_PLAN_NAME}, featureVimojoStore),
		Object.assign({ enabled: true, plan: FREE_PLAN_NAME}, featureVimojoPlatform),
		Object.assign({ enabled: false, plan: FREE_PLAN_NAME}, featureFtpPublishing),
		Object.assign({ enabled: true, plan: FREE_PLAN_NAME}, featureAds),
		Object.assign({ enabled: false, plan: FREE_PLAN_NAME}, featureVoiceOver),
		Object.assign({ enabled: false, plan: FREE_PLAN_NAME}, featureCameraPro),
		Object.assign({ enabled: false, plan: FREE_PLAN_NAME}, featureSelectFR),
		Object.assign({ enabled: false, plan: FREE_PLAN_NAME}, featureSelectResolution)];

featureSet[LITE_PLAN_NAME] = [ Object.assign({ enabled: false, plan: LITE_PLAN_NAME}, featureForceWatermark),
		Object.assign({ enabled: true, plan: LITE_PLAN_NAME}, featureWatermark),
		Object.assign({ enabled: true, plan: LITE_PLAN_NAME}, featureVimojoStore),
		Object.assign({ enabled: true, plan: LITE_PLAN_NAME}, featureVimojoPlatform),
		Object.assign({ enabled: false, plan: LITE_PLAN_NAME}, featureFtpPublishing),
		Object.assign({ enabled: true, plan: LITE_PLAN_NAME}, featureAds),
		Object.assign({ enabled: false, plan: LITE_PLAN_NAME}, featureVoiceOver),
		Object.assign({ enabled: false, plan: LITE_PLAN_NAME}, featureCameraPro),
		Object.assign({ enabled: false, plan: LITE_PLAN_NAME}, featureSelectFR),
		Object.assign({ enabled: false, plan: LITE_PLAN_NAME}, featureSelectResolution)];

featureSet[INFLUENCER_PLAN_NAME] = [ Object.assign({ enabled: false, plan: INFLUENCER_PLAN_NAME}, featureForceWatermark),
		Object.assign({ enabled: true, plan: INFLUENCER_PLAN_NAME}, featureWatermark),
		Object.assign({ enabled: true, plan: INFLUENCER_PLAN_NAME}, featureVimojoStore),
		Object.assign({ enabled: true, plan: INFLUENCER_PLAN_NAME}, featureVimojoPlatform),
		Object.assign({ enabled: false, plan: INFLUENCER_PLAN_NAME}, featureFtpPublishing),
		Object.assign({ enabled: true, plan: INFLUENCER_PLAN_NAME}, featureAds),
		Object.assign({ enabled: true, plan: INFLUENCER_PLAN_NAME}, featureVoiceOver),
		Object.assign({ enabled: true, plan: INFLUENCER_PLAN_NAME}, featureCameraPro),
		Object.assign({ enabled: true, plan: INFLUENCER_PLAN_NAME}, featureSelectFR),
		Object.assign({ enabled: true, plan: INFLUENCER_PLAN_NAME}, featureSelectResolution)];

featureSet[HERO_PLAN_NAME] = [ Object.assign({ enabled: false, plan: HERO_PLAN_NAME}, featureForceWatermark),
		Object.assign({ enabled: true, plan: HERO_PLAN_NAME}, featureWatermark),
		Object.assign({ enabled: true, plan: HERO_PLAN_NAME}, featureVimojoStore),
		Object.assign({ enabled: true, plan: HERO_PLAN_NAME}, featureVimojoPlatform),
		Object.assign({ enabled: true, plan: HERO_PLAN_NAME}, featureFtpPublishing),
		Object.assign({ enabled: false, plan: HERO_PLAN_NAME}, featureAds),
		Object.assign({ enabled: true, plan: HERO_PLAN_NAME}, featureVoiceOver),
		Object.assign({ enabled: true, plan: HERO_PLAN_NAME}, featureCameraPro),
		Object.assign({ enabled: true, plan: HERO_PLAN_NAME}, featureSelectFR),
		Object.assign({ enabled: true, plan: HERO_PLAN_NAME}, featureSelectResolution)];

featureSet[SUPER_HERO_PLAN_NAME] = [ Object.assign({ enabled: false, plan: SUPER_HERO_PLAN_NAME}, featureForceWatermark),
		Object.assign({ enabled: true, plan: SUPER_HERO_PLAN_NAME}, featureWatermark),
		Object.assign({ enabled: true, plan: SUPER_HERO_PLAN_NAME}, featureVimojoStore),
		Object.assign({ enabled: true, plan: SUPER_HERO_PLAN_NAME}, featureVimojoPlatform),
		Object.assign({ enabled: true, plan: SUPER_HERO_PLAN_NAME}, featureFtpPublishing),
		Object.assign({ enabled: false, plan: SUPER_HERO_PLAN_NAME}, featureAds),
		Object.assign({ enabled: true, plan: SUPER_HERO_PLAN_NAME}, featureVoiceOver),
		Object.assign({ enabled: true, plan: SUPER_HERO_PLAN_NAME}, featureCameraPro),
		Object.assign({ enabled: true, plan: SUPER_HERO_PLAN_NAME}, featureSelectFR),
		Object.assign({ enabled: true, plan: SUPER_HERO_PLAN_NAME}, featureSelectResolution)];

module.exports = {
	plans,
	featureSet
};