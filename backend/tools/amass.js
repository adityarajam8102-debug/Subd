const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class AmassTool {
  static async run(domain, options = {}) {
    console.log(`[+] Running Amass for ${domain}`);
    
    const defaultOptions = {
      passive: true,
      timeout: 120000
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
      let command = `amass enum -d ${domain}`;
      
      if (config.passive) {
        command += ' -passive';
      }
      
      if (config.config) {
        command += ` -config ${config.config}`;
      }
      
      const { stdout, stderr } = await execAsync(command, { timeout: config.timeout });
      
      if (stderr && !stderr.includes('WARNING')) {
        console.error(`Amass stderr: ${stderr}`);
      }

      const subdomains = stdout
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line.includes(domain));

      console.log(`[+] Amass found ${subdomains.length} subdomains`);
      return subdomains;
    } catch (error) {
      console.error(`[-] Amass failed: ${error.message}`);
      return [];
    }
  }
}

module.exports = AmassTool;
