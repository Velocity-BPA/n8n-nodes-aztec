# n8n-nodes-aztec

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Aztec Network, the privacy-focused Layer 2 solution for Ethereum using zero-knowledge proofs. Enables private transactions, confidential DeFi operations, and interaction with Noir smart contracts.

![n8n-nodes-aztec](https://img.shields.io/badge/n8n-community%20node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

## Features

- **Privacy-First Transactions**: Send and receive tokens privately using zero-knowledge proofs
- **Shield/Unshield Operations**: Convert between public and private token states
- **Note Management**: Full control over private notes (value representations in Aztec)
- **Private DeFi**: Confidential swaps and cross-chain bridges
- **Noir Contract Support**: Deploy and interact with privacy-preserving smart contracts
- **ZK Proof Operations**: Generate, verify, and manage zero-knowledge proofs
- **Network Monitoring**: Track rollup status, fees, and bridge statistics
- **Event Triggers**: Automated workflows based on blockchain events

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-aztec`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-aztec

# Restart n8n
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-aztec.zip
cd n8n-nodes-aztec

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-aztec

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-aztec %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

Configure the Aztec API credentials with the following parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| Network | Select | Choose from: mainnet, testnet, or custom |
| RPC Endpoint | String | Custom RPC endpoint URL (required if network is "custom") |
| Account Type | Select | Either "Spending" (full access) or "Viewing" (read-only) |
| Spending Key | Password | Your spending private key (for spending accounts) |
| Viewing Key | Password | Your viewing key (for viewing-only accounts) |
| Account Address | String | Your Aztec account address |

## Resources & Operations

### Account Management

| Operation | Description |
|-----------|-------------|
| Create Account | Generate a new Aztec account with derived keys |
| Get Account Info | Retrieve account details and balances |
| Get Account Keys | Get spending, viewing, and nullifier key pairs |
| Register Account | Register an account on-chain |
| Get Account Aliases | List named accounts |
| Recover Account | Restore account from viewing key |

### Private Tokens

| Operation | Description |
|-----------|-------------|
| Get Private Balance | Query hidden token balance |
| Shield Tokens | Convert public tokens to private |
| Unshield Tokens | Convert private tokens to public |
| Private Transfer | Send tokens privately to another address |
| Get Private History | View private transaction history |

### Public Tokens

| Operation | Description |
|-----------|-------------|
| Get Public Balance | Query visible token balance |
| Deposit | Move tokens from L1 to Aztec |
| Withdraw | Move tokens from Aztec to L1 |
| Public Transfer | Standard visible token transfer |

### Notes

| Operation | Description |
|-----------|-------------|
| Get Notes | List all notes for an account |
| Get Note By Commitment | Look up a specific note |
| Spend Note | Use a note in a transaction |
| Get Pending Notes | List uncommitted notes |
| Get Nullified Notes | List spent notes |

### Transactions

| Operation | Description |
|-----------|-------------|
| Get Transaction | Retrieve full transaction details |
| Get Transaction Status | Check confirmation status |
| Get Transaction Proof | Get the ZK proof for a transaction |
| Submit Transaction | Send a signed transaction |
| Estimate Fees | Calculate transaction costs |

### Private DeFi

| Operation | Description |
|-----------|-------------|
| Get Swap Quote | Get exchange rate for a token pair |
| Private Swap | Execute a confidential token swap |
| Private Bridge | Cross-chain transfer with privacy |
| Get Supported Pairs | List available trading pairs |

### Proofs

| Operation | Description |
|-----------|-------------|
| Generate Proof | Create a ZK proof for an operation |
| Verify Proof | Validate a ZK proof |
| Get Proof Status | Check proof generation progress |
| Get Proof Size | Get proof data size |

### Network

| Operation | Description |
|-----------|-------------|
| Get Rollup Status | Current block and network state |
| Get Fee Schedule | Current gas costs and fees |
| Get Pending Txs | View mempool transactions |
| Get Bridge Stats | Bridge usage statistics |

### Bridges (Aztec Connect)

| Operation | Description |
|-----------|-------------|
| Get Bridges | List available bridges |
| Get Bridge Info | Get bridge details and assets |
| Call Bridge | Execute a bridge action |
| Get Bridge Positions | View user positions |

### Noir Contracts

| Operation | Description |
|-----------|-------------|
| Deploy Contract | Upload and deploy a Noir contract |
| Call Contract | Execute a contract function |
| Get Contract State | Read contract storage |
| Get Contract Events | Query contract events |

### Utility

| Operation | Description |
|-----------|-------------|
| Derive Keys | Generate key pairs from master secret |
| Encrypt Note | Encrypt note data with viewing key |
| Decrypt Note | Decrypt note data |
| Get API Health | Check service status |

## Trigger Node

The Aztec Trigger node polls for blockchain events:

| Event | Description |
|-------|-------------|
| New Private Transaction | Triggers when a private transaction is confirmed |
| Shield/Unshield Event | Triggers on privacy state changes |
| Note Received | Triggers when a new note arrives |
| Rollup Published | Triggers when a new rollup batch is published |
| Bridge Completion | Triggers when a bridge action completes |

## Usage Examples

### Create Account and Shield Tokens

```javascript
// 1. Create new account
{
  "resource": "accounts",
  "operation": "createAccount"
}

// 2. Shield tokens (public → private)
{
  "resource": "privateTokens",
  "operation": "shieldTokens",
  "tokenAddress": "0x...",
  "amount": "1.0"
}
```

### Private Transfer

```javascript
{
  "resource": "privateTokens",
  "operation": "privateTransfer",
  "recipient": "0x...",
  "tokenAddress": "0x...",
  "amount": "0.5"
}
```

### Deploy Noir Contract

```javascript
{
  "resource": "noirContracts",
  "operation": "deployContract",
  "bytecode": "0x...",
  "constructorArgs": ["arg1", "arg2"]
}
```

## Aztec Network Concepts

| Concept | Description |
|---------|-------------|
| **Noir** | Aztec's domain-specific language for writing zero-knowledge circuits and smart contracts |
| **Note** | A private value representation; notes contain encrypted information about token ownership |
| **Nullifier** | A unique identifier that marks a note as "spent" without revealing which note |
| **Shield** | The process of converting public tokens to private (creating notes) |
| **Unshield** | The process of converting private tokens back to public (destroying notes) |
| **Rollup** | A batch of transactions proven with a single ZK proof and submitted to L1 |
| **Spending Key** | Private key used to authorize transactions (full account access) |
| **Viewing Key** | Key used to decrypt and view private transactions (read-only access) |
| **Aztec Connect** | The DeFi bridge system for interacting with L1 protocols privately |

## Networks

| Network | Description |
|---------|-------------|
| Mainnet | Production network (when available) |
| Testnet | Public test network for development |
| Custom | Connect to your own Aztec node |

## Error Handling

The node provides detailed error messages for common issues:

- **Invalid Key Format**: Keys must be 64-character hex strings with 0x prefix
- **Insufficient Balance**: Not enough tokens for the operation
- **Note Already Spent**: Attempting to use a nullified note
- **Proof Generation Failed**: ZK proof could not be created
- **Network Unavailable**: Unable to connect to Aztec RPC endpoint

Use n8n's built-in error handling to manage failures:

```javascript
// Enable "Continue On Fail" in node settings
// Check for errors in output:
if ($json.error) {
  // Handle error
}
```

## Security Best Practices

1. **Never share spending keys** - These provide full account access
2. **Use viewing keys for read-only operations** - Limits exposure if compromised
3. **Store credentials securely** - Use n8n's credential management
4. **Verify addresses carefully** - Aztec transactions are irreversible
5. **Test on testnet first** - Validate workflows before mainnet deployment
6. **Monitor proof generation** - Complex proofs may take time

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code:
- Passes all tests (`npm test`)
- Follows the existing code style (`npm run lint`)
- Includes appropriate documentation
- Respects the licensing requirements

## Support

- **Documentation**: [Aztec Network Docs](https://docs.aztec.network/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-aztec/issues)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)
- **Licensing Questions**: licensing@velobpa.com

## Acknowledgments

- [Aztec Network](https://aztec.network/) - Privacy-focused L2 infrastructure
- [n8n](https://n8n.io/) - Workflow automation platform
- [Noir Language](https://noir-lang.org/) - Zero-knowledge circuit language
