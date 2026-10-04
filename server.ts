import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // Backend in-memory state representation & business invariants
  const organisationConfig = {
    id: 'org_recovery_losss_01',
    name: 'RECOVERY LOSSS Private Club',
    maxMembers: 500, // Rule 1: Configurable default 500 members
    currentMembers: 347,
    minDepositInr: 55, // Rule 7: ₹55 minimum
    minRequestInr: 55, // Rule 8: ₹55 minimum
    signupBonusCredits: 50, // Rule 6: 50 Game Credits
  };

  // 1. Organisation Config
  app.get('/api/organisation/config', (_req: Request, res: Response) => {
    res.json(organisationConfig);
  });

  // 2. Modular Payment Endpoints (Sandbox / Future Razorpay Architecture)
  // RULE 7: Minimum deposit amount = ₹55
  // RULE 12, 13: Secrets remain on server side only
  app.post('/api/payments/create-order', (req: Request, res: Response) => {
    const { userId, amountInInr } = req.body;
    const amount = Number(amountInInr);

    if (!amount || amount < 55) {
      return res.status(400).json({
        error: 'Minimum deposit amount is ₹55.',
        minRequired: 55,
      });
    }

    const orderId = `order_mock_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    res.json({
      orderId,
      userId,
      amountInInr: amount,
      creditsToAward: amount,
      currency: 'INR',
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      gateway: 'MOCK_SANDBOX',
      receipt: `rcpt_${Date.now()}`,
    });
  });

  app.post('/api/payments/verify', (req: Request, res: Response) => {
    const { orderId, amountInInr } = req.body;
    const amount = Number(amountInInr) || 100;

    res.json({
      success: true,
      orderId,
      paymentId: `pay_mock_${Date.now()}`,
      signature: `sig_sandbox_valid_${Date.now()}`,
      creditsAdded: amount,
      message: 'Demo / Sandbox payment confirmed. Virtual credits added to ledger.',
    });
  });

  // Future Razorpay Gateway Webhook Route
  app.post('/api/payments/razorpay/webhook', (req: Request, res: Response) => {
    const signature = req.headers['x-razorpay-signature'];
    console.log('[Server Webhook] Razorpay signature received:', signature);
    // When live secrets are configured in .env, verify crypto.createHmac('sha256', secret)
    res.json({ status: 'ok', received: true });
  });

  // 3. Request Validation
  // CRITICAL USER MANDATE:
  // "First deposit kiye bina koi bhi widro/request na kr sake"
  app.post('/api/requests/validate', (req: Request, res: Response) => {
    const { totalDepositsCount, amount } = req.body;

    if (!totalDepositsCount || Number(totalDepositsCount) <= 0) {
      return res.status(403).json({
        error: 'First deposit required: You must make at least one credit deposit before submitting withdrawal or settlement requests.',
        code: 'FIRST_DEPOSIT_REQUIRED',
      });
    }

    if (!amount || Number(amount) < 55) {
      return res.status(400).json({
        error: 'Minimum request amount is ₹55.',
        code: 'MINIMUM_AMOUNT_UNMET',
      });
    }

    res.json({ valid: true });
  });

  // 4. Server-Authoritative Game Calculation
  app.post('/api/games/resolve', (req: Request, res: Response) => {
    const { gameId, stake } = req.body;
    const stakeNum = Number(stake);
    if (!stakeNum || stakeNum <= 0) {
      return res.status(400).json({ error: 'Valid stake required' });
    }

    let result: 'WIN' | 'LOSS' = Math.random() < 0.48 ? 'WIN' : 'LOSS';
    let multiplier = result === 'WIN' ? 2 : 0;
    let payout = Math.round(stakeNum * multiplier * 100) / 100;

    res.json({
      gameId,
      result,
      multiplier,
      payout,
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware mounting in development
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RECOVERY LOSSS] Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
