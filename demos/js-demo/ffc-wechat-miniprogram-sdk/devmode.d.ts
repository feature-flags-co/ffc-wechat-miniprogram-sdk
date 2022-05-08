declare class DevMode {
    private password?;
    constructor();
    init(password: string): void;
    activateDevMode(password?: string): void;
    openEditor(): void;
    quit(): void;
}
declare const _default: DevMode;
export default _default;
