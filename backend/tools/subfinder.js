const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class SubfinderTool {
  static async run(domain, options = {}) {
    console.log(`[+] Running Subfinder for ${domain}`);
    
    const defaultOptions = {
      timeout: 60000
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
      let command = `subfinder -d ${domain}`;
      
      if (config.sources) {
        command += ` -sources ${config.sources}`;
      }
      
      if (config.excludeSources) {
        command += ` -exclude-sources ${config.excludeSources}`;
      }
      
      if (config.all) {
        command += ' -all';
      }
      
      const { stdout, stderr } = await execAsync(command, { timeout: config.timeout });
      
      if (stderr && !stderr.includes('WARNING')) {
        console.error(`Subfinder stderr: ${stderr}`);
      }

      const subdomains = stdout
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && line.includes(domain));

      console.log(`[+] Subfinder found ${subdomains.length} subdomains`);
      return subdomains;
    } catch (error) {
      console.error(`[-] Subfinder failed: ${error.message}`);
      return [];
    }
  }
}

module.exports = SubfinderTool;
