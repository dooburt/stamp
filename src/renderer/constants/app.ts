/* eslint-disable no-shadow */
export const HEIGHT = 728;
export const WIDTH = 1024;
export const APPBAR_HEIGHT = 31;

export enum PeekabooStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
}

export interface PeekabooItem {
  id: string;
  friendlyName: string;
  secureName: string;
  originalLocation: string;
  peekabooLocation: string;
  color: string;
  diskSize: number;
  itemCount: number;
  status: PeekabooStatus;
}

export const emptyPeekaboo = {
  id: '',
  friendlyName: '',
  secureName: '',
  originalLocation: '',
  peekabooLocation: '',
  color: '',
  diskSize: 0,
  itemCount: 0,
  status: PeekabooStatus.LOCKED,
};
