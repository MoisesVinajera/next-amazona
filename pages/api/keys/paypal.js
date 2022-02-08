import nextConnect from 'next-connect';
import { isAuth } from '../../../utils/auth';

const handler = nextConnect();
handler.use(isAuth);
handler.get(async (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

export default handler;
