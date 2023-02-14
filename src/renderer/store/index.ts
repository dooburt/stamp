import AppStore from './AppStore';

class Store {
  appStore = {};

  constructor() {
    this.appStore = new AppStore();
  }
}

const store = new Store();

export default store;
