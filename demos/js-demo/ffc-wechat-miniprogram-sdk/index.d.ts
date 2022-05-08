import ffcClient, { Ffc } from './ffc';
export * from './types';
export { Ffc };
export default ffcClient;
declare global {
    var Page: any;
    var Component: any;
}
