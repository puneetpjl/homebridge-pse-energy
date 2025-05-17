import { Service, PlatformAccessory } from 'homebridge';
import { PSEEnergyPlatform } from './platform';

export class PSEEnergyAccessory {
  private service: Service;

  constructor(
    private readonly platform: PSEEnergyPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.accessory.getService(this.platform.api.hap.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.api.hap.Characteristic.Manufacturer, 'PSE')
      .setCharacteristic(this.platform.api.hap.Characteristic.Model, 'Energy Monitor');

    this.service = this.accessory.getService(this.platform.api.hap.Service.TemperatureSensor)
      || this.accessory.addService(this.platform.api.hap.Service.TemperatureSensor);

    this.service.getCharacteristic(this.platform.api.hap.Characteristic.CurrentTemperature)
      .onGet(this.getEnergyUsage.bind(this));
  }

  async getEnergyUsage(): Promise<number> {
    return 42.0; // placeholder value
  }
}