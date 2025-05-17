import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig } from 'homebridge';
import { PSEEnergyAccessory } from './accessory';

export class PSEEnergyPlatform implements DynamicPlatformPlugin {
  private readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.platform);
    this.api.on('didFinishLaunching', () => this.discoverDevices());
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.accessories.push(accessory);
  }

  async discoverDevices() {
  const uuid = this.api.hap.uuid.generate('pse-energy-usage'); // ✅ Proper UUID
  const accessory = new this.api.platformAccessory('Current Energy Usage', uuid);
  new PSEEnergyAccessory(this, accessory);
  this.api.registerPlatformAccessories('homebridge-pse-energy', 'PSEEnergyPlatform', [accessory]);
}
}