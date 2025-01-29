import { useState, useEffect } from 'react';
import { ethers, formatEther, parseEther } from 'ethers';
import abi from '../abi.json';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';

  useEffect(() => {
    getContractBalance();
  }, []);

  const getContract = async () => {
    if (!window.ethereum) {
      setMessage('Metamask is required to use this app.');
      return null;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, abi, signer);
  };

  const getContractBalance = async () => {
    try {
      const contract = await getContract();
      if (!contract) return;
      const balance = await contract.getBalance();
      setBalance(formatEther(balance));
    } catch (error) {
      setMessage(`Error getting balance: ${error.message}`);
    }
  };

  const handleDeposit = async () => {
    setLoading(true);
    setMessage('');
    try {
      const contract = await getContract();
      if (!contract) return;
      const parsedAmount = parseEther(amount);
      const tx = await contract.deposit(parsedAmount, { value: parsedAmount });
      await tx.wait();
      setMessage('Deposit successful!');
      getContractBalance();
      setAmount('');
    } catch (error) {
      setMessage(`Error depositing: ${error.message}`);
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setMessage('');
    try {
      const contract = await getContract();
      if (!contract) return;
      const parsedAmount = parseEther(amount);
      const tx = await contract.withdraw(parsedAmount);
      await tx.wait();
      setMessage('Withdrawal successful!');
      getContractBalance();
      setAmount('');
    } catch (error) {
      setMessage(`Error withdrawing: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DApp Dashboard</h1>
        {message && <div className="message-box">{message}</div>}
      </header>
      <main className="app-main">
        <section className="balance-section">
          <h2>Contract Balance</h2>
          <p>{balance} ETH</p>
          <button onClick={getContractBalance} disabled={loading} className="refresh-button">
            {loading ? 'Loading...' : 'Refresh Balance'}
          </button>
        </section>
        <section className="transaction-section">
          <h2>Make a Transaction</h2>
          <div className="form-group">
            <input
              type="number"
              placeholder="Enter amount (ETH)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
            />
            <div className="button-group">
              <button onClick={handleDeposit} disabled={loading || !amount} className="action-button deposit-button">
                {loading ? 'Processing...' : 'Deposit'}
              </button>
              <button onClick={handleWithdraw} disabled={loading || !amount} className="action-button withdraw-button">
                {loading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </section>
      </main>
      <footer className="app-footer">
        <p>Powered by Ethereum and ethers.js</p>
      </footer>
    </div>
  );
}

export default App;
