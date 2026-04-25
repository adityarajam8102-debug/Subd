const axios = require('axios');

class CrtShTool {
  static async run(domain, options = {}) {
    console.log(`[+] Running crt.sh for ${domain}`);
    
    const defaultOptions = {
      timeout: 30000
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
      const url = `https://crt.sh/?q=%.${domain}&output=json`;
      const response = await axios.get(url, { timeout: config.timeout });
      
      if (!response.data || response.data.length === 0) {
        console.log(`[+] crt.sh found no results`);
        return [];
      }

      const subdomains = response.data
        .map(item => item.name_value)
        .join('\n')
        .split('\n')
        .map(line => line.trim().toLowerCase())
        .filter(line => line && line.includes(domain) && !line.startsWith('*.'));

      console.log(`[+] crt.sh found ${subdomains.length} subdomains`);
      return subdomains;
    } catch (error) {
      console.error(`[-] crt.sh failed: ${error.message}`);
      return [];
    }
  }
}

module.exports = CrtShTool;
