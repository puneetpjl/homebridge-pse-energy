import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig } from 'homebridge';
import { PSEEnergyAccessory } from './accessory';

export class PSEEnergyPlatform implements DynamicPlatformPlugin {
  private readonly accessories: PlatformAccessory[] = [];
  private readonly pollingInterval: number;
  private readonly cookie: string;
  private readonly electricityAgreementId?: string;
  private readonly gasAgreementId?: string;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.platform);
    this.pollingInterval = this.config.pollingInterval || 43200;
    this.cookie = this.config.cookie || '';
    this.electricityAgreementId = this.config.electricityAgreementId;
    this.gasAgreementId = this.config.gasAgreementId;
    this.api.on('didFinishLaunching', () => this.discoverDevices());
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.accessories.push(accessory);
  }

  async discoverDevices() {
  const uuid = this.api.hap.uuid.generate('pse-energy-usage'); // ✅ Proper UUID
  const accessory = new this.api.platformAccessory('Current Energy Usage', uuid);
 
  new PSEEnergyAccessory(this, accessory, {
    cookie: this.cookie,
    electricityAgreementId: this.electricityAgreementId,
    gasAgreementId: this.gasAgreementId,
  });

  this.api.registerPlatformAccessories('homebridge-pse-energy', 'PSEEnergyPlatform', [accessory]);
}
}