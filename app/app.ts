import "reflect-metadata";
import {Container} from "inversify";
import Bootstrap from "./core/Bootstrap";
import {serverConfig} from "./config/ServerConfig";

export async function app() {
    try {
        const container: Container = (await import(`./core/ioc/container`)).default;
        const bootstrap = new Bootstrap(serverConfig, container);
        await bootstrap.init();
    } catch (e) {
        // tslint:disable-next-line:no-console
        console.error(e);
        process.exit();
    }
}
