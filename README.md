# SecureAxis - Advanced Subdomain Reconnaissance Platform

A professional-grade subdomain enumeration and reconnaissance platform combining multiple tools and OWASP methodology.

## 🚀 Features

- **Multi-Tool Integration**: Amass, Subfinder, crt.sh, DNS Brute Force
- **Real-time Scanning**: Live progress updates and status indicators
- **Modern UI**: Clean white and orange hacker-themed interface
- **Export Functionality**: JSON export of scan results
- **Database Storage**: Supabase integration for scan history
- **Performance Optimized**: Parallel execution with concurrency control

## 📁 Project Structure

```
/secureaxis
├── frontend/          # Next.js 14 application
│   ├── app/
│   │   ├── page.tsx           # Home page with domain input
│   │   ├── dashboard/page.tsx # Results dashboard
│   │   └── api/scan/route.ts  # API endpoint
│   ├── components/            # Reusable components
│   ├── utils/supabase/        # Supabase configuration
│   └── ...
├── backend/           # Node.js reconnaissance engine
│   ├── scanner.js     # Main scanner class
│   ├── tools/         # Individual tool modules
│   │   ├── amass.js
│   │   ├── subfinder.js
│   │   ├── crt.js
│   │   └── dns.js
│   └── package.json
└── README.md
```

## 🔧 Installation

### Prerequisites

- Node.js 18+
- Go (for Amass and Subfinder)
- Git

### Setup

1. **Clone and install dependencies**:
```bash
cd secureaxis
npm run install:all
```

2. **Install reconnaissance tools**:
```bash
# Install Go if not already installed
# Then install the tools
go install github.com/owasp-amass/amass/v4/...@latest
go install github.com/projectdiscovery/subfinder/v2/...@latest
```

3. **Configure environment**:
```bash
# Edit frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. **Setup Supabase database**:
```sql
-- Create the scans table
CREATE TABLE scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  total INTEGER NOT NULL,
  alive INTEGER NOT NULL,
  results JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend scanner: Available via API

### Production Mode

```bash
npm run build
npm start
```

## 🔍 Usage

1. **Start a scan**:
   - Enter a domain name (e.g., example.com)
   - Click "Start Reconnaissance"
   - Wait for the scan to complete

2. **View results**:
   - Statistics dashboard with total/alive subdomains
   - Filter by status (all/alive/dead)
   - Search functionality
   - Export to JSON

3. **Tools used**:
   - **Amass**: Passive reconnaissance
   - **Subfinder**: Multiple source enumeration
   - **crt.sh**: Certificate transparency logs
   - **DNS Brute Force**: Common subdomain wordlist

## 🖥️ VPS Deployment

### Ubuntu Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Go
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Install reconnaissance tools
go install github.com/owasp-amass/amass/v4/...@latest
go install github.com/projectdiscovery/subfinder/v2/...@latest

# Clone and setup SecureAxis
git clone <repository-url>
cd secureaxis
npm run install:all

# Run with PM2 for production
npm install -g pm2
pm2 start npm --name "secureaxis" -- start
```

## 🔧 Configuration

### Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Scanner Configuration

The scanner can be configured in `backend/scanner.js`:

- **Concurrency**: Adjust `pLimit` value for parallel requests
- **Timeouts**: Modify tool-specific timeout values
- **Wordlist**: Update DNS brute force wordlist in `tools/dns.js`

## 🛠️ API Endpoints

### POST /api/scan

Start a new subdomain scan.

**Request**:
```json
{
  "domain": "example.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "domain": "example.com",
    "subdomains": ["api.example.com", "www.example.com"],
    "alive": ["api.example.com"],
    "total": 2,
    "aliveCount": 1,
    "scanId": "uuid"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## ⚠️ Disclaimer

This tool is for educational and authorized security testing purposes only. Users are responsible for ensuring they have proper authorization before scanning any domains.

## 🆘 Troubleshooting

### Common Issues

1. **Tools not found**:
   - Ensure Go is installed and in PATH
   - Verify tools are installed globally

2. **Supabase connection errors**:
   - Check environment variables
   - Verify Supabase URL and keys

3. **Scan timeouts**:
   - Increase timeout values in scanner.js
   - Check network connectivity

4. **Permission errors**:
   - Ensure proper file permissions
   - Run with appropriate user rights

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=secureaxis npm run dev
```

## 📊 Performance

- **Concurrent scans**: Up to 10 parallel operations
- **Timeout protection**: 5-minute maximum scan time
- **Memory efficient**: Streaming results processing
- **Rate limiting**: Built-in request throttling
