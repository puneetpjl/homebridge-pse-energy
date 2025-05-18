import { Service, PlatformAccessory } from 'homebridge';
import { PSEEnergyPlatform } from './platform';
import { PSEClient } from './PSEClient';

export class PSEEnergyAccessory {
  private service: Service;
  private client: PSEClient;

  constructor(
    private readonly platform: PSEEnergyPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly config: {
      cookie: string;
      electricityAgreementId?: string;
      gasAgreementId?: string;
    }
  ) {
    this.client = new PSEClient(config);

    this.accessory.getService(this.platform.api.hap.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.api.hap.Characteristic.Manufacturer, 'PSE')
      .setCharacteristic(this.platform.api.hap.Characteristic.Model, 'Energy Monitor');

    this.service = this.accessory.getService(this.platform.api.hap.Service.TemperatureSensor)
      || this.accessory.addService(this.platform.api.hap.Service.TemperatureSensor);

    this.service.getCharacteristic(this.platform.api.hap.Characteristic.CurrentTemperature)
      .onGet(this.getEnergyUsage.bind(this));

    this.schedulePolling();
  }

  private async getEnergyUsage(): Promise<number> {
    try {
      const usage = await this.client.fetchUsageData();
      return usage.totalBill || 0;
    } catch (error) {
      this.platform.log.error('Failed to fetch usage:', error);
      return 0;
    }
  }

  private schedulePolling() {
    const intervalMs = this.platform.pollingInterval * 1000;
    setInterval(() => {
      this.getEnergyUsage().then(value => {
        this.service.updateCharacteristic(
          this.platform.api.hap.Characteristic.CurrentTemperature,
          value
        );
      });
    }, intervalMs);
  }
}