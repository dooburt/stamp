/* eslint-disable lines-between-class-members */
import { makeObservable, observable, action } from 'mobx';

class AppStore {
  language = 'en';
  avatar = 0;

  constructor() {
    makeObservable(this, {
      language: observable,
      avatar: observable,
      setLanguage: action,
      setAvatar: action,
    });
  }

  get getLanguage() {
    return this.language;
  }

  get getAvatar() {
    return this.avatar;
  }

  setLanguage(value: string) {
    this.language = value;
  }

  setAvatar(value: number) {
    this.avatar = value;
  }
}

export default AppStore;
