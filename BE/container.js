import { createContainer, asClass, asValue, Lifetime } from 'awilix';

// import controllers
// import services
// import repositories

const container = createContainer();

export function setupContainer() {
  container.register({
    // controllers
    // services
    // repositories
  });
}

setupContainer();

export default container;
