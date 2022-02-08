import bcryptjs from 'bcryptjs';
import nextConnect from 'next-connect';
import User from '../../../models/User';
import db from '../../../utils/db';
import { signToken } from '../../../utils/auth';

const handler = nextConnect();

handler.post(async (req, res) => {
  await db.connect();
  const user = await User.findOne({ email: req.body.email });
  await db.disconnect();
  if (user && bcryptjs.compareSync(req.body.password, user.password)) {
    const token = signToken(user);
    res.send({
      token: token,
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401).send({ message: 'Invalid email or password' });
  }
});

export default handler;
