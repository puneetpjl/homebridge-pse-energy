import fetch from 'node-fetch';

interface UsageData {
  electricityUsage?: number;
  gasUsage?: number;
  totalBill?: number;
  electricityBill?: number;
  gasBill?: number;
}

interface AgreementConfig {
  cookie: string;
  electricityAgreementId?: string;
  gasAgreementId?: string;
}

export class PSEClient {
  private readonly headers: Record<string, string>;

  constructor(private readonly config: AgreementConfig) {
    this.headers = {
      'Content-Type': 'application/json',
      'Cookie': this.config.cookie,
    };
  }

  async fetchUsageData(): Promise<UsageData> {
    const usageData: UsageData = {};
    const now = new Date().toISOString().split('T')[0];

    const query = `
      query($agreementIds: [ID!]!) {
        customerAgreements(agreementIds: $agreementIds) {
          agreementId
          usageSummary {
            currentUsage {
              value
              unit
            }
            projectedCost {
              value
              unit
            }
          }
        }
      }
    `;

    const agreementIds = [
      this.config.electricityAgreementId,
      this.config.gasAgreementId,
    ].filter(Boolean);

    const body = JSON.stringify({
      query,
      variables: { agreementIds },
    });

    const res = await fetch('https://pse.opower.com/ei/edge/apis/dsm-graphql-v1/cws/graphql', {
      method: 'POST',
      headers: this.headers,
      body,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    for (const agreement of json.data?.customerAgreements || []) {
      const usage = parseFloat(agreement.usageSummary?.currentUsage?.value || '0');
      const cost = parseFloat(agreement.usageSummary?.projectedCost?.value || '0');
      const id = agreement.agreementId;

      if (id === this.config.electricityAgreementId) {
        usageData.electricityUsage = usage;
        usageData.electricityBill = cost;
      } else if (id === this.config.gasAgreementId) {
        usageData.gasUsage = usage;
        usageData.gasBill = cost;
      }
    }

    usageData.totalBill = (usageData.electricityBill || 0) + (usageData.gasBill || 0);
    return usageData;
  }
}