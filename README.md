# homebridge-pse-energy

Homebridge plugin to expose Puget Sound Energy (PSE) energy usage and billing data via the unofficial Opower API.

## Installation

```bash
npm install -g homebridge-pse-energy
```

## Configuration

```json
{
  "platform": "PSEEnergyPlatform",
  "username": "your_pse_username",
  "password": "your_pse_password",
  "pollingInterval": 3600
}
```