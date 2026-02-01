import { Container } from "inversify";
import { coreModule } from "./modules/coreModule";
import { useCaseModule } from "./modules/useCaseModule";
import { middlewareModule } from "./modules/middlewareModule";
import { controllerModule } from "./modules/controllerModule";

const container = new Container();

container.loadSync(
  coreModule,
  middlewareModule,
  useCaseModule,
  controllerModule,
);

export { container };
