import express, { Express } from 'express';
import { ChattyServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';
import { config } from '@root/config';
import Logger from 'bunyan';

const log: Logger = config.createLogger('app');
class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
    this.handleExit();
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }

  private handleExit(): void {
    process.on('uncaughtException', (error: Error) => {
      log.error(`There was an exception error ${error}`);
      Application.shutDownProperty(1)
    });

    process.on('unhandledRejection', (reason: Error) => {
      log.error(`Unhandled rejection at promise ${reason}`);
      Application.shutDownProperty(2)
    });

    process.on('SIGTERM', () => {
      log.error(`Caught SIGTERM`);
      Application.shutDownProperty(2)
    });

    process.on('SIGINT', () => {
      log.error(`Caught SIGINT`);
      Application.shutDownProperty(2)
    });

    process.on('exit', () => {
      log.error(`Exiting`);
    });
  }

  private static shutDownProperty(exitCode: number): void {
    Promise.resolve()
      .then(() => {
        log.info('Shutdown complete');
        process.exit(exitCode);
      }).catch((error) => {
        log.error(`Error during shutdown ${error}`);
        process.exit(1);
      })
  }
}

const application: Application = new Application();
application.initialize();
