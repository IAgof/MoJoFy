const FREE_PRODUCT_NAME = 'free';
const WITNESS_PRODUCT_NAME = 'witness';
const JOURNALIST_PRODUCT_NAME = 'journalist';
const HERO_PRODUCT_NAME = 'hero';
const SUPER_HERO_PRODUCT_NAME = 'superHero';
const plans = [FREE_PRODUCT_NAME, WITNESS_PRODUCT_NAME, JOURNALIST_PRODUCT_NAME, HERO_PRODUCT_NAME, SUPER_HERO_PRODUCT_NAME];

const USER_FEATURE_FORCE_WATERMARK = "user-feature-force-watermark";
const USER_FEATURE_WATERMARK = "user-feature-watermark";
const FEATURE_VIMOJO_STORE = "feature-vimojo-store";
const FEATURE_VIMOJO_PLATFORM = "feature-vimojo-platform";
const USER_FEATURE_CLOUD_BACKUP = "user-feature-cloud-backup";
const USER_FEATURE_PLATFORM_PUBLISHING = "user-feature-upload-to-platform";
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
const featureCloudBackup = { name: USER_FEATURE_CLOUD_BACKUP, description: "If enabled, application will backup compositions and files vimojo backend." };
const featureFtpPublishing = { name: USER_FEATURE_FTP_PUBLISHING, description: "If enabled, user can publish rendered videos using FTP in share view, also can setup FTP params in settings view"};
const featurePlatformPublishing = { name: USER_FEATURE_PLATFORM_PUBLISHING, description: "If enabled, user can publish rendered videos to the content platform in share view." };
const featureAds = { name: FEATURE_ADS_ENABLED, description: "If enabled, ads wil be shown in application" };
const featureVoiceOver = { name: USER_FEATURE_VOICE_OVER, description: "If enabled, user will be able to add a voice over track to compositions on sound view" };
const featureCameraPro = { name: USER_FEATURE_CAMERA_PRO, description: "If enabled, user can change to pro camera controls in record view; if not, he only will have basic camera controls" };
const featureSelectFR = { name: USER_FEATURE_SELECT_FRAME_RATE, description: "If enabled, user is allowed to change frame rate from camera settings view; if not, he only can record in default FR: 30FPS" };
const featureSelectResolution = { name: USER_FEATURE_SELECT_RESOLUTION, description: "If enabled, user is allowed to change resolution; if not, he only can record in default resolution: 720p" };

const featureSet = {};

featureSet[FREE_PRODUCT_NAME] = [ Object.assign({ enabled: true, plan: FREE_PRODUCT_NAME}, featureForceWatermark),
	Object.assign({ enabled: false, plan: FREE_PRODUCT_NAME}, featureWatermark),
	Object.assign({ enabled: false, plan: FREE_PRODUCT_NAME}, featureVimojoStore),
	Object.assign({ enabled: true, plan: FREE_PRODUCT_NAME}, featureVimojoPlatform),
	Object.assign({ enabled: false, plan: FREE_PRODUCT_NAME}, featureCloudBackup),
	Object.assign({ enabled: false, plan: FREE_PRODUCT_NAME}, featurePlatformPublishing),
	Object.assign({ enabled: false, plan: FREE_PRODUCT_NAME}, featureFtpPublishing),
	Object.assign({ enabled: true, plan: FREE_PRODUCT_NAME}, featureAds),
	Object.assign({ enabled: false, plan: FREE_PRODUCT_NAME}, featureVoiceOver),
	Object.assign({ enabled: false, plan: FREE_PRODUCT_NAME}, featureCameraPro),
	Object.assign({ enabled: false, plan: FREE_PRODUCT_NAME}, featureSelectFR),
	Object.assign({ enabled: false, plan: FREE_PRODUCT_NAME}, featureSelectResolution)];

featureSet[WITNESS_PRODUCT_NAME] = [ Object.assign({ enabled: false, plan: WITNESS_PRODUCT_NAME}, featureForceWatermark),
	Object.assign({ enabled: true, plan: WITNESS_PRODUCT_NAME}, featureWatermark),
	Object.assign({ enabled: true, plan: WITNESS_PRODUCT_NAME}, featureVimojoStore),
	Object.assign({ enabled: true, plan: WITNESS_PRODUCT_NAME}, featureVimojoPlatform),
	Object.assign({ enabled: false, plan: WITNESS_PRODUCT_NAME}, featureCloudBackup), // TODO(jliarte): 18/10/18 temporary disabled
	Object.assign({ enabled: false, plan: WITNESS_PRODUCT_NAME}, featurePlatformPublishing),
	Object.assign({ enabled: false, plan: WITNESS_PRODUCT_NAME}, featureFtpPublishing),
	Object.assign({ enabled: true, plan: WITNESS_PRODUCT_NAME}, featureAds),
	Object.assign({ enabled: false, plan: WITNESS_PRODUCT_NAME}, featureVoiceOver),
	Object.assign({ enabled: false, plan: WITNESS_PRODUCT_NAME}, featureCameraPro),
	Object.assign({ enabled: false, plan: WITNESS_PRODUCT_NAME}, featureSelectFR),
	Object.assign({ enabled: false, plan: WITNESS_PRODUCT_NAME}, featureSelectResolution)];

featureSet[JOURNALIST_PRODUCT_NAME] = [ Object.assign({ enabled: false, plan: JOURNALIST_PRODUCT_NAME}, featureForceWatermark),
	Object.assign({ enabled: true, plan: JOURNALIST_PRODUCT_NAME}, featureWatermark),
	Object.assign({ enabled: true, plan: JOURNALIST_PRODUCT_NAME}, featureVimojoStore),
	Object.assign({ enabled: true, plan: JOURNALIST_PRODUCT_NAME}, featureVimojoPlatform),
	Object.assign({ enabled: false, plan: JOURNALIST_PRODUCT_NAME}, featureCloudBackup), // TODO(jliarte): 18/10/18 temporary disabled
	Object.assign({ enabled: false, plan: JOURNALIST_PRODUCT_NAME}, featurePlatformPublishing),
	Object.assign({ enabled: false, plan: JOURNALIST_PRODUCT_NAME}, featureFtpPublishing),
	Object.assign({ enabled: true, plan: JOURNALIST_PRODUCT_NAME}, featureAds),
	Object.assign({ enabled: true, plan: JOURNALIST_PRODUCT_NAME}, featureVoiceOver),
	Object.assign({ enabled: true, plan: JOURNALIST_PRODUCT_NAME}, featureCameraPro),
	Object.assign({ enabled: true, plan: JOURNALIST_PRODUCT_NAME}, featureSelectFR),
	Object.assign({ enabled: true, plan: JOURNALIST_PRODUCT_NAME}, featureSelectResolution)];

featureSet[HERO_PRODUCT_NAME] = [ Object.assign({ enabled: false, plan: HERO_PRODUCT_NAME}, featureForceWatermark),
	Object.assign({ enabled: true, plan: HERO_PRODUCT_NAME}, featureWatermark),
	Object.assign({ enabled: true, plan: HERO_PRODUCT_NAME}, featureVimojoStore),
	Object.assign({ enabled: true, plan: HERO_PRODUCT_NAME}, featureVimojoPlatform),
	Object.assign({ enabled: false, plan: HERO_PRODUCT_NAME}, featureCloudBackup), // TODO(jliarte): 18/10/18 temporary disabled
	Object.assign({ enabled: true, plan: HERO_PRODUCT_NAME}, featurePlatformPublishing),
	Object.assign({ enabled: true, plan: HERO_PRODUCT_NAME}, featureFtpPublishing),
	Object.assign({ enabled: false, plan: HERO_PRODUCT_NAME}, featureAds),
	Object.assign({ enabled: true, plan: HERO_PRODUCT_NAME}, featureVoiceOver),
	Object.assign({ enabled: true, plan: HERO_PRODUCT_NAME}, featureCameraPro),
	Object.assign({ enabled: true, plan: HERO_PRODUCT_NAME}, featureSelectFR),
	Object.assign({ enabled: true, plan: HERO_PRODUCT_NAME}, featureSelectResolution)];

featureSet[SUPER_HERO_PRODUCT_NAME] = [ Object.assign({ enabled: false, plan: SUPER_HERO_PRODUCT_NAME}, featureForceWatermark),
	Object.assign({ enabled: true, plan: SUPER_HERO_PRODUCT_NAME}, featureWatermark),
	Object.assign({ enabled: true, plan: SUPER_HERO_PRODUCT_NAME}, featureVimojoStore),
	Object.assign({ enabled: true, plan: SUPER_HERO_PRODUCT_NAME}, featureVimojoPlatform),
	Object.assign({ enabled: false, plan: SUPER_HERO_PRODUCT_NAME}, featureCloudBackup), // TODO(jliarte): 18/10/18 temporary disabled
	Object.assign({ enabled: true, plan: SUPER_HERO_PRODUCT_NAME}, featurePlatformPublishing),
	Object.assign({ enabled: true, plan: SUPER_HERO_PRODUCT_NAME}, featureFtpPublishing),
	Object.assign({ enabled: false, plan: SUPER_HERO_PRODUCT_NAME}, featureAds),
	Object.assign({ enabled: true, plan: SUPER_HERO_PRODUCT_NAME}, featureVoiceOver),
	Object.assign({ enabled: true, plan: SUPER_HERO_PRODUCT_NAME}, featureCameraPro),
	Object.assign({ enabled: true, plan: SUPER_HERO_PRODUCT_NAME}, featureSelectFR),
	Object.assign({ enabled: true, plan: SUPER_HERO_PRODUCT_NAME}, featureSelectResolution)];

module.exports = {
	FREE_PRODUCT_NAME, WITNESS_PRODUCT_NAME, JOURNALIST_PRODUCT_NAME, HERO_PRODUCT_NAME, SUPER_HERO_PRODUCT_NAME,
	plans,
	featureSet
};