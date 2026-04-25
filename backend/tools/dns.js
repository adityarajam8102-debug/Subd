const dns = require('dns').promises;
const pLimit = require('p-limit').default || require('p-limit');

class DnsTool {
  static async run(domain, options = {}) {
    console.log(`[+] Running DNS brute force for ${domain}`);
    
    const defaultOptions = {
      concurrency: 10,
      timeout: 5000
    };
    
    const config = { ...defaultOptions, ...options };
    const limit = pLimit(config.concurrency);
    
    const commonSubdomains = [
      'www', 'mail', 'ftp', 'admin', 'test', 'dev', 'staging', 'api', 'app',
      'blog', 'shop', 'store', 'support', 'help', 'docs', 'wiki', 'forum',
      'news', 'media', 'cdn', 'static', 'assets', 'images', 'files', 'download',
      'panel', 'dashboard', 'portal', 'secure', 'vpn', 'remote', 'email',
      'webmail', 'smtp', 'pop', 'imap', 'ns1', 'ns2', 'mx', 'txt', 'cname',
      'blog', 'forum', 'news', 'shop', 'store', 'mobile', 'm', 'mobile',
      'old', 'new', 'beta', 'alpha', 'demo', 'preview', 'temp', 'tmp',
      'backup', 'db', 'database', 'sql', 'mysql', 'postgres', 'oracle',
      'cache', 'redis', 'memcache', 'search', 'elastic', 'solr', 'lucene',
      'monitor', 'metrics', 'stats', 'analytics', 'logs', 'syslog', 'kibana',
      'jenkins', 'ci', 'cd', 'build', 'deploy', 'git', 'svn', 'hg', 'vcs',
      'docker', 'k8s', 'kubernetes', 'swarm', 'rancher', 'nomad', 'consul',
      'vpn', 'openvpn', 'wireguard', 'ipsec', 'ssl', 'tls', 'cert', 'ca'
    ];

    const results = await Promise.allSettled(
      commonSubdomains.map(subdomain => 
        limit(async () => {
          const fullDomain = `${subdomain}.${domain}`;
          try {
            await dns.resolve(fullDomain);
            return fullDomain;
          } catch (error) {
            return null;
          }
        })
      )
    );

    const subdomains = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value);

    console.log(`[+] DNS brute force found ${subdomains.length} subdomains`);
    return subdomains;
  }
}

module.exports = DnsTool;
