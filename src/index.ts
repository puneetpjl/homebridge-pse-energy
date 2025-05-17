import { API } from 'homebridge';
import { PSEEnergyPlatform } from './platform';

export = (api: API) => {
  api.registerPlatform('PSEEnergyPlatform', PSEEnergyPlatform);
};