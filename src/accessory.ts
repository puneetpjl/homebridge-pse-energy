import { Service, PlatformAccessory } from 'homebridge';
import { PSEEnergyPlatform } from './platform';
import { PSEClient } from './PSEClient';

export type AccessoryType = 'electricity' | 'gas' | 'total';

interface PSEAccessoryOptions {
  cookie: string;
  electricityAgreementId?: string;
  gasAgreementId?: string;
  type: AccessoryType;
}

export class PSEEnergyAccessory {
  private service: Service;
  private client: PSEClient;

  constructor(
    private readonly platform: PSEEnergyPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly options: PSEAccessoryOptions,
  ) {
    this.client = new PSEClient(options);

    const info = this.accessory.getService(this.platform.api.hap.Service.AccessoryInformation)!;
    info.setCharacteristic(this.platform.api.hap.Characteristic.Manufacturer, 'PSE')
        .setCharacteristic(this.platform.api.hap.Characteristic.Model, `PSE ${options.type}`);

    this.service = this.accessory.getService(this.platform.api.hap.Service.TemperatureSensor)
        || this.accessory.addService(this.platform.api.hap.Service.TemperatureSensor);

    this.service.setCharacteristic(this.platform.api.hap.Characteristic.Name, `${options.type} usage`);

    this.service.getCharacteristic(this.platform.api.hap.Characteristic.CurrentTemperature)
        .onGet(this.getValue.bind(this));
  }

  async getValue(): Promise<number> {
    const data = await this.client.fetchUsageData();

    switch (this.options.type) {
      case 'electricity':
        return data.electricityUsage ?? 0;
      case 'gas':
        return data.gasUsage ?? 0;
      case 'total':
        return data.totalBill ?? 0;
      default:
        return 0;
    }
  }
}