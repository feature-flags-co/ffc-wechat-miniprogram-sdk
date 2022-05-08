declare global {
    interface Window {
        WebKitMutationObserver: any;
        MozMutationObserver: any;
    }
}
declare class AutoCapture {
    constructor();
    init(): Promise<void>;
    private capturePageViews;
    private trackZeroCodingAndClicks;
    private bindClickHandlers;
    private zeroCodeSettingsCheckVariation;
    private revertRules;
    private applyRules;
    private showOrModifyElements;
}
declare const _default: AutoCapture;
export default _default;
